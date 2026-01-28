# scripts/gemini_make_patch.py
from __future__ import annotations

import json
import os
import re
import subprocess
from pathlib import Path
from typing import List, Dict, Any

import requests

API_KEY = os.environ.get("GEMINI_API_KEY", "").strip()
TASK = os.environ.get("TASK", "").strip()

if not API_KEY:
    raise SystemExit("GEMINI_API_KEY is missing")
if not TASK:
    raise SystemExit("TASK is missing")

# Cheap/fast model for PoC. If Google changes model names, switch to a current Flash model.
MODEL = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")

ENDPOINT = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{MODEL}:generateContent?key={requests.utils.quote(API_KEY)}"
)

ARTIFACTS_DIR = Path("artifacts")
PATCH_PATH = ARTIFACTS_DIR / "ai.patch"


def run(cmd: List[str], check: bool = True) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=check, text=True, capture_output=False)


def read_text(path: Path, limit: int = 12000) -> str:
    txt = path.read_text(encoding="utf-8", errors="replace")
    if len(txt) > limit:
        return txt[:limit] + "\n/* truncated */\n"
    return txt


def list_candidate_files(repo_root: Path) -> List[str]:
    out: List[str] = []

    skip_dirs = {"node_modules", "dist", ".git", ".next", ".turbo", "build", ".cache"}
    allow_ext = {".ts", ".tsx", ".md", ".json", ".css", ".scss", ".yml", ".yaml"}

    for p in repo_root.rglob("*"):
        if p.is_dir():
            # rglob doesn't allow pruning directly, so skip by continuing on files only.
            continue

        parts = set(p.parts)
        if parts & skip_dirs:
            continue

        if p.name in {"package-lock.json", "yarn.lock", "pnpm-lock.yaml"}:
            continue

        # Keep prompt small: focus on src + a few top-level config/docs.
        if p.parts[0] == "src":
            if p.suffix in allow_ext or p.name in {"index.html"}:
                out.append(str(p.as_posix()))
            continue

        if p.name in {"package.json", "README.md", "tsconfig.json", "vite.config.ts"}:
            out.append(str(p.as_posix()))
            continue

        # Allow a small number of config files if needed
        if p.suffix in {".yml", ".yaml"} and ".github/workflows" not in p.as_posix():
            out.append(str(p.as_posix()))
            continue

    return out[:800]


def gemini_generate(system: str, user: str, max_output_tokens: int = 2400) -> str:
    body = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": f"{system}\n\n{user}"}],
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": max_output_tokens,
        },
    }

    res = requests.post(
        ENDPOINT,
        headers={"Content-Type": "application/json"},
        data=json.dumps(body),
        timeout=120,
    )
    if not res.ok:
        raise RuntimeError(f"Gemini API error: {res.status_code} {res.text}")

    data = res.json()
    parts = (data.get("candidates") or [{}])[0].get("content", {}).get("parts", [])
    text = "".join(p.get("text", "") for p in parts)
    if not text.strip():
        raise RuntimeError("Empty Gemini output")
    return text


def extract_json_object(text: str) -> Dict[str, Any] | None:
    # Try parse first JSON object in text
    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        snippet = text[start : end + 1]
        try:
            return json.loads(snippet)
        except Exception:
            return None
    return None


def extract_diff(text: str) -> str:
    # Prefer fenced diff
    m = re.search(r"```diff\s*([\s\S]*?)```", text)
    if m:
        candidate = m.group(1).strip()
    else:
        candidate = text.strip()

    idx = candidate.find("diff --git")
    if idx >= 0:
        return candidate[idx:].strip()

    # Sometimes the model returns a patch without 'diff --git' -> reject
    raise RuntimeError("Invalid patch: missing 'diff --git' header.")


def main() -> None:
    repo_root = Path(".")
    files = list_candidate_files(repo_root)

    system_pick = """\
You are a senior software engineer working on a Vite+React+TypeScript project.
Select up to 8 relevant existing files to read before proposing a patch.
Return ONLY JSON with this schema:
{
	"files": ["path1","path2",...],
	"notes": "short"
}
Rules:
- Only choose from the provided file list.
- Prefer minimal set.
- Do not include node_modules, dist, lockfiles, or .github/workflows.
""".strip()

    user_pick = f"""\
TASK:
{TASK}

AVAILABLE FILES (choose from):
{chr(10).join(files)}
""".strip()

    pick_raw = gemini_generate(system_pick, user_pick, max_output_tokens=600)
    pick = extract_json_object(pick_raw) or {"files": ["package.json", "README.md"], "notes": "fallback"}
    selected = pick.get("files") if isinstance(pick, dict) else None
    if not isinstance(selected, list) or not selected:
        selected = ["package.json", "README.md"]
    selected = [str(x) for x in selected[:8] if isinstance(x, str)]

    context_chunks: List[str] = []
    for f in selected:
        p = Path(f)
        if not p.exists() or p.is_dir():
            continue
        txt = read_text(p)
        context_chunks.append(f"--- file: {p.as_posix()}\n{txt}")

    system_diff = """\
Output a SINGLE git-style unified diff that is directly applyable via `git apply`.
Hard requirements:
- The output MUST start with a line like: diff --git a/<path> b/<path>
- Do NOT wrap the diff in markdown fences (no ```diff).
- Include complete file headers for new files: diff --git ... + new file mode 100644 + index ... + --- /dev/null + +++ b/<path>
- Use repo-root relative paths with forward slashes (/).
- Do NOT change lockfiles and do NOT modify .github/workflows.
- Keep changes minimal and directly related to the TASK.
""".strip()

    user_diff = f"""\
TASK:
{TASK}

FILES YOU CAN EDIT (from context; you may also add new TS/TSX files under src/ if needed):
{chr(10).join(context_chunks)}
""".strip()

    diff_raw = gemini_generate(system_diff, user_diff, max_output_tokens=2400)
    diff_text = extract_diff(diff_raw)

    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    PATCH_PATH.write_text(diff_text + "\n", encoding="utf-8")

    # Apply patch
    try:
        # まずチェックだけ（これが一番情報を出してくれる）
        subprocess.run(
            ["git", "apply", "--check", str(PATCH_PATH)],
            check=True,
            text=True,
            capture_output=True,
        )
    except subprocess.CalledProcessError as e:
        print("\n--- git apply --check failed ---\n")
        print("STDOUT:\n", e.stdout or "")
        print("STDERR:\n", e.stderr or "")
        print("\n--- Generated patch ---\n")
        print(PATCH_PATH.read_text(encoding="utf-8", errors="replace"))
        raise

    try:
        subprocess.run(
            ["git", "apply", "--whitespace=fix", str(PATCH_PATH)],
            check=True,
            text=True,
            capture_output=True,
        )
    except subprocess.CalledProcessError as e:
        print("\n--- git apply failed ---\n")
        print("STDOUT:\n", e.stdout or "")
        print("STDERR:\n", e.stderr or "")
        print("\n--- Generated patch ---\n")
        print(PATCH_PATH.read_text(encoding="utf-8", errors="replace"))
        raise



if __name__ == "__main__":
    main()
