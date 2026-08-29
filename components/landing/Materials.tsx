"use client";

import { useEffect, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { formatDate } from "@/lib/format";
import type { MaterialItem } from "@/lib/types";

/** Извлекает id ролика из разных форматов ссылок YouTube (watch / youtu.be / shorts / embed / live). */
function youtubeId(url: string): string | null {
  if (!url) return null;
  const m = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5.14v13.72c0 .9.98 1.46 1.76 1L20.5 13c.74-.44.74-1.52 0-1.96L9.76 4.14A1.17 1.17 0 0 0 8 5.14z" />
    </svg>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className={className} aria-hidden="true">
      <path d="M7 3.5h7.6L19.5 8v12.5a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1z" strokeLinejoin="round" />
      <path d="M14.5 3.5V8H19" strokeLinejoin="round" />
      <path d="M9 12.5h7M9 15.5h7M9 18.5h4.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Materials({ materials }: { materials: MaterialItem[] }) {
  const [active, setActive] = useState<MaterialItem | null>(null);

  // Закрытие оверлея по Esc + блокировка прокрутки фона, пока он открыт.
  useEffect(() => {
    if (!active) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setActive(null);
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [active]);

  const activeVideoId = active ? youtubeId(active.youtubeUrl) : null;

  return (
    <section id="materials" className="border-y border-ink-800 bg-ink-900/40">
      <div className="section">
        <Reveal>
          <p className="eyebrow">Материалы</p>
          <h2 className="section-title mt-2">Посты и видео от автора</h2>
          <p className="mt-2 max-w-2xl text-ink-300">
            Полезные разборы, советы и видео для учеников и родителей. Нажмите на карточку, чтобы открыть материал целиком.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {materials.length === 0 && <p className="text-ink-400">Материалы скоро появятся.</p>}
          {materials.map((m, i) => {
            const vid = youtubeId(m.youtubeUrl);
            return (
              <Reveal key={m.id} delay={(i % 3) * 90}>
                <button
                  type="button"
                  onClick={() => setActive(m)}
                  className="card group block h-full w-full overflow-hidden p-0 text-left"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden border-b border-ink-700 bg-ink-800">
                    {vid ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`https://i.ytimg.com/vi/${vid}/hqdefault.jpg`}
                          alt=""
                          className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100"
                        />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow-sm">
                            <PlayIcon className="ml-0.5 h-5 w-5" />
                          </span>
                        </span>
                      </>
                    ) : (
                      <span className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-500/25 via-ink-800 to-fuchsia-500/20 text-brand-300">
                        <NoteIcon className="h-10 w-10" />
                      </span>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
                      <span>{formatDate(m.date)}</span>
                      <span className="chip">{vid ? "Видео" : "Пост"}</span>
                    </div>
                    <h3 className="mt-2 font-semibold text-white">{m.title}</h3>
                    <p className="mt-1 text-sm text-ink-300">{m.summary}</p>
                    <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-300 transition group-hover:text-brand-200">
                      Смотреть материал →
                    </span>
                  </div>
                </button>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* Оверлей с полным материалом: закрывается крестиком, кликом по фону или Esc. */}
      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <div
            className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-ink-700 bg-ink-900 shadow-glow-sm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-ink-800 p-5 sm:p-6">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-400">
                  <span>{formatDate(active.date)}</span>
                  <span className="chip">{activeVideoId ? "Видео" : "Пост"}</span>
                </div>
                <h3 className="mt-1 text-lg font-bold text-white sm:text-xl">{active.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Закрыть"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-600 text-ink-300 transition hover:border-brand-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              {activeVideoId && (
                <div className="overflow-hidden rounded-xl border border-ink-700">
                  <iframe
                    className="aspect-video w-full"
                    src={`https://www.youtube-nocookie.com/embed/${activeVideoId}`}
                    title={active.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                </div>
              )}
              {active.summary && <p className="font-medium text-ink-100">{active.summary}</p>}
              {active.body && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-200">{active.body}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
