# scripts/gemini_make_patch.py
from __future__ import annotations

import json
import os
import re
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


def gemini_generate(system: str, user: str, max_output_tokens: int = 4000) -> str:
    body = {
        "contents": [{"role": "user", "parts": [{"text": f"{system}\n\n{user}"}]}],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": max_output_tokens,
        },
    }
    res = requests.post(
        ENDPOINT,
        headers={"Content-Type": "application/json"},
        data=json.dumps(body),
        timeout=180,
    )
    if not res.ok:
        raise RuntimeError(f"Gemini API error: {res.status_code} {res.text}")
    data = res.json()
    parts = (data.get("candidates") or [{}])[0].get("content", {}).get("parts", [])
    text = "".join(p.get("text", "") for p in parts)
    if not text.strip():
        raise RuntimeError("Empty Gemini output")
    return text


def list_repo_files(limit: int = 1200) -> List[str]:
    """List repo files to help the model choose what to edit."""
    skip_dirs = {".git", "node_modules", "dist", "build", ".next", ".turbo", ".cache"}
    out: List[str] = []
    for p in Path(".").rglob("*"):
        if p.is_dir():
            continue
        if any(part in skip_dirs for part in p.parts):
            continue
        # keep list manageable
        out.append(p.as_posix())
        if len(out) >= limit:
            break
    return out


def read_file_for_context(path: str, limit: int = 16000) -> str:
    p = Path(path)
    if not p.exists() or p.is_dir():
        return ""
    txt = p.read_text(encoding="utf-8", errors="replace")
    if len(txt) > limit:
        return txt[:limit] + "\n/* truncated */\n"
    return txt


def extract_json(text: str) -> Dict[str, Any]:
    """
    Extract the first valid JSON object from a possibly noisy LLM output.
    Accepts:
		- ```json ... ```
		- ``` ... ``` (no language)
		- Plain text with embedded {...}
    """
    # 1) Prefer fenced blocks (json / JSON / no-lang)
    fences = re.findall(r"```(?:json|JSON)?\s*([\s\S]*?)```", text)
    candidates = [c.strip() for c in fences if c.strip()]

    # 2) Also try raw text as candidate
    candidates.append(text.strip())

    # Try strict parse on candidates first
    for cand in candidates:
        try:
            return json.loads(cand)
        except Exception:
            pass

    # 3) Fallback: scan for a parseable JSON object by brace matching
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
                        break  # give up this start, try next

    raise RuntimeError("Could not parse JSON from Gemini output")


def sanitize_path(path: str) -> str:
    # prevent directory traversal; keep it repo-relative
    path = path.strip().lstrip("/")

    # normalize and reject traversal
    norm = Path(path)
    if ".." in norm.parts:
        raise RuntimeError(f"Path traversal is not allowed: {path}")

    return norm.as_posix()


def apply_files(files: List[Dict[str, Any]]) -> Tuple[int, List[str]]:
    changed: List[str] = []
    count = 0

    # very light guardrails to avoid ridiculous output
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

        # avoid touching .git and workflow stuff even in "free" mode
        if path.startswith(".git/") or path.startswith(".github/workflows/"):
            continue

        p = Path(path)
        p.parent.mkdir(parents=True, exist_ok=True)

        # size cap to avoid accidental mega writes
        if len(content) > 200_000:
            raise RuntimeError(f"File too large: {path} ({len(content)} bytes)")

        old = p.read_text(encoding="utf-8", errors="replace") if p.exists() else None
        new = content.rstrip("\n") + "\n"

        if old != new:
            p.write_text(new, encoding="utf-8")
            changed.append(path)
            count += 1

    return count, changed


def main() -> None:
    all_files = list_repo_files()
    # Ask model to choose up to 8 files to read
    system_pick = """\
Pick up to 8 relevant files to edit for the given TASK.
Return ONLY JSON:
{"files":["path1","path2",...], "notes":"short"}
Rules:
- Only pick from the provided file list.
- Keep it small.
- Return ONLY JSON. No prose. No markdown fences. No backticks.
""".strip()

    user_pick = f"TASK:\n{TASK}\n\nFILES:\n" + "\n".join(all_files)
    pick_raw = gemini_generate(system_pick, user_pick, max_output_tokens=800)

    try:
        pick_json = extract_json(pick_raw)
    except Exception:
        # pickは失敗しても良い。とりあえず動かす。
        pick_json = {"files": ["README.md", "package.json"], "notes": "fallback: pick parse failed"}
    
    selected = pick_json.get("files", [])
    if not isinstance(selected, list) or not selected:
        selected = ["README.md", "package.json"]

    selected = [s for s in selected[:8] if isinstance(s, str)]
    context_parts: List[str] = []
    for s in selected:
        s2 = s.strip()
        if not s2:
            continue
        content = read_file_for_context(s2)
        if content:
            context_parts.append(f"--- file: {s2}\n{content}")

    # Now generate "files to write" as JSON
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
""".strip()

    user_gen = f"""\
TASK:
{TASK}

CONTEXT FILES:
{chr(10).join(context_parts)}
""".strip()

    gen_raw = gemini_generate(system_gen, user_gen, max_output_tokens=4000)

    # Save raw output for debugging
    (ARTIFACTS_DIR / "gemini_raw.txt").write_text(gen_raw, encoding="utf-8")

    out = extract_json(gen_raw)
    files = out.get("files", [])
    if not isinstance(files, list) or not files:
        raise RuntimeError("Gemini returned no files to write")

    count, changed = apply_files(files)

    (ARTIFACTS_DIR / "changed_files.json").write_text(
        json.dumps({"count": count, "changed": changed, "summary": out.get("summary", "")}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"Applied changes to {count} file(s).")
    for p in changed:
        print(f"- {p}")


if __name__ == "__main__":
    main()
