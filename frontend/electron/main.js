const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let backend;
let mainWindow;

function startBackend() {
  let exePath = app.isPackaged
    ? path.join(process.resourcesPath, "backend", "backend.exe")
    : path.join(__dirname, "../../backend/dist/backend.exe");

  backend = spawn(exePath, [], { windowsHide: true });

  backend.stdout.on("data", d => {
    const msg = d.toString();
    console.log("[BE]", msg);
    mainWindow?.webContents.send("backend-log", msg);
  });

  backend.stderr.on("data", d => {
    const msg = d.toString();
    console.error("[BE ERR]", msg);
    mainWindow?.webContents.send("backend-log", "❌ " + msg);
  });
}

async function waitForBackend() {
  for (let i = 0; i < 30; i++) {
    try {
      await fetch("http://127.0.0.1:8000");
      return;
    } catch {
      await new Promise(r => setTimeout(r, 500));
    }
  }
  throw new Error("Backend failed");
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js")
    }
  });

  mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(async () => {
  createWindow(); // 👉 เปิดก่อน เพื่อโชว์ loading

  startBackend();

  try {
    await waitForBackend();

    mainWindow.webContents.send("backend-ready");

  } catch {
    mainWindow.webContents.send("backend-error");
  }
});

app.on("will-quit", () => backend && backend.kill());
