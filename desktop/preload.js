const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("maxx", {
  getBackendUrl: () => ipcRenderer.invoke("maxx:get-backend-url"),
  platform: process.platform,
  isDesktop: true,
  version: process.versions.electron,
});
