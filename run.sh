#!/usr/bin/env bash
# Start the My OVO Data web app locally.
set -euo pipefail
cd "$(dirname "$0")"

VENV=".venv"

# Recreate the virtualenv if it's missing or broken (e.g. a stale one from
# another OS whose python symlink no longer resolves).
if [ ! -x "$VENV/bin/python" ] || ! "$VENV/bin/python" -c "" >/dev/null 2>&1; then
  echo "Creating virtual environment..."
  rm -rf "$VENV"
  python3 -m venv "$VENV"
fi

# shellcheck disable=SC1091
source "$VENV/bin/activate"

pip install -q --upgrade pip
pip install -q -r requirements.txt

echo "Starting on http://127.0.0.1:8000  (Ctrl+C to stop)"
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
