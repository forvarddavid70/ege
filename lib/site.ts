import { getSettings } from "./store";

const FALLBACK_URL = "http://localhost:3000";

/**
 * Приводит произвольную строку к «чистому» базовому URL сайта:
 * добавляет схему https:// если её нет и срезает завершающий слэш.
 * Возвращает null, если строку не удалось разобрать как URL.
 */
export function normalizeBaseUrl(raw: string | null | undefined): string | null {
  const value = (raw || "").trim();
  if (!value) return null;
  const withScheme = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  try {
    const url = new URL(withScheme);
    // Оставляем только origin (протокол + хост + порт), без пути и слэша.
    return url.origin;
  } catch {
    return null;
  }
}

/**
 * Канонический адрес сайта для SEO (sitemap, robots, Open Graph, JSON-LD).
 * Приоритет: настройка в админке → переменная окружения → localhost.
 */
export async function getSiteUrl(): Promise<string> {
  const settings = await getSettings();
  return (
    normalizeBaseUrl(settings.siteUrl) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL) ||
    FALLBACK_URL
  );
}

/** Делает относительный путь абсолютным относительно базового адреса сайта. */
export function absoluteUrl(base: string, pathname: string): string {
  if (/^https?:\/\//i.test(pathname)) return pathname;
  return `${base}${pathname.startsWith("/") ? "" : "/"}${pathname}`;
}
