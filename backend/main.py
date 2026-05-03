const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let autoUpdater;
try {
  autoUpdater = require("electron-updater").autoUpdater;
} catch {
  console.log("⚠️ autoUpdater not available");
}

let backend;

// =========================
// 🚀 START BACKEND
// =========================
function startBackend() {
  let exePath;

  if (app.isPackaged) {
    exePath = path.join(process.resourcesPath, "backend", "backend.exe");
  } else {
    exePath = path.join(__dirname, "../../backend/dist/backend.exe");
  }

  backend = spawn(exePath, [], { windowsHide: true });

  backend.stdout.on("data", d => console.log("[BE]", d.toString()));
  backend.stderr.on("data", d => console.error("[BE ERR]", d.toString()));
}

// =========================
// ⏳ WAIT BACKEND
// =========================
async function waitForBackend() {
  const fetch = require("node-fetch");

  for (let i = 0; i < 20; i++) {
    try {
      await fetch("http://127.0.0.1:8000");
      return;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
}

// =========================
// 🖥 WINDOW
// =========================
let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

// =========================
// 🔄 AUTO UPDATE
// =========================
function setupAutoUpdater() {
  if (!autoUpdater) return;

  autoUpdater.autoDownload = true;

  autoUpdater.on("checking-for-update", () => {
    win.webContents.send("update-status", "checking");
  });

  autoUpdater.on("update-available", () => {
    win.webContents.send("update-status", "downloading");
  });

  autoUpdater.on("download-progress", (p) => {
    win.webContents.send("update-progress", p);
  });

  autoUpdater.on("update-downloaded", () => {
    win.webContents.send("update-status", "ready-to-install");

    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 2000);
  });

  autoUpdater.on("error", (err) => {
    win.webContents.send("update-status", "error");
    console.error(err);
  });

  autoUpdater.checkForUpdatesAndNotify();
}

// =========================
// 🔥 MAIN
// =========================
app.whenReady().then(async () => {
  startBackend();
  await waitForBackend();
  createWindow();
  setupAutoUpdater();
});

app.on("will-quit", () => backend && backend.kill());
