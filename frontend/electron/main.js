const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const fetch = require("node-fetch");
const { autoUpdater } = require("electron-updater");

let backend = null;
let win = null;

// =========================
// 📦 BACKEND PATH
// =========================
function getBackendPath() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "backend", "backend.exe")
    : path.join(__dirname, "../../backend/dist/backend.exe");
}

// =========================
// 🚀 START BACKEND (SAFE + SINGLE INSTANCE)
// =========================
function startBackend() {
  const backendPath = getBackendPath();

  console.log("🚀 Starting backend:", backendPath);

  if (backend) {
    try {
      backend.kill();
    } catch {}
  }

  backend = spawn(backendPath, [], {
    windowsHide: true,
    stdio: "pipe"
  });

  backend.stdout.on("data", (d) => console.log("[BE]", d.toString()));
  backend.stderr.on("data", (d) => console.error("[BE ERR]", d.toString()));

  backend.on("exit", (code) => {
    console.error("💀 Backend exited:", code);

    // 🔁 SAFE RESTART (no spam loop)
    setTimeout(() => {
      if (!app.isQuitting) {
        startBackend();
      }
    }, 2000);
  });

  backend.on("error", (err) => {
    console.error("❌ Backend error:", err);
  });
}

// =========================
// 🧪 HEALTH CHECK
// =========================
async function waitForBackend() {
  for (let i = 0; i < 30; i++) {
    try {
      await fetch("http://127.0.0.1:8000/health");
      console.log("✅ Backend ready");
      return;
    } catch {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  throw new Error("Backend failed to start");
}

// =========================
// 🧠 WATCHDOG (ANTI CRASH LOOP)
// =========================
function startWatchdog() {
  let lastOK = Date.now();

  setInterval(async () => {
    try {
      await fetch("http://127.0.0.1:8000/health");
      lastOK = Date.now();
    } catch {
      const diff = Date.now() - lastOK;

      // 🔥 only restart if dead > 10 sec
      if (diff > 10000) {
        console.error("⚠️ Backend dead -> restarting");

        if (backend) {
          try {
            backend.kill();
          } catch {}
        }

        setTimeout(() => {
          startBackend();
        }, 1500);
      }
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

  return win;
}

// =========================
// 🔄 AUTO UPDATE (SINGLE FIXED VERSION)
// =========================
function setupAutoUpdater(win) {
  if (!win) return;

  autoUpdater.autoDownload = true;

  autoUpdater.on("checking-for-update", () => {
    win.webContents.send("update-status", "checking");
  });

  autoUpdater.on("update-available", () => {
    win.webContents.send("update-status", "downloading");
  });

  autoUpdater.on("download-progress", (p) => {
    win.webContents.send("update-progress", {
      percent: Math.round(p.percent || 0)
    });
  });

  autoUpdater.on("update-downloaded", () => {
    win.webContents.send("update-status", "ready");

    setTimeout(() => {
      autoUpdater.quitAndInstall();
    }, 2500);
  });

  autoUpdater.on("error", (err) => {
    console.error("Update error:", err);
    win.webContents.send("update-status", "error");
  });

  autoUpdater.checkForUpdatesAndNotify();
}

// =========================
// 🔥 APP LIFECYCLE
// =========================
app.whenReady().then(async () => {
  win = createWindow();

  startBackend();

  await waitForBackend();

  startWatchdog();

  setupAutoUpdater(win);
});

// =========================
// 🧯 CLEAN EXIT
// =========================
app.on("before-quit", () => {
  app.isQuitting = true;

  if (backend) {
    try {
      backend.kill();
    } catch {}
  }
});
});
