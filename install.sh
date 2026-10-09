#!/bin/sh

set -eu

SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)
COLLECTOR_JS="$SCRIPT_DIR/dist/collector.js"
BIN_DIR=${BIN_DIR:-"$HOME/.local/bin"}
DEST="$BIN_DIR/collector"

if ! command -v node >/dev/null 2>&1; then
    echo "error: node was not found in PATH" >&2
    exit 1
fi

if [ ! -f "$COLLECTOR_JS" ]; then
    echo "error: bundled Collector not found: $COLLECTOR_JS" >&2
    echo "Run 'yarn build' first." >&2
    exit 1
fi

if [ -e "$DEST" ] || [ -L "$DEST" ]; then
    echo "error: destination already exists: $DEST" >&2
    echo "Remove it manually if you want to replace it." >&2
    exit 1
fi

mkdir -p "$BIN_DIR"

TMP_FILE=$(mktemp "$BIN_DIR/.collector.XXXXXX")

cleanup() {
    rm -f "$TMP_FILE"
}

trap cleanup EXIT HUP INT TERM

{
    printf '#!/bin/sh\n'
    printf '# Collector installation: %s\n' "$SCRIPT_DIR"
    printf 'exec node "%s" "$@"\n' "$COLLECTOR_JS"
} > "$TMP_FILE"

chmod 755 "$TMP_FILE"
mv "$TMP_FILE" "$DEST"

trap - EXIT HUP INT TERM

echo "Installed collector to $DEST"

case ":${PATH:-}:" in
    *":$BIN_DIR:"*) ;;
    *)
        echo "warning: $BIN_DIR is not in PATH" >&2
        echo "Add it to PATH to invoke collector by name." >&2
        ;;
esac
