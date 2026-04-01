#!/bin/sh
set -eu

if [ "$#" -ne 4 ]; then
  echo "Usage: build-appimage.sh <bundle-dir> <version> <output-dir> <appimagetool>" >&2
  exit 1
fi

BUNDLE_DIR=$1
VERSION=$2
OUTPUT_DIR=$3
APPIMAGETOOL=$4
APPDIR=$(mktemp -d)
trap 'rm -rf "$APPDIR"' EXIT

mkdir -p "$APPDIR/usr/lib/execonvert" "$APPDIR/usr/bin"
cp -a "$BUNDLE_DIR"/. "$APPDIR/usr/lib/execonvert/"

cat >"$APPDIR/usr/bin/execonvert" <<'EOF'
#!/bin/sh
HERE="$(dirname "$(readlink -f "$0")")"
exec "$HERE/../lib/execonvert/execonvert" "$@"
EOF
chmod 755 "$APPDIR/usr/bin/execonvert"

cat >"$APPDIR/AppRun" <<'EOF'
#!/bin/sh
HERE="$(dirname "$(readlink -f "$0")")"
exec "$HERE/usr/bin/execonvert" "$@"
EOF
chmod 755 "$APPDIR/AppRun"

cat >"$APPDIR/execonvert.desktop" <<EOF
[Desktop Entry]
Type=Application
Name=eXeConvert CLI
Exec=execonvert
Icon=execonvert
Terminal=true
Categories=Utility;
Comment=Convert eXeLearning projects from the command line
X-AppImage-Version=$VERSION
EOF

cp "$(dirname "$0")/../../app/public/info/execonvert-icon.svg" "$APPDIR/execonvert.svg"
ln -s execonvert.svg "$APPDIR/.DirIcon"

mkdir -p "$OUTPUT_DIR"
ARCH=x86_64 "$APPIMAGETOOL" "$APPDIR" "$OUTPUT_DIR/execonvert-${VERSION}-x86_64.AppImage"
