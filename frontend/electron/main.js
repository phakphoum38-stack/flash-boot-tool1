const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let backend;

// 🚀 START BACKEND
function startBackend() {
  let exePath;

  if (app.isPackaged) {
    exePath = path.join(process.resourcesPath, "backend", "backend.exe");
  } else {
    exePath = path.join(__dirname, "../../backend/dist/backend.exe");
  }

  console.log("🚀 backend path:", exePath);

  backend = spawn(exePath, [], {
    windowsHide: true
  });

  backend.stdout.on("data", d => console.log("[BE]", d.toString()));
  backend.stderr.on("data", d => console.error("[BE ERR]", d.toString()));

  backend.on("error", err => {
    console.error("❌ spawn error:", err);
  });

  backend.on("close", code => {
    console.log("❌ backend exit:", code);
  });
}

// ⏳ WAIT BACKEND READY
async function waitForBackend() {

  const fetchFn = global.fetch || require("node-fetch"); // 🔥 กันพัง

  for (let i = 0; i < 30; i++) {   // เพิ่ม retry
    try {
      await fetchFn("http://127.0.0.1:8000");
      console.log("✅ Backend ready");
      return;
    } catch (e) {
      console.log("⏳ waiting backend...");
      await new Promise(r => setTimeout(r, 500));
    }
  }

  throw new Error("❌ Backend start failed");
}

// 🖥 WINDOW
function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700
  });

  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

// 🔥 MAIN FLOW
app.whenReady().then(async () => {
  try {
    startBackend();

    await waitForBackend();

    createWindow();

  } catch (err) {
    console.error(err);

    // 🔥 ถ้า backend fail ให้โชว์ error แทนจอดำ
    const win = new BrowserWindow({
      width: 600,
      height: 400
    });

    win.loadURL("data:text/html,<h1>Backend failed to start</h1>");
  }
});

// 🛑 ปิด backend ตอนปิด app
app.on("will-quit", () => {
  if (backend) backend.kill();
});
