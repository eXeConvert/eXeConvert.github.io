#!/bin/sh
set -eu

if [ "$#" -ne 3 ]; then
  echo "Usage: build-deb.sh <bundle-dir> <version> <output-dir>" >&2
  exit 1
fi

BUNDLE_DIR=$1
VERSION=$2
OUTPUT_DIR=$3
PKG_ROOT=$(mktemp -d)
trap 'rm -rf "$PKG_ROOT"' EXIT

mkdir -p "$PKG_ROOT/DEBIAN" "$PKG_ROOT/opt/execonvert" "$PKG_ROOT/usr/bin"
cp -a "$BUNDLE_DIR"/. "$PKG_ROOT/opt/execonvert/"

cat >"$PKG_ROOT/usr/bin/execonvert" <<'EOF'
#!/bin/sh
exec /opt/execonvert/execonvert "$@"
EOF
chmod 755 "$PKG_ROOT/usr/bin/execonvert"

cat >"$PKG_ROOT/DEBIAN/control" <<EOF
Package: execonvert
Version: $VERSION
Section: utils
Priority: optional
Architecture: amd64
Maintainer: eXeConvert
Description: eXeConvert CLI
 Static converter for eXeLearning projects.
EOF

mkdir -p "$OUTPUT_DIR"
dpkg-deb --build "$PKG_ROOT" "$OUTPUT_DIR/execonvert_${VERSION}_amd64.deb"
