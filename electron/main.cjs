const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const { autoUpdater } = require("electron-updater");

// =========================
// 🌐 CONFIG & GLOBALS
// =========================
const serverFetch = global.fetch;
let backend = null;
let win = null;
let splash = null;

// =========================
// 📦 BACKEND PATH
// =========================
function getBackendPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, "backend", "backend.exe");
  }
  return path.resolve(__dirname, "..", "backend", "dist", "backend.exe");
}

// =========================
// 🚀 BACKEND START
// =========================
function startBackend() {
  const backendPath = getBackendPath();
  console.log("Starting backend at:", backendPath);

  if (backend) {
    try { backend.kill(); } catch (e) {}
  }

  backend = spawn(backendPath, [], {
    windowsHide: true,
    stdio: "pipe"
  });

  backend.stdout.on("data", d => console.log("[BE]", d.toString()));
  backend.stderr.on("data", d => console.error("[BE ERR]", d.toString()));

  backend.on("exit", (code) => {
    console.log(`Backend exited with code ${code}`);
    if (!app.isQuitting) {
      setTimeout(startBackend, 2000);
    }
  });
}

// =========================
// 🧪 HEALTH CHECK
// =========================
async function waitForBackend() {
  const HEALTH_URL = "http://127.0.0.1:8000/health";
  for (let i = 0; i < 40; i++) {
    try {
      const res = await serverFetch(HEALTH_URL);
      if (res.ok) return true;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error("ระบบ Backend ไม่ตอบสนอง (Timeout 20s)");
}

// =========================
// 🖥 MAIN WINDOW
// =========================
function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 750,
    show: false,
    backgroundColor: "#ffffff",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false 
    }
  });

  // เลือก Path ให้ตรงกับที่คุณเซตไว้ใน package.json (กรณีที่ 2: frontend/dist)
  const indexPath = app.isPackaged
    ? path.join(app.getAppPath(), "frontend", "dist", "index.html")
    : path.join(__dirname, "..", "frontend", "dist", "index.html");

  console.log("Loading UI from:", indexPath);

  win.loadFile(indexPath).catch(err => {
    console.error("หาไฟล์ UI ไม่เจอ:", err);
    dialog.showErrorBox("UI Error", `ไม่พบไฟล์ที่: ${indexPath}`);
  });

  win.once("ready-to-show", () => {
    if (splash && !splash.isDestroyed()) splash.close();
    win.show();
    if (!app.isPackaged) win.webContents.openDevTools();
  });

  return win; // คืนค่าตัวแปร win ออกไป
}

// =========================
// 📥 IPC HANDLERS
// =========================
ipcMain.handle("select-iso", async () => {
  const { canceled, filePaths } = await dialog.showOpenDialog({
    title: "เลือกไฟล์ ISO Image",
    properties: ["openFile"],
    filters: [{ name: "ISO Images", extensions: ["iso"] }]
  });
  if (canceled) return null;
  return filePaths[0];
});

// =========================
// 💫 SPLASH SCREEN
// =========================
function createSplash() {
  splash = new BrowserWindow({
    width: 400,
    height: 300,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    webPreferences: { nodeIntegration: false }
  });
  splash.loadFile(path.join(__dirname, "splash.html"));
}

// =========================
// 🔥 APP START
// =========================
app.whenReady().then(async () => {
  createSplash();
  startBackend();

  try {
    await waitForBackend();
    const mainWindow = createWindow(); // สร้างหน้าต่างหลังจาก backend พร้อม
    
    if (app.isPackaged) {
      autoUpdater.checkForUpdatesAndNotify();
    }
  } catch (e) {
    console.error("Startup error:", e);
    if (splash && !splash.isDestroyed()) splash.close();
    dialog.showErrorBox("Startup Error", e.message);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  app.isQuitting = true;
  if (backend) {
    try { backend.kill(); } catch (e) {}
  }
});