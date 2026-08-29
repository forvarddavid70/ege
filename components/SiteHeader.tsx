"use client";

import { useState } from "react";
import { TelegramIcon } from "./icons";
import { BenzeneRing } from "./chem";

const links = [
  { href: "#results", label: "Результаты" },
  { href: "#plan", label: "Как учимся" },
  { href: "#courses", label: "Форматы" },
  { href: "#ege", label: "Задания ЕГЭ" },
  { href: "#news", label: "Блог" },
  { href: "#reviews", label: "Отзывы" },
  { href: "#about", label: "Обо мне" },
  { href: "#lead", label: "Заявка" },
];

export default function SiteHeader({
  tutorName,
  brandName,
  telegramHref,
}: {
  tutorName: string;
  brandName: string;
  telegramHref: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink-700/70 bg-ink-950/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2.5 font-bold text-white">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <BenzeneRing className="h-5 w-5" />
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-gradient text-base font-extrabold">{brandName}</span>
            <span className="text-xs font-medium text-ink-300">{tutorName}</span>
          </span>
        </a>

        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-ink-200 transition hover:text-brand-300">
              {l.label}
            </a>
          ))}
          <a href={telegramHref} target="_blank" rel="noopener noreferrer" className="btn-tg">
            <TelegramIcon />
            Написать
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-ink-600 text-ink-100 lg:hidden"
          aria-label="Меню"
        >
          <span className="text-lg">{open ? "✕" : "☰"}</span>
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-700 bg-ink-900 lg:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-4 py-3">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-200 hover:bg-ink-800"
              >
                {l.label}
              </a>
            ))}
            <a
              href={telegramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-tg mt-2"
              onClick={() => setOpen(false)}
            >
              <TelegramIcon />
              Написать в Telegram
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
