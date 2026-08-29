import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { DEFAULT_SETTINGS, saveSettings } from "@/lib/store";
import { normalizeBaseUrl } from "@/lib/site";
import type { Settings } from "@/lib/types";

export const runtime = "nodejs";

const MAX_ABOUT_IMAGES = 8;

/**
 * Разрешаем только безопасные пути к картинкам: загруженные файлы (/uploads/…),
 * прочие локальные пути из public (/…) и внешние http(s)-ссылки. Это отсекает
 * потенциально опасные значения вроде `javascript:` в атрибуте src.
 */
function sanitizeImageUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!url) return null;
  if (url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://")) {
    return url.slice(0, 2048);
  }
  return null;
}

export async function PUT(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  let body: Partial<Settings>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный JSON" }, { status: 400 });
  }

  // Берём только известные строковые поля, приводим к строке — защита от мусора.
  const next: Settings = { ...DEFAULT_SETTINGS };
  (Object.keys(DEFAULT_SETTINGS) as (keyof Settings)[]).forEach((key) => {
    const value = body[key];
    if (typeof value === "string") (next as Record<string, unknown>)[key] = value;
  });

  // Массив изображений раздела «О себе»: валидируем каждую ссылку и ограничиваем количество.
  next.aboutImages = Array.isArray(body.aboutImages)
    ? body.aboutImages
        .map(sanitizeImageUrl)
        .filter((u): u is string => u !== null)
        .slice(0, MAX_ABOUT_IMAGES)
    : [];

  next.telegramUsername = next.telegramUsername.replace(/^@/, "").trim();
  next.telegramBotUsername = next.telegramBotUsername.replace(/^@/, "").trim();
  next.telegramChannel = next.telegramChannel.replace(/^@/, "").trim();

  // SEO/аналитика: приводим к безопасному виду.
  next.siteUrl = normalizeBaseUrl(next.siteUrl) || "";
  next.yandexMetrikaId = next.yandexMetrikaId.replace(/\D/g, "");
  next.googleTagManagerId = next.googleTagManagerId.replace(/[^A-Za-z0-9-]/g, "");
  next.googleSiteVerification = next.googleSiteVerification.replace(/[^A-Za-z0-9_-]/g, "");

  await saveSettings(next);
  return NextResponse.json({ ok: true, settings: next });
}
