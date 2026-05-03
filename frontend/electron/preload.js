const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {

  // ISO picker
  selectISO: () => ipcRenderer.invoke("select-iso"),

  // update system
  onUpdateStatus: (cb) =>
    ipcRenderer.on("update-status", (_, msg) => cb(msg)),

  onUpdateProgress: (cb) =>
    ipcRenderer.on("update-progress", (_, data) => cb(data)),

  // optional logs
  onLog: (cb) =>
    ipcRenderer.on("backend-log", (_, data) => cb(data)),

  onError: (cb) =>
    ipcRenderer.on("backend-error", (_, data) => cb(data))

});
