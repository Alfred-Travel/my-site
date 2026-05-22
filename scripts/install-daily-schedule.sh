#!/usr/bin/env bash
# Installs a macOS LaunchAgent to run daily:growth every day at 05:00 Australia/Sydney.
# Your Mac must be on and awake at that time (or the run is skipped until the next day).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SUPPORT_DIR="$HOME/Library/Application Support/AlfredTravel"
LAUNCHER="$SUPPORT_DIR/run-daily-growth-launcher.sh"
ROOT_FILE="$SUPPORT_DIR/project-root.txt"
LABEL="io.alfredtravel.daily-growth"
PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"
LOG_DIR="$ROOT/logs"

mkdir -p "$SUPPORT_DIR" "$LOG_DIR"
echo "$ROOT" > "$ROOT_FILE"

# Launcher lives in Application Support and invokes node directly (macOS often blocks
# launchd from *executing* shell scripts inside ~/Documents).
cat > "$LAUNCHER" <<'LAUNCHER_EOF'
#!/usr/bin/env bash
set -euo pipefail

SUPPORT_DIR="$HOME/Library/Application Support/AlfredTravel"
ROOT="$(cat "$SUPPORT_DIR/project-root.txt")"
LOG="$ROOT/logs/daily-growth.log"
JOB="$ROOT/scripts/daily-growth-job.js"

mkdir -p "$ROOT/logs"

if [[ -f "$ROOT/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env.local"
  set +a
fi

export PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin"
if [[ -x "$ROOT/.node-portable/bin/node" ]]; then
  export PATH="$ROOT/.node-portable/bin:$PATH"
fi

{
  echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') — daily growth start ==="
  if [[ -z "${OPENAI_API_KEY:-}" ]]; then
    echo "ERROR: OPENAI_API_KEY missing. Create $ROOT/.env.local (see .env.local.example)"
    exit 1
  fi
  if [[ ! -f "$JOB" ]]; then
    echo "ERROR: missing $JOB"
    exit 1
  fi
  cd "$ROOT"
  if [[ -d "$ROOT/node_modules" ]]; then
    :
  elif [[ -f "$ROOT/package-lock.json" ]]; then
    npm ci --omit=dev 2>&1 || npm install 2>&1
  fi
  node "$JOB"
  echo "=== $(date '+%Y-%m-%d %H:%M:%S %Z') — daily growth finished ==="
} >> "$LOG" 2>&1
LAUNCHER_EOF

chmod +x "$LAUNCHER"
xattr -dr com.apple.quarantine "$LAUNCHER" 2>/dev/null || true

cat > "$PLIST" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${LABEL}</string>
  <key>ProgramArguments</key>
  <array>
    <string>${LAUNCHER}</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>5</integer>
    <key>Minute</key>
    <integer>0</integer>
    <key>TimeZone</key>
    <string>Australia/Sydney</string>
  </dict>
  <key>StandardOutPath</key>
  <string>${LOG_DIR}/launchd.out.log</string>
  <key>StandardErrorPath</key>
  <string>${LOG_DIR}/launchd.err.log</string>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo "Installed: ${PLIST}"
echo "Launcher:  ${LAUNCHER}"
echo "Schedule:  every day at 05:00 Australia/Sydney (AEST in winter, AEDT in summer)"
echo "Logs:      ${LOG_DIR}/daily-growth.log"
echo ""
echo "REQUIRED:  ${ROOT}/.env.local with OPENAI_API_KEY=sk-..."
echo "REQUIRED:  npm ci (once) in project folder"
echo "REQUIRED:  Mac on and awake at 05:00"
echo ""
echo "Test now:  bash \"${LAUNCHER}\""
echo "Uninstall: npm run daily:uninstall-schedule"
