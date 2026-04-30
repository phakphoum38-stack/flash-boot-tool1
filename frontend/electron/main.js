const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true
    }
  });

  win.loadURL("http://localhost:5173");
}

app.whenReady().then(createWindow);


// 📁 Native ISO picker (REAL PATH)
ipcMain.handle("select-iso", async () => {
  const result = await dialog.showOpenDialog(win, {
    properties: ["openFile"],
    filters: [
      { name: "ISO/DMG", extensions: ["iso", "dmg"] }
    ]
  });

  return result.filePaths[0];
});
