"use client";

import { useRef, useState } from "react";

/**
 * Кнопка загрузки PNG-файла в админке. Отправляет файл на `/api/admin/upload`
 * и возвращает публичный путь через колбэк `onUploaded`. Показывает состояние
 * загрузки и понятную ошибку. Никаких гиперссылок — только выбор файла.
 */
export default function ImageUploader({
  onUploaded,
  label = "Загрузить PNG",
}: {
  onUploaded: (url: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);

    if (file.type !== "image/png") {
      setError("Можно загружать только PNG-файлы.");
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

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="btn-ghost disabled:opacity-60"
      >
        {busy ? "Загрузка…" : label}
      </button>
      {error && <p className="mt-2 text-sm text-rose-400">{error}</p>}
    </div>
  );
}
