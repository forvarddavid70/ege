import type { Course, Settings } from "@/lib/types";
import { absoluteUrl } from "@/lib/site";

/**
 * Микроразметка schema.org (JSON-LD) для поисковых систем.
 *
 * Отдаём граф из связанных сущностей:
 *  - WebSite     — сам сайт;
 *  - Person      — репетитор (имя, специализация, контакты, соцсети);
 *  - Course[]    — курсы/форматы занятий со ссылкой на репетитора как провайдера.
 *
 * Разметка невидима для пользователя и не влияет на вёрстку — это отдельный
 * <script type="application/ld+json"> в разметке страницы.
 */
export default function StructuredData({
  settings,
  courses,
  siteUrl,
}: {
  settings: Settings;
  courses: Course[];
  siteUrl: string;
}) {
  const brand = settings.brandName || "ЕГЭ Father";
  const tutor = settings.tutorName || "Никита Понасенков";
  const personId = `${siteUrl}/#person`;
  const websiteId = `${siteUrl}/#website`;

  // Ссылки на соцсети/мессенджеры для поля sameAs.
  const sameAs = [
    settings.telegramChannel && `https://t.me/${settings.telegramChannel}`,
    settings.telegramUsername && `https://t.me/${settings.telegramUsername}`,
  ].filter(Boolean) as string[];

  const person = {
    "@type": "Person",
    "@id": personId,
    name: tutor,
    jobTitle: "Репетитор по химии",
    description: settings.about || settings.subheadline,
    url: siteUrl,
    ...(settings.avatarUrl ? { image: absoluteUrl(siteUrl, settings.avatarUrl) } : {}),
    ...(settings.email ? { email: settings.email } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    knowsAbout: [
      "Химия",
      "Органическая химия",
      "Неорганическая химия",
      "Подготовка к ЕГЭ по химии",
    ],
    ...(sameAs.length ? { sameAs } : {}),
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    url: siteUrl,
    name: brand,
    inLanguage: "ru-RU",
    publisher: { "@id": personId },
  };

  const courseNodes = courses.map((c) => ({
    "@type": "Course",
    name: c.title,
    description: c.description,
    inLanguage: "ru-RU",
    ...(c.audience ? { educationalLevel: c.audience } : {}),
    provider: {
      "@type": "Person",
      "@id": personId,
      name: tutor,
    },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "online",
      ...(c.format ? { description: c.format } : {}),
      instructor: { "@id": personId },
    },
  }));

  const graph = {
    "@context": "https://schema.org",
    "@graph": [website, person, ...courseNodes],
  };

  return (
    <script
      type="application/ld+json"
      // JSON.stringify безопасно экранирует значения; дополнительно закрываем "<"
      // на случай, если в контенте встретится "</script>".
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(graph).replace(/</g, "\\u003c"),
      }}
    />
  );
}
