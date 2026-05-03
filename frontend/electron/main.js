
function startBackend() {
  const exePath = path.join(__dirname, "../../backend/dist/main.exe");

  backend = spawn(exePath);

  backend.stdout.on("data", d => console.log(d.toString()));
  backend.stderr.on("data", d => console.error(d.toString()));
}

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

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700
  });

  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(async () => {
  startBackend();
  await waitForBackend();
  createWindow();
});

app.on("will-quit", () => backend && backend.kill());
