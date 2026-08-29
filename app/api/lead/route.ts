import { NextResponse } from "next/server";
import crypto from "crypto";
import { addLead, getSettings, updateLead } from "@/lib/store";
import { isMailerConfigured, looksLikeEmail, sendLeadAutoReply } from "@/lib/mailer";
import { telegramLink } from "@/lib/telegram";
import type { Lead } from "@/lib/types";

export const runtime = "nodejs";

type LeadBody = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  telegram?: unknown;
  vk?: unknown;
  message?: unknown;
  consent?: unknown;
  company?: unknown; // honeypot — скрытое поле, должно оставаться пустым
};

function s(v: unknown, max = 500): string {
  return (typeof v === "string" ? v : "").trim().slice(0, max);
}

/** Экранирование под parse_mode=HTML в Telegram. */
function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Простой in-memory rate-limit по IP — отсекает флуд в рамках одного инстанса.
const hits = new Map<string, number[]>();
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request) {
  let body: LeadBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный запрос" }, { status: 400 });
  }

  // Honeypot: если бот заполнил скрытое поле — молча «принимаем», ничего не шлём.
  if (s(body.company)) {
    return NextResponse.json({ ok: true });
  }

  const name = s(body.name, 120);
  const phone = s(body.phone, 60);
  const email = s(body.email, 160);
  const telegram = s(body.telegram, 80);
  const vk = s(body.vk, 200);
  const message = s(body.message, 2000);
  const consent = body.consent === true;

  if (!consent) {
    return NextResponse.json(
      { ok: false, error: "Нужно согласие на обработку персональных данных." },
      { status: 400 }
    );
  }
  if (!name) {
    return NextResponse.json({ ok: false, error: "Укажите, пожалуйста, имя." }, { status: 400 });
  }
  if (!phone && !email && !telegram && !vk) {
    return NextResponse.json(
      { ok: false, error: "Оставьте хотя бы один способ связи." },
      { status: 400 }
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return NextResponse.json(
      { ok: false, error: "Слишком много заявок подряд. Попробуйте чуть позже." },
      { status: 429 }
    );
  }

  const settings = await getSettings();
  const brand = settings.brandName || "ЕГЭ Father";

  // 1) Сохраняем заявку на сервере — она попадёт в админку /enter → «Заявки».
  //    Это делает приём заявок надёжным даже без настроенного Telegram.
  const lead: Lead = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    name,
    phone,
    email,
    telegram,
    vk,
    message,
    status: "new",
    autoReplied: false,
  };

  try {
    await addLead(lead);
  } catch (err) {
    console.error("Не удалось сохранить заявку:", err);
    return NextResponse.json(
      { ok: false, error: "Не удалось сохранить заявку. Попробуйте позже или напишите в Telegram." },
      { status: 500 }
    );
  }

  // 2) Уведомляем владельца в Telegram, если бот настроен (лучшее усилие —
  //    заявка уже сохранена, поэтому ошибку доставки не считаем фатальной).
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (token && chatId) {
    const lines = [
      `🧪 <b>Новая заявка с сайта «${escapeHtml(brand)}»</b>`,
      "",
      `<b>Имя:</b> ${escapeHtml(name)}`,
      phone && `<b>Телефон:</b> ${escapeHtml(phone)}`,
      email && `<b>E-mail:</b> ${escapeHtml(email)}`,
      telegram && `<b>Telegram:</b> ${escapeHtml(telegram)}`,
      vk && `<b>ВКонтакте:</b> ${escapeHtml(vk)}`,
      message && `\n<b>Сообщение:</b>\n${escapeHtml(message)}`,
    ].filter(Boolean) as string[];

    try {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: lines.join("\n"),
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(10_000),
      });
      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        console.error("Telegram sendMessage failed:", res.status, detail);
      }
    } catch (err) {
      console.error("Telegram sendMessage error:", err);
    }
  }

  // 3) Автоответ клиенту на e-mail (если он указан и настроен SMTP) — лучшее усилие.
  let autoReplied = false;
  if (email && looksLikeEmail(email) && isMailerConfigured()) {
    const tgUsername =
      settings.telegramUsername || process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || "";
    const telegramUrl = tgUsername
      ? telegramLink(tgUsername, settings.telegramPrefill)
      : "";
    autoReplied = await sendLeadAutoReply({
      to: email,
      name,
      brand,
      tutor: settings.tutorName || "",
      telegramUrl: telegramUrl && telegramUrl !== "#" ? telegramUrl : undefined,
      replyEmail: settings.email || undefined,
    });
    if (autoReplied) {
      await updateLead(lead.id, { autoReplied: true }).catch(() => {});
    }
  }

  return NextResponse.json({ ok: true, autoReplied });
}
