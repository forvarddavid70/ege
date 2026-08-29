import type { Metadata, Viewport } from "next";
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";
import { getSettings } from "@/lib/store";
import { getSiteUrl } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const [settings, siteUrl] = await Promise.all([getSettings(), getSiteUrl()]);
  const brand = settings.brandName || "ЕГЭ Father";
  const tutor = settings.tutorName || "Никита Понасенков";
  const title = `${brand} | ${tutor} — репетитор по химии (ЕГЭ)`;
  const description =
    settings.subheadline ||
    `Подготовка к ЕГЭ по химии с ${tutor} («${brand}»): индивидуальная программа, разбор реальных заданий, высокий балл и мотивация.`;

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      // Дочерние страницы (напр. /privacy) получают «Заголовок — Бренд».
      template: `%s — ${brand}`,
    },
    description,
    applicationName: brand,
    keywords: [
      "репетитор по химии",
      "ЕГЭ химия",
      tutor,
      brand,
      "подготовка к ЕГЭ",
    ],
    alternates: { canonical: "/" },
    openGraph: {
      title,
      description,
      type: "website",
      url: "/",
      siteName: brand,
      locale: "ru_RU",
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: `${brand} — ${tutor}, репетитор по химии`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og.png"],
    },
    // Подтверждение прав в Google Search Console: мета-тег
    // <meta name="google-site-verification" …>. Это не аналитика и не cookie,
    // поэтому тег добавляется всегда (не зависит от согласия на cookie).
    verification: settings.googleSiteVerification
      ? { google: settings.googleSiteVerification }
      : undefined,
  };
}

export const viewport: Viewport = {
  themeColor: "#08080c",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <head>
        {/* Шрифты Inter (текст) + Manrope (заголовки). Обе гарнитуры содержат
            кириллицу. Подключаются ссылкой, чтобы не требовать сети на этапе
            сборки; при недоступности — аккуратный системный фолбэк. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Manrope:wght@600;700;800&display=swap"
        />
      </head>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
