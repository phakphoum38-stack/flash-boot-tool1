export default function ProgressBar({ data }) {

  const percent = data.progress || 0;
  const speed = data.speed || 0;
  const eta = data.eta || 0;

  return (
    <div style={{ marginTop: 20 }}>

      <div style={{
        height: 18,
        background: "#333",
        borderRadius: 10,
        overflow: "hidden"
      }}>
        <div style={{
          width: percent + "%",
          height: "100%",
          background: "lime",
          transition: "width 0.3s"
        }} />
      </div>

      <p>{percent}%</p>
      <p>⚡ {speed} MB/s</p>
      <p>⏳ ETA: {eta}s</p>

    </div>
  );
}
