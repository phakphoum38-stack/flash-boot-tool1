const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const flash = require('./flash-manager')
const usb = require('./usb-service')
const vm = require('./vm-tester')

let win

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true
    }
  })

  win.loadURL(process.env.VITE_DEV_SERVER_URL)
  win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

// =========================
// IPC CLEAN LAYER
// =========================
ipcMain.handle('flash:start', (_, payload) => flash.start(win, payload))
ipcMain.handle('flash:cancel', () => flash.cancel())

ipcMain.handle('usb:list', () => usb.list())
ipcMain.handle('usb:smart', (_, dev) => usb.smartCheck(dev))

ipcMain.handle('vm:test', (_, iso) => vm.bootTest(iso))
