/** Строит ссылку-диплинк в Telegram с предзаполненным текстом. */
export function telegramLink(username: string, prefill?: string): string {
  const clean = (username || "").replace(/^@/, "").trim();
  if (!clean) return "#";
  const base = `https://t.me/${clean}`;
  if (!prefill) return base;
  return `${base}?text=${encodeURIComponent(prefill)}`;
}

/** Ссылка на Telegram-канал (или профиль) без предзаполненного текста. */
export function telegramChannelLink(username: string): string {
  const clean = (username || "").replace(/^@/, "").trim();
  if (!clean) return "";
  return `https://t.me/${clean}`;
}
