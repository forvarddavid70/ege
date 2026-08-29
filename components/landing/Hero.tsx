import TutorAvatar from "@/components/TutorAvatar";
import { TelegramIcon, ArrowRightIcon, SparkIcon } from "@/components/icons";
import { HexGrid } from "@/components/chem";
import type { Settings } from "@/lib/types";

// Темы Telegram-канала «ЕГЭ Father» — показываем чипами в hero.
const CHANNEL_TOPICS = [
  "Разборы ЕГЭ",
  "Лайфхаки по химии",
  "Мотивация",
  "Бесплатные материалы",
  "Пробники",
];

export default function Hero({
  settings,
  trialHref,
}: {
  settings: Settings;
  trialHref: string;
}) {
  return (
    <section className="hero-gradient relative overflow-hidden">
      <HexGrid className="pointer-events-none absolute inset-0 h-full w-full text-brand-500/10" />
      <div className="section relative grid items-center gap-10 lg:grid-cols-2">
        <div className="animate-fade-up">
          {/* Профиль репетитора — виден на мобильных/планшетах (на десктопе есть портрет справа) */}
          <div className="mb-6 flex items-center gap-4 lg:hidden">
            <span className="avatar-ring shrink-0 rounded-2xl p-[2px]">
              <TutorAvatar
                src={settings.avatarUrl}
                name={settings.tutorName}
                className="h-16 w-16 rounded-[14px]"
                initialsClassName="text-xl"
              />
            </span>
            <div>
              <p className="text-base font-bold text-white">{settings.tutorName}</p>
              <p className="text-sm text-brand-300">Репетитор по химии • эксперт ЕГЭ</p>
            </div>
          </div>

          <span className="chip mb-4 gap-1.5">
            <SparkIcon className="h-3.5 w-3.5" />
            Химия • ЕГЭ
          </span>
          <p className="eyebrow mb-3">{settings.brandName}</p>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            {settings.headline}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-ink-200">{settings.subheadline}</p>

          {settings.heroQuote && (
            <p className="mt-5 border-l-2 border-brand-500 pl-4 text-lg font-semibold italic text-gradient">
              «{settings.heroQuote}»
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={trialHref} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <TelegramIcon />
              Бесплатное пробное занятие
            </a>
            <a href="#courses" className="btn-ghost">
              Посмотреть форматы
              <ArrowRightIcon className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-7 flex flex-wrap gap-2">
            {CHANNEL_TOPICS.map((t) => (
              <span key={t} className="rounded-full border border-ink-600 bg-ink-800/60 px-3 py-1 text-xs text-ink-200">
                #{t.replace(/\s+/g, "")}
              </span>
            ))}
          </div>

          <dl className="mt-9 grid max-w-md grid-cols-3 gap-4">
            <div>
              <dt className="text-sm text-ink-400">Опыт</dt>
              <dd className="text-2xl font-bold text-white">{settings.experienceYears} лет</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-400">Учеников</dt>
              <dd className="text-2xl font-bold text-white">{settings.studentsCount}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink-400">Средний балл ЕГЭ</dt>
              <dd className="text-2xl font-bold text-white">{settings.avgScore}</dd>
            </div>
          </dl>
        </div>

        <div className="relative hidden justify-self-center lg:flex">
          <div className="w-80 rounded-3xl border border-ink-800 bg-ink-900/40 p-6 text-center backdrop-blur">
            {/* Портрет-аватар репетитора в градиентном кольце */}
            <div className="relative mx-auto h-48 w-48">
              <span className="avatar-ring block h-48 w-48 rounded-full p-[3px]">
                <TutorAvatar
                  src={settings.avatarUrl}
                  name={settings.tutorName}
                  className="h-full w-full rounded-full"
                  initialsClassName="text-6xl"
                />
              </span>
            </div>

            <h2 className="mt-5 text-xl font-bold text-white">{settings.tutorName}</h2>
            <p className="mt-1 text-sm text-brand-300">Репетитор по химии • эксперт ЕГЭ</p>

            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="chip">Онлайн</span>
              <span className="chip">Химия</span>
              <span className="chip">ЕГЭ</span>
            </div>

            {settings.heroQuote && (
              <p className="mt-5 border-t border-ink-700 pt-4 text-sm font-medium italic text-ink-200">
                «{settings.heroQuote}»
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
