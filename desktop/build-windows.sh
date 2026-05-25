#!/usr/bin/env bash
# Maxx Player — Windows installer builder
# Run from /app — produces dist/Maxx-Player-Setup-*.exe + portable .zip
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DESKTOP="$ROOT/desktop"
DIST="$DESKTOP/dist"

echo "[1/5] Building React production bundle..."
cd "$ROOT/frontend"
NODE_OPTIONS="--max-old-space-size=4096" GENERATE_SOURCEMAP=false yarn build

echo "[2/5] Copying web build into desktop wrapper..."
rm -rf "$DESKTOP/web"
cp -r "$ROOT/frontend/build" "$DESKTOP/web"

echo "[3/5] Preparing win-unpacked from prebuilt Electron..."
mkdir -p "$DIST/win-unpacked"
rm -rf "$DIST/win-unpacked"/*

ELECTRON_ZIP="$HOME/.cache/electron/electron-v31.7.7-win32-x64.zip"
if [ ! -f "$ELECTRON_ZIP" ]; then
  echo "Downloading prebuilt Electron Windows binary..."
  mkdir -p "$HOME/.cache/electron"
  curl -L -o "$ELECTRON_ZIP" \
    "https://github.com/electron/electron/releases/download/v31.7.7/electron-v31.7.7-win32-x64.zip"
fi
cd "$DIST/win-unpacked" && unzip -q "$ELECTRON_ZIP"
mv electron.exe "Maxx Player.exe"
rm -f resources/default_app.asar

echo "[4/5] Packing app source into asar..."
TMP="$(mktemp -d)"
cp -r "$DESKTOP/main.js" "$DESKTOP/preload.js" "$DESKTOP/package.json" \
      "$DESKTOP/web" "$DESKTOP/assets" "$TMP/"
cd "$TMP/.." && npx --yes @electron/asar@3.2.10 pack "$(basename "$TMP")" \
  "$DIST/win-unpacked/resources/app.asar"
rm -rf "$TMP"

echo "[5/5] Building NSIS installer..."
cd "$DIST"
makensis -V2 installer.nsi

echo "[5b/5] Building portable .zip..."
zip -qr "Maxx-Player-Portable-1.0.0-x64.zip" win-unpacked/

echo
echo "Done. Artifacts:"
ls -lh "$DIST"/*.exe "$DIST"/*.zip 2>/dev/null
