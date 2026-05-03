const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onLog: (cb) => ipcRenderer.on("backend-log", (_, data) => cb(data)),
  onReady: (cb) => ipcRenderer.on("backend-ready", cb),
  onError: (cb) => ipcRenderer.on("backend-error", cb)
});

const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  onUpdateStatus: (cb) => ipcRenderer.on("update-status", (_, msg) => cb(msg)),
  onUpdateProgress: (cb) => ipcRenderer.on("update-progress", (_, data) => cb(data)),
  selectISO: () => ipcRenderer.invoke("select-iso")
});
