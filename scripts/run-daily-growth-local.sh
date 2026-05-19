#!/usr/bin/env bash
# Runs the daily SEO/AIO growth job locally. Logs to logs/daily-growth.log
# Scheduled via: npm run daily:install-schedule

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
mkdir -p "$ROOT/logs"

if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
fi

if [[ -x "$ROOT/.node-portable/bin/node" ]]; then
  export PATH="$ROOT/.node-portable/bin:$PATH"
elif [[ -x /opt/homebrew/bin/node ]]; then
  export PATH="/opt/homebrew/bin:$PATH"
elif [[ -x /usr/local/bin/node ]]; then
  export PATH="/usr/local/bin:$PATH"
fi

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node not found. Install Node or run: npm run daily:install-schedule after .node-portable exists." >&2
  exit 1
fi

if [[ -z "${OPENAI_API_KEY:-}" ]]; then
  echo "ERROR: OPENAI_API_KEY not set. Add it to $ROOT/.env.local" >&2
  exit 1
fi

LOG="$ROOT/logs/daily-growth.log"
{
  echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') — daily:growth start (cwd: $ROOT) ==="
  npm run daily:growth
  echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') — daily:growth finished ==="
} >> "$LOG" 2>&1
