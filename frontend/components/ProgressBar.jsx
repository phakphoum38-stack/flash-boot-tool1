export default function ProgressBar({ data }) {
  return (
    <div>
      <p>Progress: {data.progress || 0}%</p>
      <p>Speed: {data.speed_mb_s || 0} MB/s</p>
      <p>ETA: {data.eta_sec || 0}s</p>

      <div style={{ width: "100%", background: "#222", height: 10 }}>
        <div
          style={{
            width: (data.progress || 0) + "%",
            background: "green",
            height: "100%"
          }}
        />
      </div>
    </div>
  );
}
