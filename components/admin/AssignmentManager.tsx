"use client";

import { useMemo, useState } from "react";
import DrawingCanvas from "@/components/assignments/DrawingCanvas";
import type { AssignmentFolder, AssignmentProject, AssignmentStore, AssignmentTask, TaskReview } from "@/lib/assignments";

const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
const makeSlug = () => `work-${Math.random().toString(36).slice(2, 10)}`;
const blankTask = (): AssignmentTask => ({ id: uid(), title: "Новое задание", statement: "", options: [""], allowExpandedAnswer: true, allowDrawing: true, needsAnalysis: false, analysisNote: "", maxScore: 1 });

export default function AssignmentManager({ initial }: { initial: AssignmentStore }) {
  const [data, setData] = useState(initial);
  const [selected, setSelected] = useState<string | null>(initial.folders[0]?.id ?? null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const folder = data.folders.find((x) => x.id === selected);
  const root = folder?.parentId ? data.folders.find((x) => x.id === folder.parentId) : folder;
  const categories = root ? data.folders.filter((x) => x.parentId === root.id) : [];
  const linkedProject = root ? data.projects.find((p) => p.rootFolderId === root.id || (!p.rootFolderId && p.folderIds[0] === root.id)) : undefined;
  const reviewProject = data.projects.find((x) => x.id === reviewId);

  async function persist(next = data) {
    const res = await fetch("/api/admin/assignments", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(next) });
    setSaved(res.ok);
    return res.ok;
  }
  function mutateFolder(id: string, fn: (f: AssignmentFolder) => AssignmentFolder) {
    setData((d) => ({ ...d, folders: d.folders.map((f) => f.id === id ? fn(f) : f) }));
    setSaved(false);
  }
  function addProject() {
    const item: AssignmentFolder = { id: uid(), name: "Новый проект", parentId: null, tasks: [] };
    setData((d) => ({ ...d, folders: [...d.folders, item] }));
    setSelected(item.id);
    setSaved(false);
  }
  function addCategory(rootId: string) {
    const item: AssignmentFolder = { id: uid(), name: "Новый подтип", parentId: rootId, tasks: [] };
    setData((d) => ({ ...d, folders: [...d.folders, item] }));
    setSelected(item.id);
    setSaved(false);
  }
  function removeFolder(id: string) {
    const target = data.folders.find((f) => f.id === id);
    if (!target) return;
    const ids = new Set([id]);
    if (!target.parentId) data.folders.filter((f) => f.parentId === id).forEach((f) => ids.add(f.id));
    const project = !target.parentId ? data.projects.find((p) => p.rootFolderId === id || p.folderIds[0] === id) : undefined;
    const warning = project ? " Постоянная ссылка и связанные результаты проекта также будут удалены." : "";
    if (!confirm(`Удалить ${target.parentId ? "подтип" : "проект"} «${target.name}»?${warning}`)) return;
    const next = { ...data, folders: data.folders.filter((f) => !ids.has(f.id)), projects: project ? data.projects.filter((p) => p.id !== project.id) : data.projects };
    setData(next);
    setSelected(next.folders[0]?.id ?? null);
    persist(next);
  }
  async function getPermanentLink() {
    if (!root) return;
    const children = data.folders.filter((f) => f.parentId === root.id);
    if (!children.length) { alert("Сначала добавьте хотя бы один подтип заданий."); return; }
    const tasks = children.flatMap((category) => category.tasks.map((task) => ({ ...task, categoryId: category.id, categoryName: category.name })));
    if (!tasks.length) { alert("Добавьте задания хотя бы в один подтип."); return; }
    const current = data.projects.find((p) => p.rootFolderId === root.id || (!p.rootFolderId && p.folderIds[0] === root.id));
    let project: AssignmentProject;
    if (current) {
      project = current.submission ? current : { ...current, title: root.name, rootFolderId: root.id, folderIds: children.map((x) => x.id), categories: children.map((x) => ({ id: x.id, name: x.name })), tasks, status: "published" };
    } else {
      project = { id: uid(), slug: makeSlug(), title: root.name, rootFolderId: root.id, folderIds: children.map((x) => x.id), categories: children.map((x) => ({ id: x.id, name: x.name })), tasks, status: "published", createdAt: new Date().toISOString() };
    }
    const next = { ...data, projects: current ? data.projects.map((p) => p.id === current.id ? project : p) : [project, ...data.projects] };
    setData(next);
    await persist(next);
    const url = `${location.origin}/assignment/${project.slug}`;
    await navigator.clipboard.writeText(url).catch(() => null);
    alert(current ? `Постоянная ссылка проекта скопирована:\n${url}` : `Ссылка создана и скопирована:\n${url}`);
  }
  function removeProject(id: string) {
    const project = data.projects.find((p) => p.id === id);
    if (!project || !confirm(`Удалить ссылку проекта «${project.title}»${project.submission ? " вместе с ответами ученика" : ""}?`)) return;
    const next = { ...data, projects: data.projects.filter((p) => p.id !== id) };
    setData(next);
    persist(next);
  }

  if (reviewProject?.submission) return <ReviewPanel project={reviewProject} onBack={() => setReviewId(null)} onDone={(project) => setData((d) => ({ ...d, projects: d.projects.map((p) => p.id === project.id ? project : p) }))} />;

  return <section className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-bold text-white">Выдача заданий</h2><p className="mt-1 text-sm text-ink-400">Проект = папка · подтип заданий = одна подпапка · глубже уровней нет</p></div>
      <div className="flex gap-2"><button onClick={addProject} className="btn-ghost">+ Проект</button><button onClick={() => persist()} className="btn-primary">{saved ? "Сохранено ✓" : "Сохранить"}</button></div>
    </div>
    <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-2xl border border-ink-700 bg-ink-800/70 p-3">
        <p className="px-2 pb-2 text-xs font-bold uppercase tracking-widest text-ink-400">Проекты и подтипы</p>
        {data.folders.filter((f) => !f.parentId).map((project) => <ProjectTree key={project.id} project={project} categories={data.folders.filter((f) => f.parentId === project.id)} selected={selected} onSelect={setSelected} onAddCategory={addCategory} onRemove={removeFolder} />)}
        {!data.folders.some((f) => !f.parentId) && <p className="p-4 text-sm text-ink-400">Создайте первый проект.</p>}
      </aside>
      <div className="space-y-5">
        {root ? <div className="rounded-2xl border border-ink-700 bg-ink-800/70 p-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-[220px] flex-1"><label className="label">Название проекта</label><input className="input text-lg font-bold" value={root.name} onChange={(e) => mutateFolder(root.id, (f) => ({ ...f, name: e.target.value }))} /></div>
            <button onClick={() => addCategory(root.id)} className="btn-ghost mt-6">+ Подтип</button>
            <button onClick={getPermanentLink} className="btn-primary mt-6">{linkedProject ? "Показать постоянную ссылку" : "Сохранить и создать ссылку"}</button>
          </div>
          {linkedProject && <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-700/50 bg-emerald-900/20 p-4"><div><p className="text-xs font-bold uppercase tracking-wider text-emerald-400">Постоянная ссылка проекта</p><code className="mt-1 block break-all text-sm text-emerald-100">{`/assignment/${linkedProject.slug}`}</code></div><button onClick={() => navigator.clipboard.writeText(`${location.origin}/assignment/${linkedProject.slug}`)} className="btn-ghost">Копировать</button></div>}
          {!folder?.parentId ? <ProjectOverview categories={categories} onSelect={setSelected} /> : <CategoryEditor folder={folder} onChange={(next) => mutateFolder(folder.id, () => next)} />}
        </div> : <div className="rounded-2xl border border-dashed border-ink-700 p-10 text-center text-ink-400">Выберите или создайте проект.</div>}
        <Projects projects={data.projects} onReview={setReviewId} onRemove={removeProject} />
      </div>
    </div>
  </section>;
}

function ProjectTree({ project, categories, selected, onSelect, onAddCategory, onRemove }: { project: AssignmentFolder; categories: AssignmentFolder[]; selected: string | null; onSelect: (id: string) => void; onAddCategory: (id: string) => void; onRemove: (id: string) => void }) {
  return <div className="mb-1"><div className={`group flex items-center rounded-lg ${selected === project.id ? "bg-brand-500/20 text-brand-200" : "text-ink-100 hover:bg-ink-700"}`}><button onClick={() => onSelect(project.id)} className="min-h-11 flex-1 truncate px-3 text-left text-sm font-bold">📁 {project.name}</button><button title="Добавить подтип" onClick={() => onAddCategory(project.id)} className="px-2 text-lg text-ink-400 opacity-0 group-hover:opacity-100">+</button><button title="Удалить проект" onClick={() => onRemove(project.id)} className="px-2 text-rose-400 opacity-0 group-hover:opacity-100">×</button></div>{categories.map((category) => <div key={category.id} className={`group ml-5 flex items-center rounded-lg ${selected === category.id ? "bg-brand-500/15 text-brand-200" : "text-ink-300 hover:bg-ink-700"}`}><button onClick={() => onSelect(category.id)} className="min-h-10 flex-1 truncate px-3 text-left text-sm">└ {category.name} <span className="text-ink-500">({category.tasks.length})</span></button><button title="Удалить подтип" onClick={() => onRemove(category.id)} className="px-2 text-rose-400 opacity-0 group-hover:opacity-100">×</button></div>)}</div>;
}

function ProjectOverview({ categories, onSelect }: { categories: AssignmentFolder[]; onSelect: (id: string) => void }) {
  return <div className="mt-5"><h3 className="font-bold text-white">Подтипы заданий</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{categories.map((category) => <button key={category.id} onClick={() => onSelect(category.id)} className="rounded-xl border border-ink-700 bg-ink-900/50 p-4 text-left hover:border-brand-500"><b className="text-white">{category.name}</b><p className="mt-1 text-sm text-ink-400">{category.tasks.length} заданий</p></button>)}{!categories.length && <p className="rounded-xl border border-dashed border-ink-600 p-6 text-sm text-ink-400 sm:col-span-2">Добавьте подпапку-подтип. Вложенность глубже одного уровня отключена.</p>}</div></div>;
}

function CategoryEditor({ folder, onChange }: { folder: AssignmentFolder; onChange: (x: AssignmentFolder) => void }) {
  const changeTask = (id: string, next: AssignmentTask) => onChange({ ...folder, tasks: folder.tasks.map((t) => t.id === id ? next : t) });
  return <div className="mt-6 border-t border-ink-700 pt-5"><div className="flex flex-wrap items-end gap-3"><div className="flex-1"><label className="label">Название подтипа</label><input className="input font-bold" value={folder.name} onChange={(e) => onChange({ ...folder, name: e.target.value })} /></div><button onClick={() => onChange({ ...folder, tasks: [...folder.tasks, blankTask()] })} className="btn-ghost">+ Задание</button></div><div className="mt-5 space-y-4">{folder.tasks.map((task, index) => <TaskEditor key={task.id} task={task} index={index} onChange={(next) => changeTask(task.id, next)} onRemove={() => { if (confirm(`Удалить задание «${task.title}»?`)) onChange({ ...folder, tasks: folder.tasks.filter((t) => t.id !== task.id) }); }} />)}{!folder.tasks.length && <p className="rounded-xl border border-dashed border-ink-600 p-8 text-center text-ink-400">В этом подтипе пока нет заданий.</p>}</div></div>;
}

function TaskEditor({ task, index, onChange, onRemove }: { task: AssignmentTask; index: number; onChange: (x: AssignmentTask) => void; onRemove: () => void }) {
  const set = <K extends keyof AssignmentTask>(key: K, value: AssignmentTask[K]) => onChange({ ...task, [key]: value });
  return <article className="rounded-xl border border-ink-700 bg-ink-900/60 p-5"><div className="flex justify-between"><b className="text-white">Задание {index + 1}</b><button onClick={onRemove} className="text-sm text-rose-400">Удалить</button></div><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_120px]"><input className="input" value={task.title} onChange={(e) => set("title", e.target.value)} placeholder="Название" /><input type="number" min="0" className="input" value={task.maxScore} onChange={(e) => set("maxScore", Number(e.target.value))} title="Максимум баллов" /></div><textarea className="input mt-3 min-h-28" value={task.statement} onChange={(e) => set("statement", e.target.value)} placeholder="Условие задания" /><div className="mt-3"><label className="label">Варианты ответа</label>{task.options.map((option, i) => <div key={i} className="mb-2 flex gap-2"><input className="input" value={option} onChange={(e) => set("options", task.options.map((x, j) => j === i ? e.target.value : x))} placeholder={`Вариант ${i + 1}`} /><button onClick={() => set("options", task.options.filter((_, j) => j !== i))} className="px-2 text-rose-400">×</button></div>)}<button onClick={() => set("options", [...task.options, ""])} className="text-sm font-semibold text-brand-300">+ Вариант</button></div><div className="mt-4 grid gap-3 sm:grid-cols-3"><Check text="Развернутый ответ" checked={task.allowExpandedAnswer} onChange={(v) => set("allowExpandedAnswer", v)} /><Check text="Можно рисовать" checked={task.allowDrawing} onChange={(v) => set("allowDrawing", v)} /><Check text="Нужен доп. анализ" checked={task.needsAnalysis} onChange={(v) => set("needsAnalysis", v)} /></div>{task.needsAnalysis && <textarea className="input mt-3 min-h-20" value={task.analysisNote} onChange={(e) => set("analysisNote", e.target.value)} placeholder="Скрытая заметка для автора" />}</article>;
}
function Check({ text, checked, onChange }: { text: string; checked: boolean; onChange: (x: boolean) => void }) { return <label className="flex items-center gap-2 rounded-lg border border-ink-700 p-3 text-sm text-ink-200"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{text}</label>; }

function Projects({ projects, onReview, onRemove }: { projects: AssignmentProject[]; onReview: (id: string) => void; onRemove: (id: string) => void }) {
  return <div className="rounded-2xl border border-ink-700 bg-ink-800/70 p-5"><h3 className="font-bold text-white">Ссылки и работы</h3><div className="mt-4 space-y-3">{projects.map((p) => <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-ink-700 p-4"><div><b className="text-white">{p.title}</b><p className="mt-1 text-xs text-ink-400">{p.categories?.length ?? p.folderIds.length} подтипов · {p.status === "published" ? "ожидает ученика" : p.status === "submitted" ? "нужно проверить" : p.status === "reviewed" ? `проверено · ${p.review?.total} баллов` : "черновик"}</p></div><div className="flex flex-wrap gap-2"><button onClick={() => navigator.clipboard.writeText(`${location.origin}/assignment/${p.slug}`)} className="btn-ghost">Постоянная ссылка</button>{p.submission && <button onClick={() => onReview(p.id)} className="btn-primary">{p.review ? "Открыть статистику" : "Проверить"}</button>}<button onClick={() => onRemove(p.id)} className="btn-ghost border-rose-500/50 text-rose-300">Удалить</button></div></div>)}{!projects.length && <p className="text-sm text-ink-400">Постоянных ссылок пока нет.</p>}</div></div>;
}

function ReviewPanel({ project, onBack, onDone }: { project: AssignmentProject; onBack: () => void; onDone: (p: AssignmentProject) => void }) {
  const initial = project.review?.items ?? project.tasks.map((t) => ({ taskId: t.id, score: 0, comment: "", annotation: "" }));
  const [items, setItems] = useState<TaskReview[]>(initial);
  const total = useMemo(() => items.reduce((sum, item) => sum + Number(item.score || 0), 0), [items]);
  const patch = (id: string, value: Partial<TaskReview>) => setItems((xs) => xs.map((x) => x.taskId === id ? { ...x, ...value } : x));
  async function finish() { const res = await fetch(`/api/admin/assignments/${project.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ review: { items, total, finishedAt: "" } }) }); const json = await res.json(); if (res.ok) onDone(json.project); }
  return <section><div className="mb-5 flex flex-wrap items-center justify-between gap-3"><button onClick={onBack} className="btn-ghost">← К проектам</button><div className="text-right"><b className="text-2xl text-white">{total} баллов</b><p className="text-xs text-ink-400">сумма обновляется автоматически</p></div></div><div className="grid gap-5 xl:grid-cols-[1fr_260px]"><div className="space-y-5">{project.tasks.map((task, i) => { const answer = project.submission!.answers.find((x) => x.taskId === task.id); const review = items.find((x) => x.taskId === task.id)!; return <article key={task.id} className="rounded-2xl border border-ink-700 bg-ink-800/70 p-5"><div className="flex justify-between gap-4"><div><span className="text-xs font-bold text-brand-300">{task.categoryName || "Подтип"} · задание {i + 1}</span><h3 className="font-bold text-white">{task.title}</h3></div><label className="text-right text-xs text-ink-400">Баллы<input type="number" min="0" max={task.maxScore} value={review.score} onChange={(e) => patch(task.id, { score: Math.min(task.maxScore, Number(e.target.value)) })} className="input mt-1 w-24 text-center text-lg font-bold" /></label></div><p className="mt-4 whitespace-pre-wrap text-ink-200">{task.statement}</p>{task.needsAnalysis && <p className="mt-3 rounded-lg border border-amber-700/40 bg-amber-900/20 p-3 text-sm text-amber-200">Скрытый анализ: {task.analysisNote || "требуется дополнительная проверка"}</p>}<div className="mt-4 rounded-lg bg-white p-4 text-slate-900">{answer?.selectedOption && <p><b>Выбор:</b> {answer.selectedOption}</p>}{answer?.text && <p className="mt-2 whitespace-pre-wrap">{answer.text}</p>}{answer?.drawing && <img src={answer.drawing} alt="Ответ рисунком" className="mt-3 w-full border" />}{!answer?.selectedOption && !answer?.text && !answer?.drawing && <p className="text-slate-400">Нет ответа</p>}</div><div className="mt-4"><p className="mb-2 text-sm font-bold text-red-400">Красные пометки преподавателя</p><DrawingCanvas value={review.annotation} background={answer?.drawing} onChange={(annotation) => patch(task.id, { annotation })} color="#dc2626" height={170} /></div><textarea className="input mt-3" value={review.comment} onChange={(e) => patch(task.id, { comment: e.target.value })} placeholder="Комментарий ученику" /></article>; })}</div><aside className="h-fit rounded-2xl border border-ink-700 bg-ink-800/90 p-5 xl:sticky xl:top-5"><p className="text-xs font-bold uppercase tracking-widest text-ink-400">Проверка</p><h3 className="mt-2 text-lg font-bold text-white">{project.submission!.studentName}</h3><p className="mt-1 text-sm text-ink-400">{project.title}</p><div className="my-5 border-t border-ink-700" /><p className="text-sm text-ink-300">Итого</p><p className="text-4xl font-bold text-white">{total}</p><button onClick={finish} className="btn-primary mt-5 w-full">Завершить</button>{project.review && <a target="_blank" href={`/assignment/${project.slug}/report`} className="btn-ghost mt-3 w-full">Статистика / PDF</a>}<p className="mt-3 text-xs leading-5 text-ink-400">Диаграмма будет содержать по одному столбцу на каждый подтип проекта.</p></aside></div></section>;
}
