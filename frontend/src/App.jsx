import { useState, useEffect } from "react";
import ProgressBar from "./components/ProgressBar";
import SafeConfirm from "./components/SafeConfirm";

export default function App() {
  const [iso, setIso] = useState("");
  const [device, setDevice] = useState("");
  const [devices, setDevices] = useState([]);
  const [progressData, setProgressData] = useState({ progress: 0 });

  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/devices");
        setDevices(await res.json());
      } catch {}
    };

    load();
    const i = setInterval(load, 3000);
    return () => clearInterval(i);
  }, []);

  const pickISO = async () => {
    const file = await window.api?.selectISO?.();
    if (file) setIso(file);
  };

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
        if (!line) continue;
        const data = JSON.parse(line);
        setProgressData(data);
      }
    }

    setStatus("done");
  };

  return (
    <div style={styles.app}>

      {/* HEADER */}
      <div style={styles.header}>
        <h1>⚡ Flash Boot Tool</h1>
        <p>Etcher-level USB Flash Utility</p>
      </div>

      {/* CARD */}
      <div style={styles.card}>
        <button onClick={pickISO}>📁 Select ISO</button>
        <p>{iso || "No ISO selected"}</p>
      </div>

      <div style={styles.card}>
        <select value={device} onChange={(e) => setDevice(e.target.value)}>
          <option value="">Select USB</option>
          {devices.map((d, i) => (
            <option key={i} value={d.path}>
              {d.model} ({d.size})
            </option>
          ))}
        </select>
      </div>

      {/* FLASH BUTTON */}
      <button
        style={styles.flashBtn}
        onClick={() =>
          SafeConfirm({ device, onConfirm: startFlash })
        }
      >
        ⚡ Flash Drive
      </button>

      {/* PROGRESS */}
      <ProgressBar data={progressData} />

      {/* STATUS */}
      {status === "done" && <p style={{ color: "lime" }}>✅ Done</p>}
    </div>
  );
}

const styles = {
  app: {
    background: "#0f172a",
    color: "white",
    height: "100vh",
    padding: 20,
    fontFamily: "sans-serif"
  },
  header: {
    textAlign: "center",
    marginBottom: 20
  },
  card: {
    background: "#1e293b",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10
  },
  flashBtn: {
    background: "#22c55e",
    padding: 15,
    border: "none",
    color: "white",
    width: "100%",
    borderRadius: 10,
    marginTop: 10,
    cursor: "pointer"
  }
};