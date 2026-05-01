const { app, BrowserWindow } = require("electron");

let autoUpdater;
try {
  autoUpdater = require("electron-updater").autoUpdater;
} catch (e) {
  console.log("autoUpdater not available");
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

  // 🛡 กัน crash
  if (autoUpdater) {
    try {
      autoUpdater.checkForUpdatesAndNotify();

      autoUpdater.on("update-downloaded", () => {
        autoUpdater.quitAndInstall();
      });

    } catch (e) {
      console.log("Updater error:", e);
    }
  }
});
