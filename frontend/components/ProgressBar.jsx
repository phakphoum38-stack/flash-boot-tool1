export default function ProgressBar({ value }) {
  return (
    <div style={{ width: "100%", background: "#333" }}>
      <div style={{ width: value + "%", background: "green", height: "10px" }} />
    </div>
  );
}
