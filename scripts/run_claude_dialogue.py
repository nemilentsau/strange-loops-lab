#!/usr/bin/env python3
"""Run Claude Code dialogue with custom agents and structured output.

This exists because the same Claude CLI invocation completes reliably from
Python subprocesses in this environment, while the equivalent Node execFile
path hangs until timeout.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys


def main() -> int:
    args = [
        os.environ["CLAUDE_CLI_PATH"],
        "-p",
        "--output-format",
        "json",
        "--permission-mode",
        "bypassPermissions",
        "--effort",
        os.environ["CLAUDE_DIALOGUE_EFFORT"],
        "--model",
        os.environ["CLAUDE_DIALOGUE_MODEL"],
        "--append-system-prompt",
        os.environ["DIALOGUE_SYSTEM_PROMPT"],
        "--agents",
        os.environ["DIALOGUE_AGENTS"],
        "--json-schema",
        os.environ["DIALOGUE_JSON_SCHEMA"],
        os.environ["DIALOGUE_PROMPT"],
    ]

    # Use a slightly shorter timeout than the caller so this process can
    # report a structured error before the parent kills it.
    caller_timeout_ms = int(os.environ.get("CLAUDE_DIALOGUE_TIMEOUT_MS", "120000"))
    timeout_seconds = max((caller_timeout_ms - 5000) / 1000.0, 1.0)
    env = dict(os.environ)
    env["CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS"] = "1"

    try:
        completed = subprocess.run(
            args,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            stdin=subprocess.DEVNULL,
            env=env,
            check=False,
        )
    except subprocess.TimeoutExpired as exc:
        message = {
            "error": "Claude dialogue process timed out.",
            "stdout": (exc.stdout or "")[:4000],
            "stderr": (exc.stderr or "")[:2000],
        }
        sys.stderr.write(json.dumps(message))
        return 124

    if completed.returncode != 0:
        message = {
            "error": "Claude dialogue process failed.",
            "returncode": completed.returncode,
            "stdout": completed.stdout[:4000],
            "stderr": completed.stderr[:2000],
        }
        sys.stderr.write(json.dumps(message))
        return completed.returncode

    sys.stdout.write(completed.stdout)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
