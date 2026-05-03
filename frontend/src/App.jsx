import { useEffect, useState } from "react";
import ProgressBar from "../components/ProgressBar";
import SafeConfirm from "../components/SafeConfirm";

export default function App() {

  const [iso, setIso] = useState("");
  const [device, setDevice] = useState("");
  const [devices, setDevices] = useState([]);
  const [format, setFormat] = useState("fat32");
  const [data, setData] = useState({ progress: 0, status: "idle" });

  const [updateStatus, setUpdateStatus] = useState("");
  const [updateProgress, setUpdateProgress] = useState(0);

  const [isFlashing, setIsFlashing] = useState(false);

  // =========================
  // 🔌 DEVICE DETECT
  // =========================
  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/devices");
        const json = await res.json();
        setDevices(json);
      } catch (e) {}
    };

    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, []);

  // =========================
  // 🔄 AUTO UPDATE
  // =========================
  useEffect(() => {
    if (!window.api) return;

    window.api.onUpdateStatus(setUpdateStatus);
    window.api.onUpdateProgress((p) => {
      setUpdateProgress(Math.round(p?.percent || 0));
    });
  }, []);

  // =========================
  // 📁 PICK ISO
  // =========================
  const pickISO = async () => {
    const file = await window.api?.selectISO?.();
    if (file) setIso(file);
  };

  // =========================
  // 🚀 FLASH ENGINE (ETCHER STYLE)
  // =========================
  const startFlash = async () => {

    setIsFlashing(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/flash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ iso, device, format })
      });

      if (!res.body) throw new Error("No stream");

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
            const json = JSON.parse(line);

            setData(prev => ({
              ...prev,
              progress: json.progress ?? prev.progress,
              status: json.status ?? prev.status,
              speed: json.speed ?? prev.speed
            }));

          } catch {}
        }
      }

    } finally {
      setIsFlashing(false);
    }
  };

  // =========================
  // 🖥 UI (ETCHER STYLE)
  // =========================
  return (
    <div style={styles.app}>

      <h1>🔥 Flash Boot Tool (Etcher Mode)</h1>

      {/* UPDATE PANEL */}
      {updateStatus && (
        <div style={styles.update}>
          <h4>🔄 Update</h4>
          <p>{updateStatus}</p>

          {updateStatus === "downloading" && (
            <>
              <div style={styles.bar}>
                <div style={{ ...styles.fill, width: updateProgress + "%" }} />
              </div>
              <p>{updateProgress}%</p>
            </>
          )}
        </div>
      )}

      {/* DRAG DROP ISO */}
      <div
        style={styles.drop}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          setIso(file.path);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <button onClick={pickISO}>📁 Select ISO</button>
        <p>{iso || "Drop ISO here"}</p>
      </div>

      {/* DEVICE */}
      <h3>💽 Device</h3>
      <select value={device} onChange={e => setDevice(e.target.value)}>
        <option value="">Select device</option>
        {devices.map((d, i) => (
          <option key={i} value={d.path}>
            {d.model} ({d.size})
          </option>
        ))}
      </select>

      {/* FORMAT */}
      <h3>🧽 Format</h3>
      <select value={format} onChange={e => setFormat(e.target.value)}>
        <option value="fat32">FAT32</option>
        <option value="exfat">exFAT</option>
        <option value="ntfs">NTFS</option>
      </select>

      {/* FLASH */}
      <button
        disabled={!iso || !device || isFlashing}
        onClick={() =>
          SafeConfirm({
            device,
            format,
            onConfirm: startFlash
          })
        }
        style={{
          marginTop: 20,
          padding: 12,
          background: isFlashing ? "#555" : "red",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer"
        }}
      >
        ⚠️ FLASH DEVICE
      </button>

      {/* PROGRESS */}
      <div style={{ marginTop: 20 }}>
        <ProgressBar data={data} />
      </div>

    </div>
  );
}

// =========================
// 🎨 STYLE (ETCHER CLEAN UI)
// =========================
const styles = {
  app: {
    height: "100vh",
    background: "#0f172a",
    color: "white",
    padding: 20,
    fontFamily: "sans-serif"
  },

  drop: {
    border: "2px dashed #555",
    padding: 20,
    marginBottom: 20,
    textAlign: "center",
    borderRadius: 10
  },

  update: {
    position: "fixed",
    top: 10,
    right: 10,
    background: "#111",
    padding: 10,
    borderRadius: 10,
    width: 220
  },

  bar: {
    height: 8,
    background: "#333",
    borderRadius: 4
  },

  fill: {
    height: "100%",
    background: "lime",
    transition: "width 0.3s"
  }
};
