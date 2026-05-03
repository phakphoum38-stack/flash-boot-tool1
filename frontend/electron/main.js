const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");

let win;
let backendProcess;

// 🚀 start backend
function startBackend() {
  const backendPath = path.join(__dirname, "../../backend/main.py");

  console.log("Starting backend:", backendPath);

  backendProcess = spawn("python", [backendPath], {
    shell: true
  });

  backendProcess.stdout.on("data", (data) => {
    console.log("[BACKEND]", data.toString());
  });

  backendProcess.stderr.on("data", (data) => {
    console.error("[BACKEND ERROR]", data.toString());
  });
}

// 🪟 window
function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  const indexPath = path.join(__dirname, "../dist/index.html");

  win.loadFile(indexPath);

  win.webContents.openDevTools();
}

app.whenReady().then(() => {
  startBackend();

  // ⏳ รอ backend ขึ้นก่อน
  setTimeout(() => {
    createWindow();
  }, 3000);
});

// 🧹 kill backend ตอนปิด
app.on("will-quit", () => {
  if (backendProcess) {
    backendProcess.kill();
  }
});
