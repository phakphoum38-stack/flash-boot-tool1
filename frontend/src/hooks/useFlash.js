export function useFlash() {

  const startFlash = async (iso, device, onUpdate) => {

    const res = await fetch("http://127.0.0.1:8000/flash", {
      method: "POST",
      body: JSON.stringify({ iso, device })
    });

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
        try {
          const data = JSON.parse(line);
          onUpdate(data);
        } catch {}
      }
    }
  };

  return { startFlash };
}
