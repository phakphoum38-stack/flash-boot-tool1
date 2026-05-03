import { useEffect, useState } from "react";

export default function App() {

  const [iso, setIso] = useState("");
  const [device, setDevice] = useState("");
  const [devices, setDevices] = useState([]);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("idle");

  const [updateStatus, setUpdateStatus] = useState("");
  const [updateProgress, setUpdateProgress] = useState(0);

  // =========================
  // 🔌 AUTO DETECT USB
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/devices");
        const json = await res.json();
        setDevices(json);
      } catch (err) {
        console.log(err);
      }
    };

    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, []);

  // =========================
  // 🔄 AUTO UPDATE UI
  // =========================
  useEffect(() => {
    if (!window.api) return;

    window.api.onUpdateStatus?.(setUpdateStatus);
    window.api.onUpdateProgress?.(p => setUpdateProgress(Math.round(p)));
  }, []);

  // =========================
  // 📁 PICK ISO
  // =========================
  const pickISO = async () => {
    const file = await window.api?.selectISO?.();
    if (file) setIso(file);
  };

  // =========================
  // 🚀 FLASH
  // =========================
  const startFlash = async () => {

    setStatus("flashing");

    const res = await fetch("http://127.0.0.1:8000/flash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ iso, device })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (let line of lines) {
        if (!line.trim()) continue;

        try {
          const p = JSON.parse(line);
          setProgress(p.progress || 0);

          if (p.status === "done") {
            setStatus("done");
          }
        } catch (err) {}
      }
    }
  };

  // =========================
  // 🎯 UI
  // =========================
  return (
    <div style={{
      height: "100vh",
      background: "#0f172a",
      color: "white",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "sans-serif"
    }}>

      <h1 style={{ marginBottom: 30 }}>
        🔥 Flash Boot Tool
      </h1>

      {/* STEP 1 */}
      <div style={card}>
        <h3>1. Select Image</h3>
        <button onClick={pickISO}>📁 Choose ISO</button>
        <p>{iso || "No file selected"}</p>
      </div>

      {/* STEP 2 */}
      <div style={card}>
        <h3>2. Select USB</h3>
        <select value={device} onChange={e => setDevice(e.target.value)}>
          <option value="">-- Select --</option>
          {devices.map((d, i) => (
            <option key={i} value={d.path}>
              {d.model} ({d.size})
            </option>
          ))}
        </select>
      </div>

      {/* STEP 3 */}
      <div style={card}>
        <h3>3. Flash</h3>

        <button
          disabled={!iso || !device || status === "flashing"}
          onClick={startFlash}
          style={{
            background: status === "flashing" ? "#555" : "#22c55e",
            padding: "10px 20px",
            border: "none",
            borderRadius: 6,
            color: "white",
            cursor: "pointer"
          }}
        >
          {status === "flashing" ? "Flashing..." : "⚡ Flash"}
        </button>

        {/* PROGRESS */}
        <div style={{
          marginTop: 15,
          width: 300,
          height: 10,
          background: "#333",
          borderRadius: 5
        }}>
          <div style={{
            width: progress + "%",
            height: "100%",
            background: "#22c55e",
            transition: "width 0.2s"
          }} />
        </div>

        <p>{progress}%</p>

        {status === "done" && (
          <p style={{ color: "lime" }}>✅ Done!</p>
        )}
      </div>

      {/* UPDATE PANEL */}
      {updateStatus && (
        <div style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "#111",
          padding: 15,
          borderRadius: 10,
          width: 250
        }}>
          <h4>🔄 Update</h4>

          {updateStatus === "checking" && <p>Checking...</p>}

          {updateStatus === "downloading" && (
            <>
              <p>Downloading...</p>
              <div style={{
                height: 8,
                background: "#333",
                borderRadius: 4
              }}>
                <div style={{
                  width: updateProgress + "%",
                  height: "100%",
                  background: "cyan"
                }} />
              </div>
              <p>{updateProgress}%</p>
            </>
          )}

          {updateStatus === "ready-to-install" && (
            <p>⚡ Installing...</p>
          )}
        </div>
      )}

    </div>
  );
}

// 🎨 STYLE
const card = {
  background: "#1e293b",
  padding: 20,
  borderRadius: 10,
  marginBottom: 15,
  width: 350,
  textAlign: "center"
};
