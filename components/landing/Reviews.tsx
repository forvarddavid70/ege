import Reveal from "@/components/ui/Reveal";
import StarRating from "@/components/ui/StarRating";
import TutorAvatar from "@/components/TutorAvatar";
import { QuoteIcon, TelegramIcon, StarIcon } from "@/components/icons";
import { formatDate } from "@/lib/format";
import type { Review } from "@/lib/types";

export default function Reviews({
  reviews,
  trialHref,
}: {
  reviews: Review[];
  trialHref: string;
}) {
  const count = reviews.length;
  const avg =
    count > 0 ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count : 0;
  const avgLabel = avg.toFixed(1).replace(".", ",");

  return (
    <section id="reviews" className="border-t border-ink-800">
      <div className="section">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Отзывы</p>
              <h2 className="section-title mt-2">Что говорят ученики и родители</h2>
              <p className="mt-2 max-w-2xl text-ink-300">
                Живые истории тех, кто уже прошёл подготовку — от первого пробника до заветного балла.
              </p>
            </div>
            {count > 0 && (
              <div className="flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-800/60 px-4 py-3">
                <span className="text-3xl font-black text-gradient">{avgLabel}</span>
                <div>
                  <StarRating value={Math.round(avg)} />
                  <p className="mt-1 text-xs text-ink-400">
                    {count}{" "}
                    {count % 10 === 1 && count % 100 !== 11
                      ? "отзыв"
                      : [2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)
                      ? "отзыва"
                      : "отзывов"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </Reveal>

        {count === 0 ? (
          <p className="mt-8 text-ink-400">Отзывы скоро появятся.</p>
        ) : (
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={(i % 3) * 90}>
                <figure className="card relative flex h-full flex-col">
                  <QuoteIcon className="absolute right-5 top-5 h-8 w-8 text-brand-500/25" />
                  <StarRating value={r.rating} />
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-ink-200">
                    {r.text}
                  </blockquote>
                  <figcaption className="mt-5 flex items-center gap-3 border-t border-ink-700 pt-4">
                    <TutorAvatar
                      src={r.avatarUrl}
                      name={r.name}
                      className="h-11 w-11 shrink-0 rounded-full ring-2 ring-brand-500/30"
                      initialsClassName="text-sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-white">{r.name}</p>
                      <p className="truncate text-xs text-ink-400">
                        {r.role}
                        {r.date ? ` • ${formatDate(r.date)}` : ""}
                      </p>
                    </div>
                    {r.result && (
                      <span className="ml-auto shrink-0 rounded-full border border-brand-500/40 bg-brand-500/10 px-2.5 py-1 text-xs font-semibold text-brand-200">
                        {r.result}
                      </span>
                    )}
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}

        <Reveal>
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-ink-800 bg-ink-900/40 p-6 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="flex items-center gap-2 font-semibold text-white">
              <StarIcon className="h-5 w-5 text-amber-400" />
              Хотите такой же результат? Начните с бесплатного занятия.
            </p>
            <a href={trialHref} target="_blank" rel="noopener noreferrer" className="btn-primary shrink-0">
              <TelegramIcon />
              Записаться на пробное
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
