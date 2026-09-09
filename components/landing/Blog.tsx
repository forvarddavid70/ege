"use client";

import { useEffect, useMemo, useState } from "react";
import Reveal from "@/components/ui/Reveal";
import { TelegramIcon } from "@/components/icons";
import { BlogCover } from "@/components/chem";
import { formatDate } from "@/lib/format";
import type { NewsItem } from "@/lib/types";

const POSTS_PER_PAGE = 6;

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d={direction === "left" ? "m12.5 15-5-5 5-5" : "m7.5 5 5 5-5 5"} />
    </svg>
  );
}

function youtubeId(url?: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

function PlayIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" className="ml-0.5 h-5 w-5" aria-hidden="true"><path d="M8 5.14v13.72c0 .9.98 1.46 1.76 1L20.5 13c.74-.44.74-1.52 0-1.96L9.76 4.14A1.17 1.17 0 0 0 8 5.14z" /></svg>;
}

export default function Blog({ news, channelHref }: { news: NewsItem[]; channelHref: string }) {
  const [page, setPage] = useState(0);
  const [activePost, setActivePost] = useState<NewsItem | null>(null);
  const pageCount = Math.ceil(news.length / POSTS_PER_PAGE);

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(pageCount - 1, 0)));
  }, [pageCount]);

  const visibleNews = useMemo(
    () => news.slice(page * POSTS_PER_PAGE, (page + 1) * POSTS_PER_PAGE),
    [news, page]
  );

  useEffect(() => {
    if (!activePost) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActivePost(null);
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activePost]);

  return (
    <section id="news" aria-labelledby="news-title">
      <div className="section">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Блог</p>
              <h2 id="news-title" className="section-title mt-2">Записи и новости</h2>
            </div>
            {channelHref && (
              <a href={channelHref} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <TelegramIcon />
                Читать канал
              </a>
            )}
          </div>
        </Reveal>

        {news.length === 0 ? (
          <p className="mt-8 text-ink-400">Пока записей нет.</p>
        ) : (
          <>
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {visibleNews.map((post, index) => {
                const videoId = youtubeId(post.youtubeUrl);
                const summary = post.summary || post.body;
                return (
                  <Reveal key={post.id} delay={(index % 3) * 90}>
                    <article className="h-full">
                      <button
                        type="button"
                        onClick={() => setActivePost(post)}
                        className="card group flex h-full min-h-[25rem] w-full flex-col overflow-hidden !p-0 text-left"
                        aria-label={`Открыть запись: ${post.title}`}
                      >
                        <div className="relative h-44 w-full shrink-0 overflow-hidden bg-ink-800">
                          {videoId ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`} alt="" className="h-full w-full object-cover opacity-80 transition duration-300 group-hover:scale-[1.03] group-hover:opacity-100" />
                              <span className="absolute inset-0 flex items-center justify-center"><span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-gradient text-white shadow-glow-sm"><PlayIcon /></span></span>
                            </>
                          ) : post.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={post.imageUrl} alt="" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
                          ) : (
                            <BlogCover variant={page * POSTS_PER_PAGE + index} className="h-full w-full" />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col p-5 sm:p-6">
                          <time className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">{formatDate(post.date)}</time>
                          <h3 className="blog-card-title mt-3 text-lg font-semibold leading-snug text-white">{post.title}</h3>
                          <p className="blog-card-summary mt-3 text-sm leading-6 text-ink-300">{summary}</p>
                          <span className="mt-auto pt-4 text-sm font-medium text-brand-300 transition group-hover:text-brand-200">Читать полностью →</span>
                        </div>
                      </button>
                    </article>
                  </Reveal>
                );
              })}
            </div>

            {pageCount > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2" aria-label="Страницы блога">
                <button
                  type="button"
                  onClick={() => setPage((current) => current - 1)}
                  disabled={page === 0}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-600 text-ink-200 transition hover:border-brand-500 hover:bg-brand-500/10 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Предыдущая страница"
                >
                  <Chevron direction="left" />
                </button>
                {Array.from({ length: pageCount }, (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setPage(index)}
                    aria-label={`Страница ${index + 1}`}
                    aria-current={page === index ? "page" : undefined}
                    className={`inline-flex h-10 min-w-10 items-center justify-center rounded-xl px-3 text-sm font-semibold transition ${
                      page === index
                        ? "bg-brand-gradient text-white shadow-glow-sm"
                        : "border border-ink-600 text-ink-200 hover:border-brand-500 hover:bg-brand-500/10"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPage((current) => current + 1)}
                  disabled={page === pageCount - 1}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-ink-600 text-ink-200 transition hover:border-brand-500 hover:bg-brand-500/10 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label="Следующая страница"
                >
                  <Chevron direction="right" />
                </button>
              </nav>
            )}
          </>
        )}
      </div>
      {activePost && <NewsDialog post={activePost} onClose={() => setActivePost(null)} />}
    </section>
  );
}

function NewsDialog({ post, onClose }: { post: NewsItem; onClose: () => void }) {
  const videoId = youtubeId(post.youtubeUrl);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={post.title} onClick={onClose}>
      <article className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-ink-700 bg-ink-900 shadow-glow-sm" onClick={(event) => event.stopPropagation()}>
        <header className="flex items-start justify-between gap-4 border-b border-ink-800 p-5 sm:p-6">
          <div>
            <time className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-300">{formatDate(post.date)}</time>
            <h3 className="mt-2 text-xl font-bold text-white sm:text-2xl">{post.title}</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Закрыть запись" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-ink-600 text-ink-300 transition hover:border-brand-500 hover:text-white">✕</button>
        </header>
        <div className="space-y-5 p-5 sm:p-6">
          {videoId ? (
            <div className="overflow-hidden rounded-xl border border-ink-700"><iframe className="aspect-video w-full" src={`https://www.youtube-nocookie.com/embed/${videoId}`} title={post.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen /></div>
          ) : post.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={post.imageUrl} alt={post.title} className="max-h-[28rem] w-full rounded-xl border border-ink-700 object-contain" />
          ) : null}
          {post.summary && <p className="font-medium leading-relaxed text-ink-100">{post.summary}</p>}
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-200">{post.body}</p>
        </div>
      </article>
    </div>
  );
}
