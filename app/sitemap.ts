import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";

export const dynamic = "force-dynamic";

/**
 * Карта сайта. Проект — одностраничный лендинг, поэтому индексируем корень
 * и страницу политики конфиденциальности. Скрытый раздел /enter и /api
 * намеренно не включаются (они закрыты в robots и заголовком X-Robots-Tag).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = await getSiteUrl();
  const now = new Date();
  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/privacy`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
