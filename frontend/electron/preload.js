const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {

  selectISO: () => ipcRenderer.invoke("select-iso"),

  onUpdateStatus: (cb) =>
    ipcRenderer.on("update-status", (_, data) => cb(data)),

  onUpdateProgress: (cb) =>
    ipcRenderer.on("update-progress", (_, data) => cb(data))

});
