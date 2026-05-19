#!/usr/bin/env bash
# Installs a macOS LaunchAgent to run daily:growth every day at 05:00 Australia/Sydney.
# Your Mac must be on and awake at that time (or the run is skipped until the next day).

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PROJECT_RUNNER="$ROOT/scripts/run-daily-growth-local.sh"
SUPPORT_DIR="$HOME/Library/Application Support/AlfredTravel"
LAUNCHER="$SUPPORT_DIR/run-daily-growth-launcher.sh"
LABEL="io.alfredtravel.daily-growth"
PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"
LOG_DIR="$ROOT/logs"

chmod +x "$PROJECT_RUNNER"
xattr -dr com.apple.quarantine "$PROJECT_RUNNER" 2>/dev/null || true
mkdir -p "$SUPPORT_DIR" "$LOG_DIR"

# Launcher lives outside Documents so launchd can execute it (macOS TCC blocks many
# LaunchAgents from running scripts directly inside ~/Documents).
cat > "$LAUNCHER" <<EOF
#!/usr/bin/env bash
set -euo pipefail
exec /bin/bash "$PROJECT_RUNNER"
EOF
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
  <key>EnvironmentVariables</key>
  <dict>
    <key>PATH</key>
    <string>/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin</string>
  </dict>
</dict>
</plist>
EOF

launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
launchctl bootstrap "gui/$(id -u)" "$PLIST"

echo "Installed: ${PLIST}"
echo "Launcher:  ${LAUNCHER}"
echo "Schedule:  every day at 05:00 Australia/Sydney (AEST/AEDT)"
echo "Logs:      ${LOG_DIR}/daily-growth.log"
echo ""
echo "Ensure OPENAI_API_KEY is in: ${ROOT}/.env.local"
echo ""
echo "If 05:00 runs still fail with 'Operation not permitted', grant Full Disk Access to"
echo "Terminal (or move this project out of ~/Documents, e.g. ~/Developer/alfredtravel-website)."
echo ""
echo "Test now:  bash \"${LAUNCHER}\""
echo "Uninstall: npm run daily:uninstall-schedule"
