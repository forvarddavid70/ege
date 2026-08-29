"use client";

import { useEffect, useRef } from "react";

export default function DrawingCanvas({ value, background, onChange, color = "#2c2c2b", height = 210 }: { value?: string; background?: string; onChange: (value: string) => void; color?: string; height?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || (!value && !background)) return;
    const image = new Image();
    image.onload = () => canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
    image.src = value || background || "";
  }, [value, background]);

  function point(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = ref.current!;
    const rect = canvas.getBoundingClientRect();
    return { x: (e.clientX - rect.left) * canvas.width / rect.width, y: (e.clientY - rect.top) * canvas.height / rect.height };
  }
  function start(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const p = point(e); const ctx = ref.current!.getContext("2d")!;
    ctx.beginPath(); ctx.moveTo(p.x, p.y); ref.current!.setPointerCapture(e.pointerId);
  }
  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const p = point(e); const ctx = ref.current!.getContext("2d")!;
    ctx.strokeStyle = color; ctx.lineWidth = color === "#dc2626" ? 3 : 2; ctx.lineCap = "round"; ctx.lineJoin = "round";
    ctx.lineTo(p.x, p.y); ctx.stroke();
  }
  function end() { drawing.current = false; onChange(ref.current?.toDataURL("image/png") || ""); }
  function clear() { const c = ref.current!; c.getContext("2d")?.clearRect(0, 0, c.width, c.height); onChange(""); }

  return <div>
    <canvas ref={ref} width={900} height={height * 2} onPointerDown={start} onPointerMove={move} onPointerUp={end} onPointerCancel={end} className="w-full touch-none rounded-lg border border-slate-300 bg-white" style={{ height }} aria-label="Поле для рисования" />
    <button type="button" onClick={clear} className="mt-2 text-sm font-medium text-slate-500 hover:text-slate-900">Очистить рисунок</button>
  </div>;
}
