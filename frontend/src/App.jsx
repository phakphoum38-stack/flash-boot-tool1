import { useState } from "react";
import ProgressBar from "../components/ProgressBar";

export default function App() {

  const [iso, setIso] = useState("");
  const [device, setDevice] = useState("");
  const [data, setData] = useState({ progress: 0 });

  // 📁 Native file picker (REAL PATH)
  const pickISO = async () => {
    const file = await window.api.selectISO();
    setIso(file);
  };

  // 🚀 flash
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
        setData(JSON.parse(line));
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>🔥 Flash Boot Tool (PRO)</h1>

      {/* 📁 ISO Picker */}
      <div
        style={{
          border: "2px dashed #555",
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
          📁 Select ISO (Native)
        </button>

        <p>{iso || "Drop ISO here"}</p>
      </div>

      {/* 💽 Device */}
      <input
        placeholder="/dev/sdb"
        value={device}
        onChange={(e) => setDevice(e.target.value)}
      />

      <br /><br />

      <button onClick={startFlash}>
        🚀 Start Flash
      </button>

      <ProgressBar data={data} />
    </div>
  );
}
