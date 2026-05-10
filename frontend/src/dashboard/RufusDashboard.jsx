import { useEffect, useState } from "react";
import DeviceTable from "./DeviceTable";
import IsoPanel from "./IsoPanel";
import FlashPanel from "./FlashPanel";
import RiskPanel from "./RiskPanel";
import SpeedGraph from "./SpeedGraph";

export default function RufusDashboard() {

  const [devices, setDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [iso, setIso] = useState("");
  const [flashData, setFlashData] = useState({});
  const [risk, setRisk] = useState(null);

  // =========================
  // 💽 LOAD DEVICES
  // =========================
  useEffect(() => {

    const load = async () => {
      const res = await fetch("http://127.0.0.1:8000/devices");
      const json = await res.json();
      setDevices(json);
    };

    load();
    const i = setInterval(load, 3000);

    return () => clearInterval(i);

  }, []);

  // =========================
  // 🧠 AI RISK CHECK
  // =========================
  const checkRisk = async (device, iso) => {

    const res = await fetch("http://127.0.0.1:8000/ai/risk", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ device, iso })
    });

    const json = await res.json();
    setRisk(json);
  };

  return (
    <div style={styles.container}>

      <div style={styles.left}>
        <DeviceTable
          devices={devices}
          onSelect={(d) => {
            setSelectedDevice(d);
            checkRisk(d.path, iso);
          }}
        />
      </div>

      <div style={styles.center}>
        <IsoPanel iso={iso} setIso={setIso} />

        <FlashPanel
          device={selectedDevice}
          iso={iso}
          onFlash={(data) => setFlashData(data)}
        />

        <SpeedGraph data={flashData} />
      </div>

      <div style={styles.right}>
        <RiskPanel risk={risk} />
      </div>

    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    background: "#0b0f14",
    color: "white",
    fontFamily: "sans-serif"
  },
  left: { width: 300, borderRight: "1px solid #222" },
  center: { flex: 1, padding: 20 },
  right: { width: 300, borderLeft: "1px solid #222" }
};
