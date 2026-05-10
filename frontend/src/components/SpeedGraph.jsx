import { useEffect, useRef } from "react";

export default function SpeedGraph({ data }) {
  const canvasRef = useRef();

  useEffect(() => {
    const ctx = canvasRef.current.getContext("2d");

    const points = data.history || [];

    ctx.clearRect(0, 0, 400, 120);

    ctx.beginPath();
    ctx.strokeStyle = "#22c55e";

    points.forEach((p, i) => {
      const x = i * 10;
      const y = 120 - p;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });

    ctx.stroke();
  }, [data]);

  return <canvas ref={canvasRef} width={400} height={120} />;
}