import { useFlash } from "../hooks/useFlash";

export default function FlashPanel({ device, iso, onFlash }) {

  const { startFlash } = useFlash();

  const handleFlash = () => {
    startFlash(iso, device?.path, onFlash);
  };

  return (
    <div>

      <button
        disabled={!device || !iso}
        onClick={handleFlash}
        style={{
          padding: 12,
          background: "red",
          color: "white",
          width: "100%"
        }}
      >
        ⚠ FLASH DEVICE
      </button>

    </div>
  );
}
