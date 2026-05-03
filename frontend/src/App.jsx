import { useEffect, useState } from "react";
import ProgressBar from "../components/ProgressBar";
import SafeConfirm from "../components/SafeConfirm";

export default function App() {

  // =========================
  // 📦 STATE
  // =========================
  const [iso, setIso] = useState("");
  const [device, setDevice] = useState("");
  const [devices, setDevices] = useState([]);
  const [format, setFormat] = useState("fat32");
  const [data, setData] = useState({ progress: 0 });

  const [updateStatus, setUpdateStatus] = useState("");
  const [updateProgress, setUpdateProgress] = useState(0);

  // =========================
  // 💽 AUTO USB DETECT
  // =========================
  useEffect(() => {

    const loadDevices = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/devices");
        const json = await res.json();
        setDevices(json);
      } catch (e) {
        console.error("device error", e);
      }
    };

    loadDevices();
    const interval = setInterval(loadDevices, 3000);

    return () => clearInterval(interval);

  }, []);

  // =========================
  // 🔄 AUTO UPDATE (SAFE)
  // =========================
  useEffect(() => {

    if (!window.api) return; // 🔥 กัน crash

    window.api.onUpdateStatus?.((msg) => {
      setUpdateStatus(msg);
    });

    window.api.onUpdateProgress?.((p) => {
      setUpdateProgress(Math.round(p || 0));
    });

  }, []);

  // =========================
  // 📁 ISO PICKER
  // =========================
  const pickISO = async () => {
    const file = await window.api?.selectISO?.();
    if (file) setIso(file);
  };

  // =========================
  // 🚀 FLASH ENGINE
  // =========================
  const startFlash = async () => {

    const res = await fetch("http://127.0.0.1:8000/flash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ iso, device })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.trim().split("\n");

      for (let line of lines) {
        if (!line) continue;

        try {
          setData(JSON.parse(line));
        } catch {
          console.log("parse error", line);
        }
      }
    }
  };

  // =========================
  // 🖥 UI
  // =========================
  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>

      <h1>🔥 Flash Boot Tool PRO</h1>

      {/* 🔄 UPDATE UI */}
      {updateStatus && (
        <div style={{
          position: "fixed",
          top: 10,
          right: 10,
          background: "#111",
          color: "white",
          padding: 10,
          borderRadius: 8,
          width: 220
        }}>
          <h4>🔄 Updating App</h4>

          <p>Status: {updateStatus}</p>

          {updateStatus === "downloading" && (
            <p>⬇ {updateProgress}%</p>
          )}

          {updateStatus === "ready-to-install" && (
            <p>⚡ Installing...</p>
          )}
        </div>
      )}

      {/* 📁 ISO PICKER */}
      <div
        style={{
          border: "2px dashed #666",
          padding: 20,
          marginBottom: 10
        }}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          setIso(file.path);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        <button onClick={pickISO}>
          📁 Select ISO (Native Electron)
        </button>

        <p>ISO: {iso || "Drop ISO here"}</p>
      </div>

      {/* 💽 USB */}
      <h3>💽 USB Devices</h3>

      <select value={device} onChange={(e) => setDevice(e.target.value)}>
        <option value="">-- select USB --</option>

        {devices.map((d, i) => (
          <option key={i} value={d.path}>
            {d.model || "USB"} | {d.path} | {d.size}
          </option>
        ))}
      </select>

      {/* 🧽 FORMAT */}
      <h3>🧽 Format</h3>

      <select value={format} onChange={(e) => setFormat(e.target.value)}>
        <option value="fat32">FAT32</option>
        <option value="exfat">exFAT</option>
        <option value="ntfs">NTFS</option>
      </select>

      <br /><br />

      {/* 🚀 SAFE FLASH */}
      <button
        onClick={() =>
          SafeConfirm({
            device,
            format,
            onConfirm: startFlash
          })
        }
        style={{
          background: "red",
          color: "white",
          padding: 10
        }}
      >
        ⚠️ FORMAT + FLASH
      </button>

      {/* 📊 PROGRESS */}
      <ProgressBar data={data} />

    </div>
  );
}
