export default function SafeConfirm({ device, format, onConfirm }) {

  const ok = confirm(`⚠️ FORMAT ${device} with ${format}?`);

  if (ok) onConfirm();

  return null;
}
