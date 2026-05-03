const { app, BrowserWindow } = require("electron");
const { spawn } = require("child_process");
const path = require("path");

let backend;

// 🚀 START BACKEND
function startBackend() {
  let exePath;

  if (app.isPackaged) {
    // 📦 ตอน build แล้ว
    exePath = path.join(process.resourcesPath, "backend", "backend.exe");
  } else {
    // 🧪 ตอน dev
    exePath = path.join(__dirname, "../../backend/dist/backend.exe");
  }

  console.log("🚀 backend path:", exePath);

  backend = spawn(exePath, [], {
    windowsHide: true
  });

  backend.stdout.on("data", d => console.log("[BE]", d.toString()));
  backend.stderr.on("data", d => console.error("[BE ERR]", d.toString()));

  backend.on("close", code => {
    console.log("❌ backend exit:", code);
  });
}

// ⏳ WAIT BACKEND READY
async function waitForBackend() {
  for (let i = 0; i < 20; i++) {
    try {
      await fetch("http://127.0.0.1:8000");
      console.log("✅ Backend ready");
      return;
    } catch {
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
  startBackend();

  await waitForBackend();   // ⭐ สำคัญมาก

  createWindow();
});

// 🛑 ปิด backend ตอนปิด app
app.on("will-quit", () => {
  if (backend) backend.kill();
});
