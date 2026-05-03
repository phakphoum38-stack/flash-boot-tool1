const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onLog: (cb) => ipcRenderer.on("backend-log", (_, data) => cb(data)),
  onReady: (cb) => ipcRenderer.on("backend-ready", cb),
  onError: (cb) => ipcRenderer.on("backend-error", cb)
});
