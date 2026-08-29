"use client";

import { useState, type FormEvent } from "react";
import Reveal from "@/components/ui/Reveal";
import { TelegramIcon, CheckIcon } from "@/components/icons";

type FieldState = {
  name: string;
  phone: string;
  email: string;
  telegram: string;
  vk: string;
  message: string;
  consent: boolean;
  company: string; // honeypot — не показывается людям
};

const EMPTY: FieldState = {
  name: "",
  phone: "",
  email: "",
  telegram: "",
  vk: "",
  message: "",
  consent: false,
  company: "",
};

export default function LeadForm({
  telegramHref,
  email,
  privacyHref = "/privacy",
}: {
  telegramHref: string;
  email: string;
  privacyHref?: string;
}) {
  const [form, setForm] = useState<FieldState>(EMPTY);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof FieldState>(key: K, value: FieldState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.consent) {
      setError("Поставьте, пожалуйста, галочку согласия на обработку персональных данных.");
      return;
    }
    if (!form.name.trim()) {
      setError("Укажите, пожалуйста, имя.");
      return;
    }
    if (![form.phone, form.email, form.telegram, form.vk].some((v) => v.trim())) {
      setError("Оставьте хотя бы один способ связи: телефон, e-mail, Telegram или ВКонтакте.");
      return;
    }

    setStatus("sending");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) {
        setStatus("error");
        setError(data.error || "Не удалось отправить заявку. Попробуйте ещё раз.");
        return;
      }
      setStatus("sent");
      setForm(EMPTY);
    } catch {
      setStatus("error");
      setError("Сетевая ошибка. Проверьте соединение и попробуйте ещё раз.");
    }
  }

  return (
    <section id="lead" className="border-t border-ink-800">
      <div className="section grid gap-10 lg:grid-cols-2">
        <Reveal>
          <div>
            <p className="eyebrow">Заявка</p>
            <h2 className="section-title mt-2">Оставить заявку</h2>
            <p className="mt-4 text-ink-200">
              Заполните форму — я свяжусь с вами, отвечу на вопросы и предложу удобное время для
              бесплатного пробного занятия. Заявка приходит мне напрямую, обычно отвечаю в течение дня.
            </p>
            <div className="mt-6 space-y-3 text-sm text-ink-300">
              <p className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                Достаточно оставить один любой контакт.
              </p>
              <p className="flex gap-3">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
                  <CheckIcon className="h-3.5 w-3.5" />
                </span>
                Никакого спама — только ответ по вашему вопросу.
              </p>
            </div>
            <p className="mt-6 text-sm text-ink-400">
              Удобнее написать сразу?{" "}
              <a
                href={telegramHref}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-300 transition hover:text-brand-200"
              >
                Напишите в Telegram
              </a>
              {email ? (
                <>
                  {" "}или на e-mail{" "}
                  <a
                    href={`mailto:${email}`}
                    className="font-medium text-brand-300 transition hover:text-brand-200"
                  >
                    {email}
                  </a>
                  .
                </>
              ) : (
                "."
              )}
            </p>
          </div>
        </Reveal>

        <Reveal delay={90}>
          <div className="rounded-2xl border border-ink-800 bg-ink-900/40 p-6 sm:p-8">
            {status === "sent" ? (
              <div className="flex flex-col items-center py-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/15 text-brand-300">
                  <CheckIcon className="h-7 w-7" />
                </span>
                <h3 className="mt-4 text-xl font-bold text-white">Заявка отправлена!</h3>
                <p className="mt-2 max-w-sm text-sm text-ink-300">
                  Спасибо! Я получил ваше сообщение и свяжусь с вами в ближайшее время.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  className="btn-ghost mt-6"
                >
                  Отправить ещё одну
                </button>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate>
                {/* Honeypot: скрыт от людей, ловит ботов. */}
                <div aria-hidden="true" className="absolute left-[-9999px] top-[-9999px]">
                  <label>
                    Не заполняйте это поле
                    <input
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={form.company}
                      onChange={(e) => set("company", e.target.value)}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="lead-name">
                      Имя <span className="text-accent-400">*</span>
                    </label>
                    <input
                      id="lead-name"
                      className="input"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      placeholder="Как к вам обращаться"
                      autoComplete="name"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="lead-phone">Телефон</label>
                    <input
                      id="lead-phone"
                      type="tel"
                      className="input"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="+7 (___) ___-__-__"
                      autoComplete="tel"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="lead-email">E-mail</label>
                    <input
                      id="lead-email"
                      type="email"
                      className="input"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="email"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="lead-telegram">Ник в Telegram</label>
                    <input
                      id="lead-telegram"
                      className="input"
                      value={form.telegram}
                      onChange={(e) => set("telegram", e.target.value)}
                      placeholder="@username"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="lead-vk">Ник во ВКонтакте</label>
                    <input
                      id="lead-vk"
                      className="input"
                      value={form.vk}
                      onChange={(e) => set("vk", e.target.value)}
                      placeholder="vk.com/username"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="label" htmlFor="lead-message">Сообщение</label>
                    <textarea
                      id="lead-message"
                      className="input min-h-[96px]"
                      value={form.message}
                      onChange={(e) => set("message", e.target.value)}
                      placeholder="Класс, цель (ЕГЭ/школа), удобное время — что важно рассказать"
                    />
                  </div>
                </div>

                <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm text-ink-300">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-ink-500 bg-ink-900 text-brand-600 focus:ring-brand-500"
                    checked={form.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                  />
                  <span>
                    Я согласен(а) на обработку персональных данных в соответствии с{" "}
                    <a
                      href={privacyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-brand-300 underline decoration-brand-500/40 underline-offset-2 transition hover:text-brand-200"
                    >
                      политикой конфиденциальности
                    </a>
                    .
                  </span>
                </label>

                {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="btn-primary mt-5 w-full disabled:opacity-60"
                >
                  <TelegramIcon />
                  {status === "sending" ? "Отправляем…" : "Отправить заявку"}
                </button>
              </form>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
