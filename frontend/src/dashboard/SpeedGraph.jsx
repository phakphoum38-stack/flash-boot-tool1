export default function SpeedGraph({ data }) {

  return (
    <div style={{ marginTop: 20 }}>

      <h4>⚡ Speed</h4>

      <div style={{
        height: 10,
        background: "#222"
      }}>
        <div style={{
          width: (data.progress || 0) + "%",
          height: "100%",
          background: "lime"
        }} />
      </div>

      <p>{data.speed || 0} MB/s</p>

    </div>
  );
}
