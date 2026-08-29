"use client";

import { useEffect, useState } from "react";

/**
 * Аватар репетитора. Показывает фото по `src` (файл из public, например
 * «/tutor.jpg», или внешний URL). Пока фото не задано или не загрузилось,
 * показывается брендовый кружок с инициалами — сайт никогда не показывает
 * «битую» картинку.
 *
 * Фото подгружается через предзагрузку (`new Image()`), поэтому `<img>`
 * появляется только после успешной загрузки — без мигания «сломанной»
 * картинки и без гонки с гидрацией.
 */
export default function TutorAvatar({
  src,
  name,
  className = "",
  initialsClassName = "text-xl",
}: {
  src?: string;
  name: string;
  className?: string;
  initialsClassName?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    if (!src) return;
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = src;
    return () => {
      img.onload = null;
    };
  }, [src]);

  const initials =
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("") || "?";

  return (
    <div className={`relative overflow-hidden bg-ink-800 ${className}`}>
      {loaded && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${name} — репетитор по химии`} className="h-full w-full object-cover" />
      ) : (
        <span
          aria-label={name}
          className={`flex h-full w-full items-center justify-center bg-brand-700 font-black text-white ${initialsClassName}`}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
