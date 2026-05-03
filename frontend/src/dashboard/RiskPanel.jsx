export default function RiskPanel({ risk }) {

  if (!risk) return <div>🧠 No analysis</div>;

  return (
    <div style={{ padding: 10 }}>

      <h3>🧠 Risk Engine</h3>

      <p>Score: {risk.score}</p>

      <p style={{ color: risk.safe ? "lime" : "red" }}>
        {risk.safe ? "SAFE" : "DANGER"}
      </p>

    </div>
  );
}
