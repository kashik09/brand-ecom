#!/usr/bin/env python3
# repo_audit.py
# Deep repo report: git metadata, commit analytics, churn, debt, secrets, size, optional audits.
# Works with only Python + git CLI. Optional: npm, pip-audit.

import argparse
import json
import os
import re
import shutil
import subprocess
import sys
import time
from collections import Counter, defaultdict
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple, Optional

HERE = Path.cwd()

def run(cmd: List[str], cwd: Optional[Path] = None, timeout: int = 120) -> Tuple[int, str, str]:
    try:
        p = subprocess.run(cmd, cwd=str(cwd or HERE), capture_output=True, text=True, timeout=timeout)
        return p.returncode, p.stdout.strip(), p.stderr.strip()
    except Exception as e:
        return 1, "", str(e)

def in_git_repo() -> bool:
    rc, out, _ = run(["git", "rev-parse", "--is-inside-work-tree"])
    return rc == 0 and out == "true"

def git_config_value(key: str) -> Optional[str]:
    rc, out, _ = run(["git", "config", "--get", key])
    return out if rc == 0 and out else None

def repo_metadata() -> Dict:
    data = {}
    fields = {
        "git_dir": ["git", "rev-parse", "--git-dir"],
        "work_tree": ["git", "rev-parse", "--show-toplevel"],
        "current_branch": ["git", "rev-parse", "--abbrev-ref", "HEAD"],
        "head_sha": ["git", "rev-parse", "HEAD"],
        "tag_count": ["bash", "-lc", "git tag | wc -l"],
        "last_commit_date": ["git", "log", "-1", "--date=iso-strict", "--pretty=%ad"],
        "commit_count": ["bash", "-lc", "git rev-list --count HEAD"],
    }
    for k, cmd in fields.items():
        rc, out, err = run(cmd)
        data[k] = out if rc == 0 else None

    # remotes
    rc, out, _ = run(["git", "remote", "-v"])
    remotes = {}
    if rc == 0:
        for line in out.splitlines():
            parts = line.split()
            if len(parts) >= 2:
                name, url = parts[0], parts[1]
                remotes.setdefault(name, set()).add(url)
    data["remotes"] = {k: sorted(v) for k, v in remotes.items()}

    # default branch (best-effort)
    default = git_config_value("init.defaultBranch") or "main"
    # Try origin HEAD
    rc, out, _ = run(["git", "symbolic-ref", "refs/remotes/origin/HEAD"])
    if rc == 0 and out:
        default = out.rsplit("/", 1)[-1]
    data["default_branch"] = default

    return data

COMMIT_TYPE_RE = re.compile(r"^(feat|fix|docs|refactor|test|chore|perf|build|ci|style)(\(.+?\))?!?:", re.IGNORECASE)

def commit_analytics(days: int = 365) -> Dict:
    since = (datetime.utcnow() - timedelta(days=days)).isoformat(timespec="seconds")
    rc, out, err = run(["git", "log", f"--since={since}", "--date=iso-strict", "--pretty=%H%x09%an%x09%ad%x09%s"])
    result = {
        "window_days": days,
        "total_commits_window": 0,
        "commits_per_day_est": 0.0,
        "by_type": {},
        "by_author": {},
        "recent_examples": []
    }
    if rc != 0 or not out:
        return result

    lines = out.splitlines()
    result["total_commits_window"] = len(lines)

    by_type = Counter()
    by_author = Counter()
    days_set = set()
    examples = []

    for i, line in enumerate(lines[:2000]):  # cap to avoid extremes
        parts = line.split("\t")
        if len(parts) < 4:
            continue
        sha, author, date_str, subject = parts[0], parts[1], parts[2], parts[3]
        by_author[author] += 1
        day = date_str.split("T")[0]
        days_set.add(day)
        m = COMMIT_TYPE_RE.match(subject or "")
        t = m.group(1).lower() if m else "other"
        by_type[t] += 1
        if len(examples) < 15:
            examples.append({"sha": sha[:10], "author": author, "date": date_str, "subject": subject})

    active_days = max(1, len(days_set))
    result["commits_per_day_est"] = round(result["total_commits_window"] / active_days, 3)
    result["by_type"] = dict(by_type.most_common())
    result["by_author"] = dict(by_author.most_common())
    result["recent_examples"] = examples
    return result

def churn_hotspots(days: int = 90, limit: int = 20) -> Dict:
    since = (datetime.utcnow() - timedelta(days=days)).isoformat(timespec="seconds")
    rc, out, err = run(["git", "log", f"--since={since}", "--numstat", "--pretty=%H"])
    per_file = defaultdict(lambda: {"added": 0, "deleted": 0, "touches": 0})
    if rc != 0 or not out:
        return {"window_days": days, "top_files": []}

    current_commit = None
    for line in out.splitlines():
        if re.fullmatch(r"[0-9a-f]{7,}", line.strip()):
            current_commit = line.strip()
            continue
        parts = line.split("\t")
        if len(parts) == 3 and parts[0].isdigit() or parts[0] == "-" or parts[1] == "-":
            a, d, path = parts
            try:
                a = 0 if a == "-" else int(a)
                d = 0 if d == "-" else int(d)
            except:
                a = d = 0
            s = per_file[path]
            s["added"] += a
            s["deleted"] += d
            s["touches"] += 1

    ranked = sorted(
        per_file.items(),
        key=lambda kv: (kv[1]["added"] + kv[1]["deleted"], kv[1]["touches"]),
        reverse=True
    )[:limit]
    return {
        "window_days": days,
        "top_files": [{"path": p, **stats} for p, stats in ranked]
    }

TODO_RE = re.compile(r"\b(TODO|FIXME|HACK|XXX)\b", re.IGNORECASE)

SECRET_PATTERNS = [
    (re.compile(r"AKIA[0-9A-Z]{16}"), "AWS Access Key ID"),
    (re.compile(r"ASIA[0-9A-Z]{16}"), "AWS STS Key ID"),
    (re.compile(r"(?i)aws_secret_access_key\s*[:=]\s*[0-9A-Za-z/\+=]{40}"), "AWS Secret Access Key"),
    (re.compile(r"(^|[^A-Za-z0-9])AIZA[0-9A-Za-z\-\_]{35,}", re.IGNORECASE), "Google API Key-ish"),
    (re.compile(r"ghp_[A-Za-z0-9]{36,}"), "GitHub Personal Access Token"),
    (re.compile(r"(?i)secret[_-]?key\s*[:=]\s*['\"][A-Za-z0-9/\+=]{16,}"), "Generic secret key"),
]

BINARY_EXTS = set([
    ".png",".jpg",".jpeg",".gif",".webp",".bmp",".ico",
    ".pdf",".zip",".gz",".xz",".7z",".rar",".mp4",".mov",".avi",".mp3",".wav",
    ".woff",".woff2",".ttf",".otf",".psd",".sketch",".fig",".ai",".blend"
])

def is_text_file(path: Path) -> bool:
    if path.suffix.lower() in BINARY_EXTS:
        return False
    try:
        with open(path, "rb") as f:
            chunk = f.read(2048)
        if b"\x00" in chunk:
            return False
        return True
    except:
        return False

def walk_repo_files() -> List[Path]:
    rc, out, _ = run(["git", "ls-files"])
    files = []
    if rc == 0 and out:
        for rel in out.splitlines():
            p = HERE / rel
            if p.is_file():
                files.append(p)
    return files

def scan_debt_and_secrets(size_threshold_mb: float = 5.0) -> Dict:
    files = walk_repo_files()
    todo_hits = []
    secret_hits = []
    large_files = []

    for p in files:
        try:
            size_mb = p.stat().st_size / (1024 * 1024)
            if size_mb >= size_threshold_mb:
                large_files.append({"path": str(p), "size_mb": round(size_mb, 2)})
        except:  # permission or symlink weirdness
            pass

        if is_text_file(p):
            try:
                with open(p, "r", encoding="utf-8", errors="ignore") as f:
                    for i, line in enumerate(f, start=1):
                        if TODO_RE.search(line):
                            todo_hits.append({"path": str(p), "line": i, "text": line.strip()[:300]})
                        for pat, label in SECRET_PATTERNS:
                            if pat.search(line):
                                secret_hits.append({"path": str(p), "line": i, "label": label, "snippet": line.strip()[:200]})
            except Exception as e:
                continue

    # .env files committed
    env_hits = []
    for p in files:
        if p.name.startswith(".env"):
            env_hits.append(str(p))

    return {
        "todo_fixme": todo_hits[:2000],
        "secret_hits": secret_hits[:2000],
        "env_files_committed": env_hits,
        "large_files": sorted(large_files, key=lambda x: x["size_mb"], reverse=True)[:100],
    }

def contributors() -> Dict:
    rc, out, _ = run(["git", "shortlog", "-sne", "HEAD"])
    people = []
    total = 0
    if rc == 0 and out:
        for line in out.splitlines():
            # "  12  Name <email>"
            m = re.match(r"\s*(\d+)\s+(.*)", line)
            if m:
                count = int(m.group(1))
                who = m.group(2)
                total += count
                people.append({"commits": count, "identity": who})
    return {"total_commits": total, "contributors": people[:50]}

def npm_audit() -> Optional[Dict]:
    if not (HERE / "package.json").exists():
        return None
    if not shutil.which("npm"):
        return {"error": "npm not installed"}
    rc, out, err = run(["npm", "audit", "--json"], timeout=300)
    if rc != 0 and not out:
        return {"error": err or "npm audit failed"}
    try:
        data = json.loads(out or "{}")
        # Collapse to a tiny summary
        advisories_total = data.get("metadata", {}).get("vulnerabilities", {})
        return {"vulnerabilities": advisories_total}
    except Exception as e:
        return {"error": str(e)}

def pip_audit() -> Optional[Dict]:
    req = (HERE / "requirements.txt").exists() or (HERE / "pyproject.toml").exists()
    if not req:
        return None
    if not shutil.which("pip-audit"):
        return {"error": "pip-audit not installed"}
    rc, out, err = run(["pip-audit", "-f", "json"], timeout=300)
    if rc != 0 and not out:
        return {"error": err or "pip-audit failed"}
    try:
        data = json.loads(out or "[]")
        vulns = []
        for item in data:
            for v in item.get("vulns", []):
                vulns.append({
                    "name": item.get("name"),
                    "version": item.get("version"),
                    "id": v.get("id"),
                    "fix_versions": v.get("fix_versions"),
                    "description": (v.get("description") or "")[:300]
                })
        return {"count": len(vulns), "items": vulns[:200]}
    except Exception as e:
        return {"error": str(e)}

def commits_benefit_guidance() -> List[str]:
    return [
        "feat: adds user-visible functionality (roadmap progress, demo value).",
        "fix: resolves a bug (stability, support load reduction).",
        "docs: improves understanding (onboarding speed, bus-factor).",
        "refactor: structural cleanup (maintainability, lowers future change cost).",
        "test: coverage/stability (confidence, safer releases).",
        "perf: faster/leaner (latency, infra cost).",
        "build/ci: reliable pipelines (dev velocity, fewer broken main builds).",
        "chore/style: small non-functional upkeep (consistency).",
    ]

def make_markdown(report: Dict) -> str:
    md = []
    meta = report["metadata"]
    md.append(f"# Repository Report — {meta.get('work_tree') or HERE.name}\n")
    md.append("## Snapshot")
    md.append(f"- **Default branch:** `{meta.get('default_branch')}`")
    md.append(f"- **Current branch:** `{meta.get('current_branch')}`")
    md.append(f"- **HEAD:** `{(meta.get('head_sha') or '')[:10]}`")
    md.append(f"- **Tags:** {meta.get('tag_count')}")
    md.append(f"- **Last commit:** {meta.get('last_commit_date')}")
    if meta.get("remotes"):
        md.append(f"- **Remotes:** " + ", ".join([f"`{name}` → {', '.join(urls)}" for name, urls in meta["remotes"].items()]))

    ca = report["commit_analytics"]
    md.append("\n## Commits (last {} days)".format(ca["window_days"]))
    md.append(f"- Total: **{ca['total_commits_window']}**, Active days: **≈{int(ca['total_commits_window']>0 and ca['total_commits_window']/max(ca['commits_per_day_est'], 1e-9))}**")
    md.append(f"- Avg commits/day: **{ca['commits_per_day_est']}**")
    if ca["by_type"]:
        md.append("\n**By type:**")
        for k, v in ca["by_type"].items():
            md.append(f"- `{k}`: {v}")
    if ca["by_author"]:
        md.append("\n**Top authors:**")
        for i, (author, cnt) in enumerate(ca["by_author"].items()):
            if i >= 10: break
            md.append(f"- {author}: {cnt}")

    if ca["recent_examples"]:
        md.append("\n**Recent commit examples:**")
        for ex in ca["recent_examples"]:
            md.append(f"- `{ex['sha']}` {ex['date']} — {ex['author']}: {ex['subject']}")

    churn = report["churn"]
    md.append(f"\n## Churn Hot-spots (last {churn['window_days']} days)")
    if churn["top_files"]:
        md.append("| File | +added | -deleted | touches |")
        md.append("|---|---:|---:|---:|")
        for item in churn["top_files"]:
            md.append(f"| `{item['path']}` | {item['added']} | {item['deleted']} | {item['touches']} |")
    else:
        md.append("_No recent churn data._")

    debt = report["debt"]
    md.append("\n## Tech Debt & Risks")
    md.append(f"- TODO/FIXME markers: **{len(debt['todo_fixme'])}**")
    md.append(f"- Possible secrets: **{len(debt['secret_hits'])}**")
    if debt["env_files_committed"]:
        md.append(f"- Committed `.env*` files: {', '.join(f'`{p}`' for p in debt['env_files_committed'])}")
    if debt["large_files"]:
        md.append("\n**Large files (> 5 MB):**")
        for lf in debt["large_files"][:20]:
            md.append(f"- `{lf['path']}` — {lf['size_mb']} MB")

    audits = report.get("audits", {})
    if audits.get("npm"):
        npm = audits["npm"]
        md.append("\n## Node Dependency Audit (npm)")
        if "error" in npm:
            md.append(f"- _Audit error_: {npm['error']}")
        else:
            vul = npm.get("vulnerabilities", {})
            md.append("- Vulnerabilities:")
            for k in ["critical","high","moderate","low","info"]:
                if k in vul:
                    md.append(f"  - {k}: **{vul[k]}**")

    if audits.get("pip"):
        pip = audits["pip"]
        md.append("\n## Python Dependency Audit (pip-audit)")
        if "error" in pip:
            md.append(f"- _Audit error_: {pip['error']}")
        else:
            md.append(f"- Findings: **{pip.get('count',0)}**")
            for it in (pip.get("items") or [])[:20]:
                md.append(f"  - {it['name']} {it['version']} — {it['id']} (fix: {', '.join(it.get('fix_versions') or []) or 'n/a'})")

    md.append("\n## How to Interpret Commit Types (Benefits)")
    for line in commits_benefit_guidance():
        md.append(f"- {line}")

    md.append("\n## Quick Wins (Actionable)")
    quick = report.get("quick_wins", [])
    if quick:
        for q in quick:
            md.append(f"- [ ] {q}")
    else:
        md.append("- [ ] Protect secrets: remove any committed `.env*`, rotate keys, add patterns to `.gitignore`.")
        md.append("- [ ] Reduce churn in hot files: add tests, split modules, stabilize interfaces.")
        md.append("- [ ] Close TODO/FIXME or create issues, link to milestones.")
        md.append("- [ ] Run full `npm audit fix` or upgrade vulnerable packages with a plan.")
        md.append("- [ ] Enforce commit conventions (Conventional Commits) in CI to keep clean history and auto-changelog.")

    md.append("\n---\nGenerated by `repo_audit.py`.")
    return "\n".join(md)

def detect_quick_wins(report: Dict) -> List[str]:
    wins = []
    debt = report["debt"]
    if debt["secret_hits"]:
        wins.append(f"Found {len(debt['secret_hits'])} potential secrets. Remove & rotate. Add `.env*` to .gitignore.")
    if debt["env_files_committed"]:
        wins.append("`.env*` files are committed. Move to local only and use env vars in deploy.")
    churn = report["churn"]
    if churn["top_files"]:
        worst = churn["top_files"][0]
        wins.append(f"High churn: `{worst['path']}` (+{worst['added']}/-{worst['deleted']}, {worst['touches']} touches). Consider refactor or module split.")
    ca = report["commit_analytics"]
    if ca["by_type"].get("test", 0) == 0:
        wins.append("No `test` commits detected recently. Add/expand tests for stability.")
    return wins

def main():
    if not in_git_repo():
        print("Not a git repository. Run inside a repo.", file=sys.stderr)
        sys.exit(1)

    ap = argparse.ArgumentParser(description="Generate a deep repo report (Markdown + JSON).")
    ap.add_argument("--window", type=int, default=365, help="Days to analyze commits (default 365).")
    ap.add_argument("--churn-window", type=int, default=90, help="Days for churn window (default 90).")
    ap.add_argument("--deep", action="store_true", help="Run optional audits (npm/pip) if available.")
    ap.add_argument("--out-md", default="REPO_REPORT.md", help="Markdown output filename.")
    ap.add_argument("--out-json", default="REPO_REPORT.json", help="JSON output filename.")
    args = ap.parse_args()

    report = {
        "metadata": repo_metadata(),
        "commit_analytics": commit_analytics(days=args.window),
        "churn": churn_hotspots(days=args.churn_window),
        "debt": scan_debt_and_secrets(),
        "audits": {},
        "generated_at": datetime.utcnow().isoformat() + "Z"
    }

    if args.deep:
        report["audits"]["npm"] = npm_audit()
        report["audits"]["pip"] = pip_audit()

    report["quick_wins"] = detect_quick_wins(report)

    # Write JSON + Markdown
    Path(args.out_json).write_text(json.dumps(report, indent=2))
    Path(args.out_md).write_text(make_markdown(report))

    print(f"Wrote {args.out_md} and {args.out_json}")

if __name__ == "__main__":
    main()
