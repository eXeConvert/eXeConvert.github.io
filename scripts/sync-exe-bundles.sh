#!/usr/bin/env bash
set -euo pipefail

# Sync the embedded eXeLearning runtime bundles used by eXeConvert from the
# latest stable eXeLearning static release.
#
# eXeConvert loads these at runtime (see src/legacy-elp.ts, EXELEARNING_BASE_PATH):
#   app/public/exelearning/importers.bundle.js
#   app/public/exelearning/exporters.bundle.js
#   app/public/exelearning/bundles/                (common/content-css/idevices/libs/manifest + themes/*.zip)
#   app/public/exelearning/app/common/exe_powered_logo/exe_powered_logo.png
#
# By default it checks the latest stable release and updates only when a newer
# static release is available. The recorded version lives in
# app/public/exelearning/runtime-source.json.

EXE_REPO_URL="https://github.com/exelearning/exelearning"
EXE_REPO_SLUG="exelearning/exelearning"

usage() {
  cat <<'EOF'
Usage: scripts/sync-exe-bundles.sh [--force]

Checks the latest stable eXeLearning release on GitHub and updates the bundled
runtime under app/public/exelearning/ only when a newer static release is
available.

Options:
  --force      Refresh even if the recorded release already matches the latest.
  -h, --help   Show this help.
EOF
}

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
EXE_DIR="$REPO_ROOT/app/public/exelearning"
BUNDLES_DIR="$EXE_DIR/bundles"
LOGO_DIR="$EXE_DIR/app/common/exe_powered_logo"
I18N_DIR="$EXE_DIR/app/common/i18n"
I18N_TEMPLATE_DEST="$EXE_DIR/app/common/common_i18n.js"
RUNTIME_SOURCE_JSON="$EXE_DIR/runtime-source.json"

FORCE=0
while [[ $# -gt 0 ]]; do
  case "$1" in
    --force) FORCE=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown option: $1" >&2; usage >&2; exit 2 ;;
  esac
done

need_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

need_cmd gh
need_cmd unzip
need_cmd node

json_value() {
  # json_value <file> <key>
  node -e '
    const fs = require("fs");
    const [file, key] = process.argv.slice(1);
    if (!fs.existsSync(file)) process.exit(0);
    try {
      const data = JSON.parse(fs.readFileSync(file, "utf8"));
      const v = data[key];
      if (v !== undefined && v !== null) process.stdout.write(String(v));
    } catch (_) {}
  ' "$1" "$2" 2>/dev/null || true
}

resolve_tag_commit() {
  local tag="$1" commit
  commit="$(git ls-remote "$EXE_REPO_URL" "refs/tags/$tag^{}" | awk 'NR==1 { print $1 }')"
  if [[ -z "$commit" ]]; then
    commit="$(git ls-remote "$EXE_REPO_URL" "refs/tags/$tag" | awk 'NR==1 { print $1 }')"
  fi
  printf '%s' "$commit"
}

latest_json="$(gh release view --repo "$EXE_REPO_SLUG" --json tagName,publishedAt,assets)"
latest_tag="$(node -e 'process.stdout.write(String(JSON.parse(process.argv[1]).tagName || ""))' "$latest_json")"
latest_published_at="$(node -e 'process.stdout.write(String(JSON.parse(process.argv[1]).publishedAt || ""))' "$latest_json")"
release_asset="$(node -e '
  const data = JSON.parse(process.argv[1]);
  const tag = String(data.tagName || "");
  const expected = `exelearning-static-${tag}.zip`;
  const asset = (data.assets || []).find((a) => a.name === expected);
  if (!asset) process.exit(1);
  process.stdout.write(asset.name);
' "$latest_json")" || {
  echo "Static release asset not found for $latest_tag" >&2
  exit 1
}

current_tag="$(json_value "$RUNTIME_SOURCE_JSON" sourceReleaseTag)"
if [[ "$FORCE" -eq 0 && -n "$current_tag" && "$current_tag" == "$latest_tag" ]]; then
  echo "Bundles already up to date with release $latest_tag."
  exit 0
fi

WORK_DIR="$(mktemp -d)"
trap 'rm -rf "$WORK_DIR"' EXIT

echo "Downloading $release_asset from $EXE_REPO_SLUG..."
(
  cd "$WORK_DIR"
  gh release download "$latest_tag" --repo "$EXE_REPO_SLUG" --pattern "$release_asset"
  unzip -q "$release_asset"
)

SRC="$WORK_DIR/static"
IMPORTERS_SRC="$SRC/app/yjs/importers.bundle.js"
EXPORTERS_SRC="$SRC/app/yjs/exporters.bundle.js"
BUNDLES_SRC="$SRC/bundles"
LOGO_SRC="$SRC/app/common/exe_powered_logo/exe_powered_logo.png"
I18N_TEMPLATE_SRC="$SRC/app/common/common_i18n.js"
I18N_SRC_DIR="$SRC/app/common/i18n"

# Verify everything we need exists BEFORE touching the destination, so a bad
# release never leaves eXeConvert without its runtime.
for required in "$IMPORTERS_SRC" "$EXPORTERS_SRC"; do
  if [[ ! -f "$required" ]]; then
    echo "Missing expected file in release: ${required#$SRC/}" >&2
    exit 1
  fi
done
if [[ ! -d "$BUNDLES_SRC" ]]; then
  echo "Missing expected directory in release: bundles/" >&2
  exit 1
fi
if [[ ! -f "$LOGO_SRC" ]]; then
  echo "Warning: exe_powered_logo.png not found in release; keeping existing copy." >&2
fi
if [[ ! -f "$I18N_TEMPLATE_SRC" || ! -d "$I18N_SRC_DIR" ]]; then
  echo "Warning: i18n template/translations not found in release; legacy .elp export may not be translated." >&2
fi

rm -rf "$BUNDLES_DIR" "$I18N_DIR"
mkdir -p "$BUNDLES_DIR" "$LOGO_DIR" "$I18N_DIR" "$EXE_DIR"

cp "$IMPORTERS_SRC" "$EXE_DIR/importers.bundle.js"
cp "$EXPORTERS_SRC" "$EXE_DIR/exporters.bundle.js"
cp -R "$BUNDLES_SRC/." "$BUNDLES_DIR/"
if [[ -f "$LOGO_SRC" ]]; then
  cp "$LOGO_SRC" "$LOGO_DIR/exe_powered_logo.png"
fi
# i18n: template (key -> c_("English")) plus per-language resolved files
# (key -> translation). The legacy exporter combines them into the
# source->target map it needs to translate navigation labels and licenses.
if [[ -f "$I18N_TEMPLATE_SRC" ]]; then
  cp "$I18N_TEMPLATE_SRC" "$I18N_TEMPLATE_DEST"
fi
if [[ -d "$I18N_SRC_DIR" ]]; then
  cp -R "$I18N_SRC_DIR/." "$I18N_DIR/"
fi

source_commit="$(resolve_tag_commit "$latest_tag")"
source_version="${latest_tag#v}"
synced_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

node - "$RUNTIME_SOURCE_JSON" "$EXE_REPO_URL" "$latest_tag" "$release_asset" "$latest_published_at" "$source_commit" "$source_version" "$synced_at" <<'NODE'
const fs = require("fs");
const [out, repo, tag, asset, publishedAt, commit, version, syncedAt] = process.argv.slice(2);
const payload = {
  sourceRepo: repo,
  sourceMode: "release",
  sourceReleaseTag: tag,
  sourceReleaseAsset: asset,
  sourceReleasePublishedAt: publishedAt,
  sourceCommit: commit,
  sourceVersion: version,
  syncedAt
};
fs.writeFileSync(out, JSON.stringify(payload, null, 2) + "\n");
NODE

echo "Synced eXeLearning runtime into $EXE_DIR"
echo "Recorded source release $latest_tag in ${RUNTIME_SOURCE_JSON#$REPO_ROOT/}"
