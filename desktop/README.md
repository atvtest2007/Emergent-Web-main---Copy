# Maxx Player — Desktop (Windows installer)

This folder contains the Electron wrapper that turns the Maxx Player web app into a Windows desktop application with a proper `.exe` installer.

## What the installer produces

When you run `yarn dist:win` on a Windows or macOS machine, electron-builder produces:

```
dist/
├── Maxx Player-Setup-1.0.0-x64.exe     ← NSIS installer (recommended)
├── Maxx Player-Portable-1.0.0.exe      ← Portable single-file .exe
└── win-unpacked/                       ← Unpacked app folder
    └── Maxx Player.exe                 ← Direct launcher (no install)
```

The NSIS installer:
- Lets users pick install directory
- Creates Start-Menu + Desktop shortcuts
- Registers an uninstaller in *Apps & Features*
- Per-user install (no admin required by default)

## Architecture

The Electron app is a thin desktop **client** that loads the production React build (`/app/desktop/web/`) and talks to the deployed Maxx Player backend (FastAPI + MongoDB on Emergent). It is **not** fully offline — the backend must be reachable.

To change the backend URL after install, users can launch the app with:

```cmd
set MAXX_BACKEND_URL=https://my-own-host.example.com
"Maxx Player.exe"
```

## Build prerequisites

- **Node.js 18+** (with `corepack enable` or yarn 1.x globally)
- The web build must exist next to `main.js` — `yarn build:web` does this automatically.

### Windows host (recommended)

```cmd
cd desktop
yarn install
yarn dist:win
```

Produces both the NSIS installer and the portable `.exe` in `dist/`.

### macOS host (cross-build)

```bash
cd desktop
yarn install
yarn dist:win
```

electron-builder downloads the Wine + Mono prebuilts automatically on macOS.

### Linux host (cross-build)

Requires `wine` and `mono` installed. Not supported on ARM Linux — you must use an **x86_64** machine. From an x86_64 Ubuntu host:

```bash
sudo apt-get install -y wine64 mono-devel
cd /app/desktop
yarn install
yarn dist:win
```

## Why this folder can't build the installer in *this* container

This Emergent container is **arm64 Linux**. electron-builder's `win/nsis` target requires running the Windows `makensis.exe` under x86 Wine. Wine on arm64 is not a reliable target. You'll get a working installer only from a Windows, macOS, or x86_64 Linux machine.

If you really must build from arm64 Linux, run `yarn dist:dir` to get an unpacked `win-unpacked/` folder. Zip and ship that as a portable archive — users double-click `Maxx Player.exe` inside.

## What's inside

- `main.js` — Electron main process (window, menus, single-instance lock, header overrides for HLS playback).
- `preload.js` — Exposes `window.maxx.getBackendUrl()` etc. to the renderer.
- `package.json` — electron-builder config + build scripts.
- `web/` — Generated production React build (populated by `yarn build:web`).
- `assets/icon.png` — App icon (replace with your own 512×512 PNG; electron-builder generates `.ico` automatically).
- `LICENSE.txt` — Shown in the NSIS installer.

## GitHub Actions (suggested)

Add a workflow under `.github/workflows/desktop.yml` to auto-build on every tag:

```yaml
name: Desktop
on:
  push:
    tags: ['v*']
jobs:
  windows:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: |
          cd frontend && yarn install --frozen-lockfile
          cd ../desktop && yarn install --frozen-lockfile
          yarn dist:win
      - uses: actions/upload-artifact@v4
        with:
          name: maxx-player-win
          path: desktop/dist/*.exe
```

## Customization tips

- Replace `assets/icon.png` with a high-resolution branded icon.
- Change `productName`, `appId`, and `copyright` in `package.json` → `build`.
- Set `nsis.oneClick: true` if you want a single-click silent installer.
- Add code-signing under `build.win.certificateFile` + `certificatePassword` env var for SmartScreen-friendly installs.
