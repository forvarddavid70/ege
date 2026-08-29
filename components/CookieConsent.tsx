"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "egefather_cookie_consent";

/**
 * Баннер согласия на использование cookie.
 *
 * Показывается один раз: как только пользователь выбирает вариант, решение
 * сохраняется в localStorage и баннер больше не появляется. До монтирования на
 * клиенте ничего не рендерим — чтобы избежать расхождения при гидрации.
 */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (!saved) setVisible(true);
    } catch {
      // localStorage может быть недоступен (приватный режим) — просто показываем баннер.
      setVisible(true);
    }
  }, []);

  function decide(choice: "accepted" | "declined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, choice);
    } catch {
      // Игнорируем ошибку записи — не блокируем интерфейс.
    }
    // Сообщаем аналитике (Analytics.tsx), что выбор изменился — чтобы счётчики
    // подключились сразу после согласия, без перезагрузки страницы.
    try {
      window.dispatchEvent(new Event("cookie-consent-changed"));
    } catch {
      // no-op
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Уведомление об использовании cookie"
      className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-3xl rounded-2xl border border-ink-700 bg-ink-900/95 p-4 shadow-glow backdrop-blur sm:inset-x-4 sm:bottom-4 sm:p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-ink-200">
          Мы используем cookie, необходимые для работы сайта. Продолжая пользоваться сайтом, вы
          соглашаетесь с этим. Подробнее — в{" "}
          <Link
            href="/privacy"
            className="font-medium text-brand-300 underline decoration-brand-500/40 underline-offset-2 transition hover:text-brand-200"
          >
            политике конфиденциальности
          </Link>
          .
        </p>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => decide("declined")} className="btn-ghost">
            Отклонить
          </button>
          <button type="button" onClick={() => decide("accepted")} className="btn-primary">
            Принять
          </button>
        </div>
      </div>
    </div>
  );
}
