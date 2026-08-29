import SiteHeader from "@/components/SiteHeader";
import FloatingTelegram from "@/components/FloatingTelegram";
import Hero from "@/components/landing/Hero";
import Advantages from "@/components/landing/Advantages";
import Results from "@/components/landing/Results";
import Plan from "@/components/landing/Plan";
import Courses from "@/components/landing/Courses";
import EgeTasks from "@/components/landing/EgeTasks";
import Blog from "@/components/landing/Blog";
import Reviews from "@/components/landing/Reviews";
import About from "@/components/landing/About";
import Materials from "@/components/landing/Materials";
import LeadForm from "@/components/landing/LeadForm";
import SiteFooter from "@/components/landing/SiteFooter";
import StructuredData from "@/components/StructuredData";
import Analytics from "@/components/Analytics";
import { getCourses, getEge, getMaterials, getNews, getReviews, getSettings } from "@/lib/store";
import { getSiteUrl } from "@/lib/site";
import { telegramLink, telegramChannelLink } from "@/lib/telegram";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, courses, news, ege, reviews, materials, siteUrl] = await Promise.all([
    getSettings(),
    getCourses(),
    getNews(),
    getEge(),
    getReviews(),
    getMaterials(),
    getSiteUrl(),
  ]);

  const tgUsername = settings.telegramUsername || process.env.NEXT_PUBLIC_TELEGRAM_USERNAME || "";
  const tgHref = telegramLink(tgUsername, settings.telegramPrefill);
  const trialHref = telegramLink(
    tgUsername,
    `Здравствуйте, ${settings.tutorName}! Хочу записаться на бесплатное пробное занятие по химии.`
  );
  const channelHref = telegramChannelLink(settings.telegramChannel);

  return (
    <div id="top">
      <StructuredData settings={settings} courses={courses} siteUrl={siteUrl} />
      <Analytics
        yandexMetrikaId={settings.yandexMetrikaId}
        googleTagManagerId={settings.googleTagManagerId}
      />

      <SiteHeader tutorName={settings.tutorName} brandName={settings.brandName} telegramHref={tgHref} />

      <Hero settings={settings} trialHref={trialHref} />
      <Advantages />
      <Results settings={settings} />
      <Plan />
      <Courses courses={courses} tgUsername={tgUsername} tutorName={settings.tutorName} />
      <EgeTasks ege={ege} />
      <Blog news={news} channelHref={channelHref} />
      <Reviews reviews={reviews} trialHref={trialHref} />
      <About settings={settings} trialHref={trialHref} tgUsername={tgUsername} />
      <Materials materials={materials} />
      <LeadForm telegramHref={tgHref} email={settings.email} />

      <SiteFooter settings={settings} />

      <FloatingTelegram href={tgHref} />
    </div>
  );
}
