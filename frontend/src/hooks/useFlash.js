export function useFlash() {

  const startFlash = async (iso, device, updateUI) => {

    const res = await fetch("http://127.0.0.1:8000/flash", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ iso, device })
    });

    if (!res.body) return;

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    while (true) {

      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop();

      for (const line of lines) {

        if (!line.trim()) continue;

        try {
          const data = JSON.parse(line);

          if (updateUI) updateUI(data);

        } catch (e) {
          console.log("parse error", line);
        }
      }
    }
  };

  return { startFlash };
}
