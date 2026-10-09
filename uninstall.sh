#!/bin/sh

set -eu

SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)
BIN_DIR=${BIN_DIR:-"$HOME/.local/bin"}
DEST="$BIN_DIR/collector"

if [ ! -f "$DEST" ] || [ -L "$DEST" ]; then
    echo "error: installed collector wrapper not found: $DEST" >&2
    exit 1
fi

EXPECTED_LINE="# Collector installation: $SCRIPT_DIR"

if ! sed -n '2p' "$DEST" | grep -F -x "$EXPECTED_LINE" >/dev/null 2>&1; then
    echo "error: $DEST does not appear to belong to this Collector checkout" >&2
    echo "Refusing to remove it." >&2
    exit 1
fi

rm "$DEST"

echo "Removed $DEST"
