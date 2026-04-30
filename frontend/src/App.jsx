import { useState } from "react";
import ProgressBar from "../components/ProgressBar";

export default function App() {

  const [data, setData] = useState({ progress: 0 });

  const startFlash = async () => {

    const res = await fetch("http://127.0.0.1:8000/flash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        iso: "/home/user/ubuntu.iso",
        device: "/dev/sdb"
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
        setData(json); // 👈 อัปเดต progress UI
      }
    }
  };

  return (
    <div>
      <h1>Flash Boot Tool</h1>

      <button onClick={startFlash}>
        🚀 Start Flash
      </button>

      <ProgressBar data={data} />
    </div>
  );
}
