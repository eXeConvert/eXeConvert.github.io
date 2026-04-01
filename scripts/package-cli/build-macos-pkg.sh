#!/bin/sh
set -eu

if [ "$#" -ne 3 ]; then
  echo "Usage: build-macos-pkg.sh <bundle-dir> <version> <output-dir>" >&2
  exit 1
fi

BUNDLE_DIR=$1
VERSION=$2
OUTPUT_DIR=$3
PKG_ROOT=$(mktemp -d)
trap 'rm -rf "$PKG_ROOT"' EXIT

mkdir -p "$PKG_ROOT/usr/local/lib/execonvert" "$PKG_ROOT/usr/local/bin"
cp -a "$BUNDLE_DIR"/. "$PKG_ROOT/usr/local/lib/execonvert/"

cat >"$PKG_ROOT/usr/local/bin/execonvert" <<'EOF'
#!/bin/sh
exec /usr/local/lib/execonvert/execonvert "$@"
EOF
chmod 755 "$PKG_ROOT/usr/local/bin/execonvert"

mkdir -p "$OUTPUT_DIR"
pkgbuild \
  --root "$PKG_ROOT" \
  --identifier io.github.execonvert.cli \
  --version "$VERSION" \
  --install-location / \
  "$OUTPUT_DIR/execonvert-${VERSION}.pkg"
