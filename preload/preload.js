const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {

  flashStart: (data) =>
    ipcRenderer.invoke('flash:start', data),

  cancelFlash: () =>
    ipcRenderer.invoke('flash:cancel'),

  getUsb: () =>
    ipcRenderer.invoke('usb:list'),

  smartUsb: (dev) =>
    ipcRenderer.invoke('usb:smart', dev),

  vmTest: (iso) =>
    ipcRenderer.invoke('vm:test', iso),

  onFlash: (cb) => {
    ipcRenderer.on('flash:event', (_, d) => cb(d))
  }
})
