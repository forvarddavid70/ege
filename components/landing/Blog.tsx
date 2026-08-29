import Reveal from "@/components/ui/Reveal";
import { TelegramIcon } from "@/components/icons";
import { BlogCover } from "@/components/chem";
import { formatDate } from "@/lib/format";
import type { NewsItem } from "@/lib/types";

export default function Blog({
  news,
  channelHref,
}: {
  news: NewsItem[];
  channelHref: string;
}) {
  return (
    <section id="news">
      <div className="section">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Блог</p>
              <h2 className="section-title mt-2">Записи и новости</h2>
            </div>
            {channelHref && (
              <a href={channelHref} target="_blank" rel="noopener noreferrer" className="btn-ghost">
                <TelegramIcon />
                Читать канал
              </a>
            )}
          </div>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {news.length === 0 && <p className="text-ink-400">Пока записей нет.</p>}
          {news.map((n, i) => (
            <Reveal key={n.id} delay={(i % 3) * 90}>
              <article className="card flex h-full flex-col overflow-hidden !p-0">
                <BlogCover variant={i} className="h-40 w-full" />
                <div className="flex flex-1 flex-col p-6">
                  <time className="text-xs font-medium uppercase tracking-wide text-brand-300">
                    {formatDate(n.date)}
                  </time>
                  <h3 className="mt-2 font-semibold text-white">{n.title}</h3>
                  <p className="mt-2 text-sm text-ink-300">{n.body}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
