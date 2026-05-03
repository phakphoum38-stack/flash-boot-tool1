export default function AIPanel({ ai }) {

  return (
    <div style={{ background: "#111", padding: 10, borderRadius: 10 }}>

      <h3>🧠 AI Analysis</h3>

      <p>OS: {ai?.os}</p>
      <p>Boot: {ai?.boot}</p>
      <p>Risk: {ai?.risk}</p>

    </div>
  );
}
