// Maxx Player — Electron main process
const { app, BrowserWindow, Menu, shell, ipcMain, session } = require("electron");
const path = require("path");
const url = require("url");

const isDev = !app.isPackaged;

// Backend URL — baked in at build time. Override with MAXX_BACKEND_URL env var.
const BACKEND_URL = process.env.MAXX_BACKEND_URL
  || "https://stream-hub-pro-7.preview.emergentagent.com";

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 640,
    backgroundColor: "#050505",
    title: "Maxx Player",
    show: false,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "assets", "icon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: true,
    },
  });

  // Strip the X-Frame-Options/CSP so we can load HLS streams and the embedded UI
  session.defaultSession.webRequest.onHeadersReceived((details, cb) => {
    const headers = details.responseHeaders || {};
    delete headers["x-frame-options"];
    delete headers["X-Frame-Options"];
    cb({ responseHeaders: headers });
  });

  // Splash gradient until the renderer is ready
  mainWindow.loadURL(
    `data:text/html,<html><body style="background:#050505;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0"><div style="text-align:center"><div style="width:64px;height:64px;background:linear-gradient(135deg,#E50914,#7a040a);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;font-weight:900;font-size:32px">M</div><div style="margin-top:16px;letter-spacing:0.3em;font-size:12px;color:#888">LOADING MAXX</div></div></body></html>`
  );

  mainWindow.once("ready-to-show", () => mainWindow.show());

  // Load the bundled web build (production) or the dev server (when running `yarn start` in /app/frontend)
  const target = isDev
    ? "http://localhost:3000"
    : url.format({
        pathname: path.join(__dirname, "web", "index.html"),
        protocol: "file:",
        slashes: true,
      });

  setTimeout(() => mainWindow.loadURL(target), 200);

  // Open external links in OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url: target }) => {
    shell.openExternal(target);
    return { action: "deny" };
  });

  // Custom menu
  const menu = Menu.buildFromTemplate([
    {
      label: "File",
      submenu: [
        {
          label: "Reload",
          accelerator: "CmdOrCtrl+R",
          click: () => mainWindow && mainWindow.reload(),
        },
        { type: "separator" },
        { role: "quit" },
      ],
    },
    {
      label: "View",
      submenu: [
        { role: "togglefullscreen" },
        { role: "toggledevtools", accelerator: "CmdOrCtrl+Shift+I" },
        { type: "separator" },
        { role: "zoomin" },
        { role: "zoomout" },
        { role: "resetzoom" },
      ],
    },
    {
      label: "Help",
      submenu: [
        {
          label: "Project",
          click: () => shell.openExternal("https://emergent.sh"),
        },
        {
          label: "About",
          click: () =>
            shell.openExternal(
              "https://github.com/maxx-player/desktop"
            ),
        },
      ],
    },
  ]);
  Menu.setApplicationMenu(menu);
}

ipcMain.handle("maxx:get-backend-url", () => BACKEND_URL);

// Single instance
const gotSingleLock = app.requestSingleInstanceLock();
if (!gotSingleLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(createWindow);

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}
