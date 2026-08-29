import { notFound } from "next/navigation";
import { getProjectBySlug } from "@/lib/assignments";
import PrintButton from "@/components/assignments/PrintButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Проверенная работа", robots: { index: false, follow: false } };

export default async function ReportPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project?.submission || !project.review) notFound();
  const max = Math.max(...project.tasks.map((t) => t.maxScore), 1);
  return <main className="min-h-screen bg-slate-100 p-4 text-slate-900 print:bg-white print:p-0">
    <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm print:max-w-none print:rounded-none print:shadow-none">
      <div className="mb-8 flex items-start justify-between border-b border-slate-200 pb-6"><div><p className="text-xs font-bold uppercase tracking-widest text-violet-700">Проверенная работа</p><h1 className="mt-2 text-3xl font-bold">{project.title}</h1><p className="mt-2 text-slate-500">Ученик: {project.submission.studentName}</p></div><div className="text-right"><b className="text-3xl">{project.review.total}</b><p className="text-sm text-slate-500">из {project.tasks.reduce((s,t) => s + t.maxScore, 0)} баллов</p></div></div>
      <section className="mb-10 break-inside-avoid"><h2 className="text-xl font-bold">Статистика по заданиям</h2><div className="mt-6 flex h-56 items-end gap-3 border-b border-l border-slate-300 px-4">{project.tasks.map((task, i) => { const score = project.review!.items.find((x) => x.taskId === task.id)?.score || 0; return <div key={task.id} className="flex h-full flex-1 flex-col items-center justify-end gap-2"><span className="text-sm font-bold">{score}/{task.maxScore}</span><div className="w-full max-w-16 rounded-t-md bg-violet-600" style={{ height: `${Math.max(4, score / max * 80)}%` }} /><span className="pb-2 text-xs text-slate-500">№{i + 1}</span></div>; })}</div></section>
      <div className="space-y-8">{project.tasks.map((task, index) => { const answer = project.submission!.answers.find((a) => a.taskId === task.id); const review = project.review!.items.find((x) => x.taskId === task.id); return <article key={task.id} className="break-inside-avoid border-t border-slate-200 pt-6"><div className="flex justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-400">Задание {index + 1}</p><h2 className="mt-1 text-lg font-bold">{task.title}</h2></div><b>{review?.score || 0} / {task.maxScore}</b></div><p className="mt-3 whitespace-pre-wrap">{task.statement}</p>{answer?.selectedOption && <p className="mt-4 rounded bg-slate-50 p-3"><b>Выбранный ответ:</b> {answer.selectedOption}</p>}{answer?.text && <div className="mt-4 whitespace-pre-wrap rounded border border-slate-200 p-4">{answer.text}</div>}{answer?.drawing && <img src={answer.drawing} alt="Рисунок ученика" className="mt-4 w-full rounded border border-slate-200" />}{review?.annotation && <div className="relative mt-4"><p className="mb-2 text-sm font-bold text-red-700">Пометки преподавателя</p><img src={review.annotation} alt="Красные пометки" className="w-full rounded border border-red-200" /></div>}{review?.comment && <p className="mt-4 rounded bg-red-50 p-4 text-red-900"><b>Комментарий:</b> {review.comment}</p>}</article>; })}</div>
      <div className="mt-10 flex justify-center print:hidden"><PrintButton /></div>
    </div>
  </main>;
}
