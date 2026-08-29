"use client";

import { useRef, useState } from "react";

/** Загружает PNG, JPEG или WebP в public/uploads и возвращает публичный URL. */
export default function ImageUploader({
  onUploaded,
  label = "Загрузить изображение",
}: {
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Поддерживаются PNG, JPEG и WebP.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Файл слишком большой — максимум 5 МБ.");
      return;
    }
    setBusy(true);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !json.ok || !json.url) {
        setError(json.error || "Не удалось загрузить файл.");
        return;
      }
      onUploaded(json.url as string);
    } catch {
      setError("Сетевая ошибка при загрузке.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return <div>
    <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) handleFile(file); }} />
    <button type="button" onClick={() => inputRef.current?.click()} disabled={busy} className="btn-ghost disabled:opacity-60">{busy ? "Загрузка…" : label}</button>
    {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
  </div>;
}
