const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fetch = require("node-fetch");

let backend;
let win;

// =========================
// 📦 GET BACKEND PATH
// =========================
function getBackendPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "backend", "backend.exe")
    : path.join(__dirname, "../../backend/dist/backend.exe");
}

// =========================
// 🚀 START BACKEND (SAFE)
// =========================
function startBackend() {

  const backendPath = getBackendPath();

  console.log("🚀 Starting backend:", backendPath);

  backend = spawn(backendPath, [], {
    windowsHide: true,
    stdio: "pipe"
  });

  backend.stdout.on("data", d => console.log("[BE]", d.toString()));
  backend.stderr.on("data", d => console.error("[BE ERROR]", d.toString()));

  backend.on("exit", (code) => {
    console.error("💀 Backend exited:", code);

    // 🔁 AUTO RESTART (CRASH RECOVERY)
    setTimeout(() => {
      console.log("🔁 Restarting backend...");
      startBackend();
    }, 2000);
  });

  backend.on("error", (err) => {
    console.error("❌ Backend spawn error:", err);
  });
}

// =========================
// 🧪 HEALTH CHECK (WATCHDOG)
// =========================
async function waitForBackend() {

  for (let i = 0; i < 40; i++) {
    try {
      await fetch("http://127.0.0.1:8000");
      console.log("✅ Backend ready");
      return;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  throw new Error("Backend failed to start");
}

// =========================
// 🐕 CONTINUOUS WATCHDOG
// =========================
function startWatchdog() {

  setInterval(async () => {
    try {
      await fetch("http://127.0.0.1:8000");
    } catch (err) {
      console.error("⚠️ Backend unreachable - restarting...");

      if (backend) backend.kill();

      setTimeout(() => {
        startBackend();
      }, 1000);
    }
  }, 5000);
}

// =========================
// 🖥 WINDOW
// =========================
function createWindow() {

  win = new BrowserWindow({
    width: 1100,
    height: 750,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  const indexPath = app.isPackaged
    ? path.join(__dirname, "../dist/index.html")
    : path.join(__dirname, "../../frontend/dist/index.html");

  win.loadFile(indexPath);
}

// =========================
// 🔄 AUTO UPDATE SAFE
// =========================
function setupAutoUpdater() {

  let autoUpdater;

  try {
    autoUpdater = require("electron-updater").autoUpdater;
  } catch {
    console.log("auto updater not available");
    return;
  }

  autoUpdater.autoDownload = true;

  autoUpdater.on("checking-for-update", () => {
    win?.webContents.send("update-status", "checking");
  });

  autoUpdater.on("update-available", () => {
    win?.webContents.send("update-status", "downloading");
  });

  autoUpdater.on("download-progress", (p) => {
    win?.webContents.send("update-progress", p);
  });

  autoUpdater.on("update-downloaded", () => {
    win?.webContents.send("update-status", "ready");

    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 2000);
  });

  autoUpdater.on("error", () => {
    win?.webContents.send("update-status", "error");
  });

  autoUpdater.checkForUpdatesAndNotify();
}

// =========================
// 🔥 APP LIFECYCLE
// =========================
app.whenReady().then(async () => {

  startBackend();

  await waitForBackend();

  startWatchdog();   // 🧠 NEW
  createWindow();
  setupAutoUpdater();

});

// =========================
// 🧯 CLEAN EXIT
// =========================
app.on("will-quit", () => {
  if (backend) backend.kill();
});
