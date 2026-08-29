import Reveal from "@/components/ui/Reveal";
import { telegramLink } from "@/lib/telegram";
import type { Course } from "@/lib/types";

export default function Courses({
  courses,
  tgUsername,
  tutorName,
}: {
  courses: Course[];
  tgUsername: string;
  tutorName: string;
}) {
  return (
    <section id="courses">
      <div className="section">
        <Reveal>
          <p className="eyebrow">Форматы</p>
          <h2 className="section-title mt-2">Форматы занятий</h2>
          <p className="mt-2 max-w-2xl text-ink-300">
            Выберите формат под свою цель — от подготовки к экзаменам до закрытия школьных пробелов.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {courses.length === 0 && <p className="text-ink-400">Курсы скоро появятся.</p>}
          {courses.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 90}>
              <div className="card flex h-full flex-col">
                <span className="chip mb-3 w-max">{c.audience}</span>
                <h3 className="text-lg font-semibold text-white">{c.title}</h3>
                <p className="mt-2 flex-1 text-sm text-ink-300">{c.description}</p>
                <dl className="mt-4 space-y-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-ink-400">Формат</dt>
                    <dd className="text-right font-medium text-ink-100">{c.format}</dd>
                  </div>
                </dl>
                <a
                  href={telegramLink(tgUsername, `Здравствуйте, ${tutorName}! Интересует курс «${c.title}». Расскажите подробнее, пожалуйста.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary mt-5"
                >
                  Записаться
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
