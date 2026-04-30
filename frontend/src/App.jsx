import { useEffect, useState } from "react";
import ProgressBar from "../components/ProgressBar";

export default function App() {

  const [iso, setIso] = useState(null);
  const [device, setDevice] = useState("");
  const [devices, setDevices] = useState([]);
  const [data, setData] = useState({ progress: 0 });

  // 💽 โหลด USB devices จาก backend
  useEffect(() => {
    fetch("http://127.0.0.1:8000/devices")
      .then(res => res.json())
      .then(setDevices);
  }, []);

  // 🚀 start flash
  const startFlash = async () => {
    if (!iso || !device) {
      alert("เลือก ISO และ USB ก่อน");
      return;
    }

    const res = await fetch("http://127.0.0.1:8000/flash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        iso,
        device
      })
    });

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.trim().split("\n");

      for (let line of lines) {
        const json = JSON.parse(line);
        setData(json);
      }
    }
  };

  return (
    <div style={{ padding: 20 }}>

      <h1>🔥 Flash Boot Tool</h1>

      {/* 📁 ISO Picker */}
      <div>
        <h3>เลือก ISO</h3>
        <input
          type="file"
          accept=".iso,.dmg"
          onChange={(e) => setIso(e.target.files[0]?.path || e.target.files[0]?.name)}
        />
        <p>{iso}</p>
      </div>

      {/* 💽 USB Device Picker */}
      <div>
        <h3>เลือก USB Device</h3>
        <select onChange={(e) => setDevice(e.target.value)}>
          <option value="">-- เลือก device --</option>
          {devices.map((d, i) => (
            <option key={i} value={d.path}>
              {d.name} ({d.size})
            </option>
          ))}
        </select>
      </div>

      {/* 🚀 Start */}
      <button onClick={startFlash} style={{ marginTop: 20 }}>
        🚀 Start Flash
      </button>

      {/* 📊 Progress */}
      <ProgressBar data={data} />
    </div>
  );
}
