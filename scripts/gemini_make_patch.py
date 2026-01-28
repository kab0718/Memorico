# scripts/gemini_make_patch.py
from __future__ import annotations

import json
import os
import random
import re
import time
from pathlib import Path
from typing import Any, Dict, List, Tuple

import requests

API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
TASK = os.environ.get("TASK", "").strip()
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

if not API_KEY:
    raise SystemExit("GEMINI_API_KEY is missing")
if not TASK:
    raise SystemExit("TASK is missing")

ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{MODEL}:generateContent?key={requests.utils.quote(API_KEY)}"
)

ARTIFACTS_DIR = Path("artifacts")
ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)


def parse_retry_delay_seconds(err_text: str) -> float | None:
    m = re.search(r'"retryDelay"\s*:\s*"(\d+)s"', err_text)
    if m:
        return float(m.group(1))
    m = re.search(r"Please retry in ([0-9.]+)s", err_text)
    if m:
        return float(m.group(1))
    return None


def gemini_generate(system: str, user: str, max_output_tokens: int = 3000) -> str:
    body = {
        "contents": [{"role": "user", "parts": [{"text": f"{system}\n\n{user}"}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": max_output_tokens,
        },
    }

    retry_statuses = {429, 500, 502, 503, 504}
    max_attempts = int(os.environ.get("GEMINI_MAX_ATTEMPTS", "2"))  # keep cheap
    base_sleep = float(os.environ.get("GEMINI_RETRY_BASE_SLEEP", "1.0"))

    last_err: Exception | None = None

    for attempt in range(1, max_attempts + 1):
        try:
            res = requests.post(
                ENDPOINT,
                headers={"Content-Type": "application/json"},
                data=json.dumps(body),
                timeout=180,
            )

            if res.status_code in retry_statuses:
                # Prefer server-provided retry delay if any
                delay = parse_retry_delay_seconds(res.text)
                if delay is None:
                    delay = min(base_sleep * (2 ** (attempt - 1)), 20.0) + random.uniform(0, 0.5)

                msg = f"Gemini API transient error: {res.status_code} {res.text}"
                last_err = RuntimeError(msg)

                if attempt == max_attempts:
                    break

                print(f"[gemini] attempt {attempt}/{max_attempts} failed: {msg}")
                print(f"[gemini] retrying in {delay:.2f}s...")
                time.sleep(min(delay, 30.0))
                continue

            if not res.ok:
                raise RuntimeError(f"Gemini API error: {res.status_code} {res.text}")

            data = res.json()
            parts = (data.get("candidates") or [{}])[0].get("content", {}).get("parts", [])
            text = "".join(p.get("text", "") for p in parts)
            if not text.strip():
                raise RuntimeError("Empty Gemini output")
            return text

        except (requests.RequestException, RuntimeError) as e:
            last_err = e
            if attempt == max_attempts:
                break
            delay = min(base_sleep * (2 ** (attempt - 1)), 20.0) + random.uniform(0, 0.5)
            print(f"[gemini] attempt {attempt}/{max_attempts} failed: {e}")
            print(f"[gemini] retrying in {delay:.2f}s...")
            time.sleep(delay)

    raise RuntimeError(f"Gemini API failed after {max_attempts} attempts: {last_err}")


def extract_json(text: str) -> Dict[str, Any]:
    """
    Extract the first valid JSON object from a possibly noisy LLM output.
    Accepts:
        - ```json ... ```
        - ``` ... ``` (no language)
        - Plain text with embedded {...}
    """
    fences = re.findall(r"```(?:json|JSON)?\s*([\s\S]*?)```", text)
    candidates = [c.strip() for c in fences if c.strip()]
    candidates.append(text.strip())

    for cand in candidates:
        try:
            obj = json.loads(cand)
            if isinstance(obj, dict):
                return obj
        except Exception:
            pass

    s = text
    start_positions = [m.start() for m in re.finditer(r"\{", s)]
    for start in start_positions:
        depth = 0
        for end in range(start, len(s)):
            ch = s[end]
            if ch == "{":
                depth += 1
            elif ch == "}":
                depth -= 1
                if depth == 0:
                    snippet = s[start : end + 1].strip()
                    try:
                        obj = json.loads(snippet)
                        if isinstance(obj, dict):
                            return obj
                    except Exception:
                        break

    raise RuntimeError("Could not parse JSON from Gemini output")


def sanitize_path(path: str) -> str:
    path = path.strip().lstrip("/")
    norm = Path(path)
    if ".." in norm.parts:
        raise RuntimeError(f"Path traversal is not allowed: {path}")
    return norm.as_posix()


def apply_files(files: List[Dict[str, Any]]) -> Tuple[int, List[str]]:
    changed: List[str] = []
    count = 0

    # Light guardrails to avoid ridiculous output
    if len(files) > 25:
        raise RuntimeError(f"Too many files in output: {len(files)} (max 25)")

    for f in files:
        if not isinstance(f, dict):
            continue
        path = f.get("path")
        content = f.get("content")
        if not isinstance(path, str) or not isinstance(content, str):
            continue

        path = sanitize_path(path)

        # Avoid touching git internals / workflows even in "free" mode
        if path.startswith(".git/") or path.startswith(".github/"):
            continue

        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)

        # Size cap to avoid accidental mega writes
        if len(content) > 200_000:
            raise RuntimeError(f"File too large: {path} ({len(content)} bytes)")

        old = p.read_text(encoding="utf-8", errors="replace") if p.exists() else None
        new = content.rstrip("\n") + "\n"

        if old != new:
            p.write_text(new, encoding="utf-8")
            changed.append(path)
            count += 1

    return count, changed


def build_fixed_context() -> str:
    """
    Pick-free context builder:
    - Always include package.json and README.md if present
    - Include first N source files under src/ to give the model some grounding
    """
    selected: List[str] = []
    for f in ["package.json", "README.md", "tsconfig.json", "vite.config.ts"]:
        if Path(f).exists():
            selected.append(f)

    src_files: List[str] = []
    src_root = Path("src")
    max_src_files = int(os.environ.get("GEMINI_CONTEXT_MAX_FILES", "50"))
    if src_root.exists():
        for p in src_root.rglob("*"):
            if not p.is_file():
                continue
            if p.suffix.lower() in {".ts", ".tsx", ".css", ".scss", ".json", ".md"}:
                src_files.append(p.as_posix())
            if len(src_files) >= max_src_files:
                break

    selected.extend(src_files)

    parts: List[str] = []
    max_chars_per_file = int(os.environ.get("GEMINI_CONTEXT_MAX_CHARS", "24000"))
    for s in selected:
        p = Path(s)
        try:
            txt = p.read_text(encoding="utf-8", errors="replace")
        except Exception:
            continue
        if len(txt) > max_chars_per_file:
            txt = txt[:max_chars_per_file] + "\n/* truncated */\n"
        parts.append(f"--- file: {s}\n{txt}")

    return "\n\n".join(parts)


def main() -> None:
    # Build a small fixed context (no pick step)
    context = build_fixed_context()

    system_gen = """\
You are editing an existing codebase.
Output ONLY JSON in this schema:
{
    "files": [
        {"path": "relative/path/to/file", "content": "complete new file content"},
        ...
    ],
    "summary": "what you changed"
}

Rules:
- "content" must be the COMPLETE file content (not a diff).
- Use forward slashes (/) in paths.
- Keep changes focused on TASK.
- Do not include markdown outside JSON.
- files should contain at least ONE entry; if you think no changes are needed, still return one relevant file with its current content.
- You MUST make an actual change to the repository based on TASK. Do not return unchanged files.
- Prefer editing existing files under src/ (e.g., App.tsx, main.tsx, or styles).
""".strip()

    user_gen = f"""\
TASK:
{TASK}

CONTEXT FILES:
{context}
""".strip()

    try:
        gen_raw = gemini_generate(system_gen, user_gen, max_output_tokens=3000)
    except RuntimeError as e:
        # If quota/rate-limited, treat as no-op to keep the job green (optional)
        msg = str(e)
        if "RESOURCE_EXHAUSTED" in msg or "429" in msg:
            print("Gemini quota/rate limit hit; treating as no-op.")
            (ARTIFACTS_DIR / "changed_files.json").write_text(
                json.dumps({"count": 0, "changed": [], "summary": "", "note": "rate-limited"}, ensure_ascii=False, indent=2),
                encoding="utf-8",
            )
            return
        raise

    (ARTIFACTS_DIR / "gemini_raw.txt").write_text(gen_raw, encoding="utf-8")
    log_len = int(os.environ.get("GEMINI_LOG_RAW_CHARS", "4000"))
    if log_len > 0:
        snippet = gen_raw[:log_len].rstrip()
        print("=== gemini_raw (head) ===")
        print(snippet)
        if len(gen_raw) > log_len:
            print("=== gemini_raw truncated ===")

    out = extract_json(gen_raw)
    files = out.get("files", [])
    if not isinstance(files, list) or not files:
        # No-op rather than failing hard (keeps PoC resilient)
        (ARTIFACTS_DIR / "changed_files.json").write_text(
            json.dumps({"count": 0, "changed": [], "summary": out.get("summary", ""), "note": "no files returned"}, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )
        print("No files returned by Gemini; treating as no-op.")
        return

    count, changed = apply_files(files)

    (ARTIFACTS_DIR / "changed_files.json").write_text(
        json.dumps(
            {"count": count, "changed": changed, "summary": out.get("summary", "")},
            ensure_ascii=False,
            indent=2,
        ),
        encoding="utf-8",
    )

    print(f"Applied changes to {count} file(s).")
    for p in changed:
        print(f"- {p}")


if __name__ == "__main__":
    main()
