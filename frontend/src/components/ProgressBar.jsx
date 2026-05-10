export default function ProgressBar({ data }) {
  const p = data.progress || 0;

  return (
    <div style={{ marginTop: 20 }}>

      <div style={{
        height: 14,
        background: "#1e293b",
        borderRadius: 10,
        overflow: "hidden"
      }}>
        <div style={{
          width: p + "%",
          height: "100%",
          background: "linear-gradient(90deg,#22c55e,#06b6d4)"
        }} />
      </div>

      <p style={{ marginTop: 10 }}>{p}%</p>

      <p style={{ fontSize: 12, opacity: 0.7 }}>
        ⚡ {data.speed_mb_s || 0} MB/s • ⏳ {data.eta_sec || 0}s
      </p>
    </div>
  );
}