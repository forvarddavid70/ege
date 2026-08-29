"use client";

export default function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="rounded-lg bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700">Скачать / сохранить PDF</button>;
}
