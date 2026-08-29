import nodemailer, { type Transporter } from "nodemailer";

/**
 * Отправка e-mail через SMTP (опционально).
 *
 * Используется для автоответа клиенту, оставившему заявку. Если SMTP не
 * настроен в переменных окружения, функции тихо ничего не делают — сайт и приём
 * заявок продолжают работать (владелец всё равно получает уведомление в Telegram).
 *
 * Требуемые переменные окружения:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 * Необязательные:
 *   SMTP_SECURE ("true" для 465/SSL), SMTP_FROM (адрес отправителя)
 */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function isMailerConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
  );
}

let cached: Transporter | null = null;

function getTransporter(): Transporter | null {
  if (!isMailerConfigured()) return null;
  if (cached) return cached;
  cached = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
  return cached;
}

/** Простая валидация адреса — чтобы не пытаться слать на явно неверный e-mail. */
export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export type AutoReplyParams = {
  to: string;
  name: string;
  brand: string;
  tutor: string;
  telegramUrl?: string;
  replyEmail?: string;
};

/**
 * Отправляет клиенту автоответ о получении заявки.
 * Возвращает true при успешной отправке, false — если SMTP не настроен или
 * произошла ошибка (ошибка логируется, но не роняет обработку заявки).
 */
export async function sendLeadAutoReply(params: AutoReplyParams): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) return false;
  if (!looksLikeEmail(params.to)) return false;

  const from = process.env.SMTP_FROM || process.env.SMTP_USER || "";
  const { name, brand, tutor, telegramUrl, replyEmail } = params;

  const subject = `Заявка получена — ${brand}`;
  const greeting = name ? `Здравствуйте, ${name}!` : "Здравствуйте!";

  const textLines = [
    greeting,
    "",
    `Спасибо за заявку на сайте «${brand}». Я получил ваше сообщение и свяжусь с вами в ближайшее время, чтобы ответить на вопросы и подобрать удобное время для бесплатного пробного занятия.`,
    telegramUrl ? `\nЕсли удобнее — можно написать напрямую в Telegram: ${telegramUrl}` : "",
    "",
    `С уважением,\n${tutor || brand}`,
    replyEmail ? `\nОтветить на это письмо можно по адресу: ${replyEmail}` : "",
  ].filter(Boolean);

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1f2430;">
      <p>${escapeHtml(greeting)}</p>
      <p>Спасибо за заявку на сайте «${escapeHtml(brand)}». Я получил ваше сообщение и свяжусь
      с вами в ближайшее время, чтобы ответить на вопросы и подобрать удобное время для
      бесплатного пробного занятия.</p>
      ${
        telegramUrl
          ? `<p>Если удобнее — можно написать напрямую в Telegram:
             <a href="${escapeHtml(telegramUrl)}">${escapeHtml(telegramUrl)}</a>.</p>`
          : ""
      }
      <p style="margin-top:24px;">С уважением,<br/>${escapeHtml(tutor || brand)}</p>
    </div>
  `;

  try {
    await transporter.sendMail({
      from,
      to: params.to,
      subject,
      text: textLines.join("\n"),
      html,
      ...(replyEmail ? { replyTo: replyEmail } : {}),
    });
    return true;
  } catch (err) {
    console.error("Lead auto-reply email failed:", err);
    return false;
  }
}
