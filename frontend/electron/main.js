const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700
  });

  const file = path.join(__dirname, "../dist/index.html");

  console.log("LOAD FILE:", file);

  win.loadFile(file);
}

app.whenReady().then(createWindow);app.whenReady().then(() => {
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
