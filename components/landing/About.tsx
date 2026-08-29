import Reveal from "@/components/ui/Reveal";
import TutorAvatar from "@/components/TutorAvatar";
import { TelegramIcon } from "@/components/icons";
import { FlaskIcon } from "@/components/chem";
import type { Settings } from "@/lib/types";

export default function About({
  settings,
  trialHref,
  tgUsername,
}: {
  settings: Settings;
  trialHref: string;
  tgUsername: string;
}) {
  const images = settings.aboutImages ?? [];

  return (
    <section id="about" className="border-t border-ink-800">
      <div className="section">
        <Reveal>
          <div className="max-w-2xl">
            <p className="eyebrow">Знакомство</p>
            <h2 className="section-title mt-2">Обо мне</h2>
            <p className="mt-4 text-ink-200">{settings.about}</p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-2 lg:items-start">
          {/* Левая колонка — визитка репетитора + приглашение на пробное */}
          <Reveal>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <span className="avatar-ring shrink-0 rounded-2xl p-[2px]">
                  <TutorAvatar
                    src={settings.avatarUrl}
                    name={settings.tutorName}
                    className="h-16 w-16 rounded-[14px]"
                    initialsClassName="text-lg"
                  />
                </span>
                <div>
                  <p className="text-lg font-semibold text-white">{settings.tutorName}</p>
                  <p className="text-sm text-brand-300">Репетитор по химии • эксперт ЕГЭ</p>
                </div>
              </div>

              <div className="card bg-gradient-to-br from-brand-900/40 to-ink-900/40">
                <h3 className="text-xl font-bold text-white">Первое занятие — бесплатно</h3>
                <p className="mt-2 text-ink-200">
                  Приглашаю вас на бесплатный пробный урок! Покажу, что химия может быть простой и понятной.
                </p>
                <a href={trialHref} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5">
                  <TelegramIcon />
                  Записаться на пробное
                </a>
                <div className="mt-6 space-y-1 text-sm text-ink-300">
                  <p>Telegram: <span className="font-medium text-ink-100">@{tgUsername || "—"}</span></p>
                  {settings.telegramChannel && (
                    <p>Канал: <span className="font-medium text-ink-100">@{settings.telegramChannel}</span></p>
                  )}
                  <p>E-mail: <span className="font-medium text-ink-100">{settings.email}</span></p>
                  <p>Телефон: <span className="font-medium text-ink-100">{settings.phone}</span></p>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Правая колонка — галерея загруженных изображений (PNG 800×600) */}
          <Reveal delay={90}>
            {images.length > 0 ? (
              <div
                className={`grid gap-4 ${images.length === 1 ? "grid-cols-1" : "sm:grid-cols-2"}`}
              >
                {images.map((url, idx) => (
                  <figure
                    key={`${url}-${idx}`}
                    className={`avatar-ring rounded-2xl p-[2px] ${
                      images.length >= 3 && idx === 0 ? "sm:col-span-2" : ""
                    }`}
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-[14px] bg-ink-800">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={url}
                        alt={`${settings.tutorName} — фото ${idx + 1}`}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  </figure>
                ))}
              </div>
            ) : (
              // Пока изображения не загружены — аккуратная брендовая заглушка,
              // без «битых» картинок. Загрузить фото можно в админке /enter.
              <div className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-ink-700 bg-gradient-to-br from-brand-900/30 to-ink-900/40 text-center">
                <FlaskIcon className="h-12 w-12 text-brand-400" />
                <p className="max-w-xs px-6 text-sm text-ink-400">
                  Здесь появятся фотографии — их можно загрузить в разделе «Настройки» админки.
                </p>
              </div>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
