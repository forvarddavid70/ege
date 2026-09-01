"use client";

import { useEffect } from "react";

/** Кнопка сохранения отчёта в PDF. При auto=true печать предлагается сразу после открытия. */
export default function PrintButton({ auto = false }: { auto?: boolean }) {
  useEffect(() => {
    if (!auto) return;
    const timer = window.setTimeout(() => window.print(), 700);
    return () => window.clearTimeout(timer);
  }, [auto]);

  return <button type="button" onClick={() => window.print()} className="rounded-lg bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700">Скачать / сохранить PDF</button>;
}
