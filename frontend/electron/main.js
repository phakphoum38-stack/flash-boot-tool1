const { app, BrowserWindow } = require("electron");
const { autoUpdater } = require("electron-updater");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  win.loadURL("http://localhost:5173"); // Vite dev or build path
}

app.whenReady().then(() => {
  createWindow();

  // 🚀 CHECK UPDATE ON START
  autoUpdater.checkForUpdatesAndNotify();
});

// 📦 UPDATE AVAILABLE
autoUpdater.on("update-available", () => {
  win.webContents.send("update-status", "downloading");
});

// 📥 DOWNLOAD PROGRESS
autoUpdater.on("download-progress", (progress) => {
  win.webContents.send("update-progress", progress);
});

// ✅ UPDATE DOWNLOADED
autoUpdater.on("update-downloaded", () => {
  win.webContents.send("update-status", "ready-to-install");

  // 🔥 auto install + restart
  setTimeout(() => {
    autoUpdater.quitAndInstall();
  }, 2000);
});
