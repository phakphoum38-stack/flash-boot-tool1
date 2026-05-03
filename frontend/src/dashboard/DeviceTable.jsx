export default function DeviceTable({ devices, onSelect }) {

  return (
    <div>

      <h3>💽 USB Devices</h3>

      {devices.map((d, i) => (
        <div
          key={i}
          onClick={() => onSelect(d)}
          style={{
            padding: 10,
            margin: 5,
            background: "#111",
            borderRadius: 6,
            cursor: "pointer"
          }}
        >
          <p>{d.model}</p>
          <small>{d.path}</small>
          <small> {d.size}</small>
        </div>
      ))}

    </div>
  );
}
