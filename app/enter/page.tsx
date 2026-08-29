import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";
import AdminDashboard from "@/components/admin/AdminDashboard";
import { isAuthenticated } from "@/lib/auth";
import { getCourses, getEge, getLeads, getMaterials, getNews, getReviews, getSettings } from "@/lib/store";

// Категорически запрещаем индексацию скрытого раздела.
export const metadata: Metadata = {
  title: "Вход",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

export default async function EnterPage() {
  if (!isAuthenticated()) {
    return <LoginForm />;
  }

  const [settings, news, courses, ege, reviews, materials, leads] = await Promise.all([
    getSettings(),
    getNews(),
    getCourses(),
    getEge(),
    getReviews(),
    getMaterials(),
    getLeads(),
  ]);

  return (
    <AdminDashboard
      initialSettings={settings}
      initialNews={news}
      initialCourses={courses}
      initialEge={ege}
      initialReviews={reviews}
      initialMaterials={materials}
      initialLeads={leads}
    />
  );
}
