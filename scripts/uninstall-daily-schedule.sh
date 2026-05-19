#!/usr/bin/env bash
set -euo pipefail

LABEL="io.alfredtravel.daily-growth"
PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"

launchctl bootout "gui/$(id -u)/${LABEL}" 2>/dev/null || true
rm -f "$PLIST"

echo "Removed daily schedule (${LABEL})."
