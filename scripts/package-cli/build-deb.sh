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
node "$(dirname "$0")/write-install-channel.mjs" "$PKG_ROOT/opt/execonvert" deb
# Whoever runs the program must be able to read all of it: mktemp makes the
# root 0700, and some bundled files come without read access for others
# (Chrome's deb.deps and rpm.deps are 0600).
chmod -R a+rX "$PKG_ROOT"

cat >"$PKG_ROOT/usr/bin/execonvert" <<'EOF'
#!/bin/sh
exec /opt/execonvert/execonvert "$@"
EOF
chmod 755 "$PKG_ROOT/usr/bin/execonvert"

# The bundled Chrome, which makes the PDFs, needs these system libraries. A
# desktop usually has them, a minimal system does not, and without them the
# PDF fails with a loader error nobody understands. Ubuntu 24.04 renamed some
# of them (the t64 suffix), so both names are accepted, the new one first: in
# Ubuntu the old libasound2 is also provided by liboss4-salsa-asound2, which
# Chrome cannot use.
CHROME_DEPENDS="libasound2t64 | libasound2, libatk-bridge2.0-0t64 | libatk-bridge2.0-0, libatk1.0-0t64 | libatk1.0-0, libatspi2.0-0t64 | libatspi2.0-0, libcairo2, libcups2t64 | libcups2, libdbus-1-3, libexpat1, libgbm1, libglib2.0-0t64 | libglib2.0-0, libnspr4, libnss3, libpango-1.0-0, libx11-6, libxcb1, libxcomposite1, libxdamage1, libxext6, libxfixes3, libxkbcommon0, libxrandr2"

cat >"$PKG_ROOT/DEBIAN/control" <<EOF
Package: execonvert
Version: $VERSION
Section: utils
Priority: optional
Architecture: amd64
Depends: $CHROME_DEPENDS
Recommends: fonts-liberation
Maintainer: eXeConvert
Description: eXeConvert CLI
 Static converter for eXeLearning projects.
EOF

mkdir -p "$OUTPUT_DIR"
dpkg-deb --build "$PKG_ROOT" "$OUTPUT_DIR/execonvert_${VERSION}_amd64.deb"
