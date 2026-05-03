export default function IsoPanel({ iso, setIso }) {

  return (
    <div style={{ marginBottom: 20 }}>

      <h3>📀 ISO</h3>

      <div
        style={{
          border: "2px dashed #444",
          padding: 20
        }}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files[0];
          setIso(file.path);
        }}
        onDragOver={(e) => e.preventDefault()}
      >
        {iso || "Drop ISO here"}
      </div>

    </div>
  );
}
