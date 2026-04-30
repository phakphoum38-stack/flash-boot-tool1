export default function ProgressBar({ data }) {
  return (
    <div style={{ width: "100%" }}>
      <div>Progress: {data.progress}%</div>
      <div>Speed: {data.speed_mb_s} MB/s</div>
      <div>ETA: {data.eta_sec}s</div>

      <div style={{ background: "#333", height: 10 }}>
        <div
          style={{
            width: data.progress + "%",
            height: "100%",
            background: "green"
          }}
        />
      </div>
    </div>
  );
}
