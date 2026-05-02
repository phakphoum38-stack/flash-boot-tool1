const { app, BrowserWindow } = require("electron");

let autoUpdater = null;
try {
  autoUpdater = require("electron-updater").autoUpdater;
} catch (e) {
  console.log("no updater");
}

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadFile("dist/index.html");
}

app.whenReady().then(() => {
  createWindow();

  if (autoUpdater) {
    try {
      autoUpdater.checkForUpdatesAndNotify();
    } catch (e) {
      console.log("updater error:", e);
    }
  }
});
