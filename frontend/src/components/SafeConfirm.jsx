export default function safeConfirm({ device, format, onConfirm }) {

  const step1 = window.confirm(
    `⚠️ WARNING\nYou are about to erase:\n${device}\n\nContinue?`
  );

  if (!step1) return;

  const step2 = prompt("Type ERASE to confirm:");

  if (step2 !== "ERASE") {
    alert("Cancelled");
    return;
  }

  // 🚀 ส่งกลับไปให้ App.jsx ทำงานต่อ
  onConfirm();
}
