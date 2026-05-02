const { app, BrowserWindow } = require("electron");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // ✅ FIX PATH (สำคัญ)
  const indexPath = path.join(__dirname, "../dist/index.html");

  console.log("LOAD:", indexPath);

  win.loadFile(indexPath);

  // ✅ เปิด debug ดู error
  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);
