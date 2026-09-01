import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/assignments";
import PrintButton from "@/components/assignments/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Проверенная работа", robots: { index: false, follow: false } };
const COLORS = ["#5E9FE8", "#EAC26B", "#72BC8F", "#BF8EDA", "#DE9255", "#DF84A8", "#4FB9C9", "#E97366"];

export default async function ReportPage({ params, searchParams }: { params: { slug: string }; searchParams?: { print?: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project?.submission || !project.review) notFound();
  const fallbackCategories = Array.from(new Map(project.tasks.map((task) => [task.categoryId || "other", { id: task.categoryId || "other", name: task.categoryName || "Без подтипа" }])).values());
  const categories = project.categories?.length ? project.categories : fallbackCategories;
  const stats = categories.map((category) => {
    const tasks = project.tasks.filter((task) => (task.categoryId || "other") === category.id);
    const score = tasks.reduce((sum, task) => sum + (project.review!.items.find((item) => item.taskId === task.id)?.score || 0), 0);
    const maximum = tasks.reduce((sum, task) => sum + task.maxScore, 0);
    return { ...category, score, maximum, percent: maximum ? Math.round(score / maximum * 100) : 0 };
  });
  const totalMaximum = project.tasks.reduce((sum, task) => sum + task.maxScore, 0);

  return <main className="min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0">
    <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:shadow-none">
      <div className="mb-8 flex items-start justify-between border-b border-slate-200 pb-6"><div><p className="text-xs font-bold uppercase tracking-widest text-violet-700">Проверенная работа</p><h1 className="mt-2 text-3xl font-bold">{project.title}</h1><p className="mt-2 text-slate-500">Ученик: {project.submission.studentName}</p></div><div className="text-right"><b className="text-3xl">{project.review.total}</b><p className="text-sm text-slate-500">из {totalMaximum} баллов</p></div></div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-violet-200 bg-violet-50 p-4 print:hidden"><div><b className="text-violet-900">Результаты подведены</b><p className="mt-1 text-sm text-violet-700">Скачайте обработанный материал для ученика в PDF и откройте вертикальную диаграмму статистики.</p></div><div className="flex flex-wrap gap-2"><PrintButton auto={searchParams?.print === "1"} /><a href="#stats" className="rounded-lg border border-violet-300 px-6 py-3 font-bold text-violet-800 hover:bg-violet-100">К диаграмме</a></div></div>

      <section id="stats" className="mb-10 scroll-mt-6 break-inside-avoid"><div className="flex items-end justify-between gap-4"><div><h2 className="text-xl font-bold">Статистика по подтипам</h2><p className="mt-1 text-sm text-slate-500">Один столбец = одна подпапка проекта</p></div><span className="text-sm font-semibold text-slate-500">{stats.length} {stats.length === 1 ? "подтип" : "подтипов"}</span></div><div className="mt-6 flex h-64 items-end gap-3 border-b border-l border-slate-300 px-4">{stats.map((item, index) => <div key={item.id} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"><span className="text-sm font-bold">{item.score}/{item.maximum}</span><div className="w-full max-w-20 rounded-t-md" style={{ height: `${Math.max(4, item.percent * .8)}%`, backgroundColor: COLORS[index % COLORS.length] }} /><span className="w-full truncate pb-2 text-center text-xs font-medium text-slate-600" title={item.name}>{item.name}</span></div>)}</div></section>

      <div className="space-y-8">{project.tasks.map((task, index) => { const answer = project.submission!.answers.find((item) => item.taskId === task.id); const review = project.review!.items.find((item) => item.taskId === task.id); return <article key={task.id} className="break-inside-avoid border-t border-slate-200 pt-6"><div className="flex justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-violet-600">{task.categoryName || "Подтип"} · задание {index + 1}</p><h2 className="mt-1 text-lg font-bold">{task.title}</h2></div><b>{review?.score || 0} / {task.maxScore}</b></div><p className="mt-3 whitespace-pre-wrap">{task.statement}</p>{task.imageUrl && <img src={task.imageUrl} alt={`Иллюстрация к заданию ${index + 1}`} className="mt-4 h-auto w-full rounded border border-slate-200 object-contain" />}{answer?.selectedOption && <p className="mt-4 rounded bg-slate-50 p-3"><b>Выбранный ответ:</b> {answer.selectedOption}</p>}{answer?.text && <div className="mt-4 whitespace-pre-wrap rounded border border-slate-200 p-4">{answer.text}</div>}{answer?.drawing && <img src={answer.drawing} alt="Рисунок ученика" className="mt-4 w-full rounded border border-slate-200" />}{review?.annotation && <div className="mt-4"><p className="mb-2 text-sm font-bold text-red-700">Пометки преподавателя</p><img src={review.annotation} alt="Красные пометки" className="w-full rounded border border-red-200" /></div>}{review?.comment && <p className="mt-4 rounded bg-red-50 p-4 text-red-900"><b>Комментарий:</b> {review.comment}</p>}</article>; })}</div>
      <div className="mt-10 flex justify-center print:hidden"><PrintButton /></div>
    </div>
  </main>;
}
