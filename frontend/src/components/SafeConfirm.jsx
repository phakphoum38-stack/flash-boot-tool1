export default function SafeConfirm({ device, onConfirm }) {
  const ok = confirm(`⚠️ This will ERASE ${device}`);
  if (ok) onConfirm();
}