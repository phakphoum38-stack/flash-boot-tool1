const startFlash = async () => {

  const res = await fetch("http://127.0.0.1:8000/flash", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ iso, device })
  });

  if (!res.body) {
    console.error("No response body");
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop(); // 🔥 เก็บ incomplete line

    for (let line of lines) {
      if (!line.trim()) continue;

      try {
        const parsed = JSON.parse(line);

        // 🔥 ลื่น + ไม่กระตุก
        setData(prev => ({
          ...prev,
          ...parsed
        }));

      } catch {
        console.log("parse error", line);
      }
    }
  }
};
