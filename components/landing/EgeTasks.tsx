import Reveal from "@/components/ui/Reveal";
import type { EgeTask } from "@/lib/types";

const difficultyStyle: Record<string, string> = {
  базовый: "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  повышенный: "border border-amber-500/40 bg-amber-500/10 text-amber-300",
  высокий: "border border-rose-500/40 bg-rose-500/10 text-rose-300",
};

export default function EgeTasks({ ege }: { ege: EgeTask[] }) {
  return (
    <section id="ege" className="border-y border-ink-800 bg-ink-900/40">
      <div className="section">
        <Reveal>
          <p className="eyebrow">Практика</p>
          <h2 className="section-title mt-2">Разбор заданий ЕГЭ</h2>
          <p className="mt-2 max-w-2xl text-ink-300">
            Примеры заданий с подробным решением. Обновляются регулярно — заглядывайте почаще.
          </p>
        </Reveal>
        <div className="mt-8 space-y-4">
          {ege.length === 0 && <p className="text-ink-400">Задания скоро появятся.</p>}
          {ege.map((t) => (
            <Reveal key={t.id}>
              <details className="card group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span className="flex flex-wrap items-center gap-3">
                    <span className="flex h-9 min-w-9 items-center justify-center rounded-lg bg-brand-600 px-2 text-sm font-bold text-white">
                      №{t.number}
                    </span>
                    <span className="font-semibold text-white">{t.topic}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${difficultyStyle[t.difficulty] ?? "border border-ink-600 bg-ink-800 text-ink-300"}`}>
                      {t.difficulty}
                    </span>
                  </span>
                  <span className="text-ink-400 transition group-open:rotate-180">▾</span>
                </summary>
                <div className="mt-4 space-y-3 text-sm text-ink-200">
                  <p><span className="font-semibold text-white">Условие. </span>{t.statement}</p>
                  <p><span className="font-semibold text-white">Решение. </span>{t.solution}</p>
                  <p><span className="font-semibold text-white">Ответ: </span><span className="font-semibold text-brand-300">{t.answer}</span></p>
                </div>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
