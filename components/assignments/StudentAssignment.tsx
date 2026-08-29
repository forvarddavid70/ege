"use client";

import { useMemo, useState } from "react";
import DrawingCanvas from "./DrawingCanvas";
import type { AssignmentProject, StudentAnswer } from "@/lib/assignments";

export default function StudentAssignment({ project }: { project: AssignmentProject }) {
  const [studentName, setStudentName] = useState("");
  const [studentContact, setStudentContact] = useState("");
  const [answers, setAnswers] = useState<StudentAnswer[]>(() => project.tasks.map((task) => ({ taskId: task.id, selectedOption: "", text: "", drawing: "" })));
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">(project.submission ? "done" : "idle");
  const answered = useMemo(() => answers.filter((a) => a.selectedOption || a.text.trim() || a.drawing).length, [answers]);
  function patch(taskId: string, value: Partial<StudentAnswer>) { setAnswers((list) => list.map((a) => a.taskId === taskId ? { ...a, ...value } : a)); }
  async function submit() {
    if (!studentName.trim()) { setState("error"); return; }
    setState("sending");
    const res = await fetch(`/api/assignments/${project.slug}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ studentName, studentContact, answers, submittedAt: "" }) });
    setState(res.ok ? "done" : "error");
  }
  if (state === "done") return <main className="min-h-screen bg-[#f2f0eb] px-4 py-16 text-slate-900"><div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm"><div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-700">✓</div><h1 className="text-2xl font-bold">Работа отправлена</h1><p className="mt-3 text-slate-600">Автор получил уведомление. После проверки можно будет получить результат и PDF с пометками.</p></div></main>;
  return <main className="min-h-screen bg-[#e9e6df] py-8 text-[#272726]">
    <div className="mx-auto max-w-4xl px-4">
      <header className="mb-6 rounded-xl border border-black/10 bg-white px-6 py-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[.18em] text-violet-700">ЕГЭ Father · работа ученика</p>
        <h1 className="mt-2 text-3xl font-bold">{project.title}</h1>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Имя ученика *" value={studentName} onChange={(e) => setStudentName(e.target.value)} /><input className="rounded-lg border border-slate-300 px-4 py-3" placeholder="Telegram или телефон" value={studentContact} onChange={(e) => setStudentContact(e.target.value)} /></div>
      </header>
      <div className="space-y-6">{project.tasks.map((task, index) => { const answer = answers.find((a) => a.taskId === task.id)!; return <article key={task.id} className="relative rounded-sm border border-black/10 bg-[#fffef9] p-6 shadow-[0_1px_2px_rgba(0,0,0,.08)] sm:p-9">
        <div className="absolute left-0 top-8 h-10 w-1 bg-violet-600" /><div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-slate-500">{task.categoryName ? `${task.categoryName} · ` : ""}Задание {index + 1}</p><h2 className="mt-1 text-xl font-bold">{task.title}</h2></div><span className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold">до {task.maxScore} б.</span></div>
        <p className="whitespace-pre-wrap text-[17px] leading-7">{task.statement}</p>
        {task.imageUrl && <figure className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white"><img src={task.imageUrl} alt={`Иллюстрация к заданию ${index + 1}`} className="block h-auto w-full object-contain" /></figure>}
        {task.options.length > 0 && <div className="mt-6 grid gap-2">{task.options.map((option) => <label key={option} className={`flex cursor-pointer gap-3 rounded-lg border p-3 ${answer.selectedOption === option ? "border-violet-500 bg-violet-50" : "border-slate-200"}`}><input type="radio" name={task.id} checked={answer.selectedOption === option} onChange={() => patch(task.id, { selectedOption: option })} /><span>{option}</span></label>)}</div>}
        {task.allowExpandedAnswer && <div className="mt-6 border-t border-dashed border-slate-300 pt-5"><label className="flex cursor-pointer items-center gap-3 font-semibold"><input type="checkbox" checked={!!expanded[task.id]} onChange={(e) => setExpanded((x) => ({ ...x, [task.id]: e.target.checked }))} />Развернуть поле для собственного ответа</label>{expanded[task.id] && <div className="mt-4 space-y-4"><textarea className="min-h-40 w-full rounded-lg border border-slate-300 bg-white p-4 leading-6" placeholder="Напишите решение, пояснение или ответ…" value={answer.text} onChange={(e) => patch(task.id, { text: e.target.value })} />{task.allowDrawing && <div><p className="mb-2 text-sm font-semibold text-slate-600">Черновик / рисунок</p><DrawingCanvas value={answer.drawing} onChange={(drawing) => patch(task.id, { drawing })} /></div>}</div>}</div>}
      </article>; })}</div>
      <footer className="sticky bottom-4 mt-6 flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-white/95 p-4 shadow-lg backdrop-blur"><p className="text-sm text-slate-600">Заполнено: <b className="text-slate-900">{answered} из {project.tasks.length}</b></p><button onClick={submit} disabled={state === "sending"} className="rounded-lg bg-violet-600 px-6 py-3 font-bold text-white hover:bg-violet-700 disabled:opacity-50">{state === "sending" ? "Отправляем…" : "Завершить тест"}</button></footer>
      {state === "error" && <p className="mt-3 text-center font-medium text-red-700">Укажите имя и попробуйте снова.</p>}
    </div>
  </main>;
}
