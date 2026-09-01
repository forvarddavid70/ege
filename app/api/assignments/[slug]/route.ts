import { NextResponse } from "next/server";
import { getProjectBySlug, updateProject, type AssignmentSubmission } from "@/lib/assignments";

export const runtime = "nodejs";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project || project.status === "draft") return NextResponse.json({ ok: false, error: "Тест не найден" }, { status: 404 });
  const safe = { ...project, tasks: project.tasks.map(({ analysisNote, needsAnalysis, ...task }) => task) };
  return NextResponse.json({ ok: true, project: safe });
}

export async function POST(request: Request, { params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project || project.status === "draft") return NextResponse.json({ ok: false, error: "Тест не найден" }, { status: 404 });
  if (project.submission) return NextResponse.json({ ok: false, error: "Работа уже отправлена" }, { status: 409 });
  try {
    const body = await request.json() as AssignmentSubmission;
    if (!body.studentName?.trim() || !Array.isArray(body.answers)) throw new Error();
    const submission = { ...body, studentName: body.studentName.trim(), submittedAt: new Date().toISOString() };
    const updated = await updateProject(project.id, (p) => ({ ...p, submission, status: "submitted" }));
    const token = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    if (token && chatId) {
      const rawSite = process.env.NEXT_PUBLIC_SITE_URL || "";
      const site = rawSite.endsWith("/") ? rawSite.slice(0, -1) : rawSite;
      const answered = submission.answers.filter((answer) => answer.selectedOption || answer.text?.trim() || answer.drawing).length;
      const text = [
        "📝 Ученик завершил тест",
        `Проект: ${project.title}`,
        `Ученик: ${submission.studentName}`,
        submission.studentContact ? `Контакт: ${submission.studentContact}` : "",
        `Заполнено заданий: ${answered} из ${project.tasks.length}`,
        site
          ? `Открыть пройденный тест и проверить: ${site}/enter?review=${project.id}`
          : `Откройте в админке: /enter?review=${project.id}`,
        site ? `Вариант ученика: ${site}/assignment/${project.slug}` : "",
      ].filter(Boolean).join("\n");
      await fetch("https:" + "//api.telegram.org/bot" + token + "/sendMessage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }) }).catch(() => null);
    }
    return NextResponse.json({ ok: true, project: updated });
  } catch {
    return NextResponse.json({ ok: false, error: "Заполните имя и ответы" }, { status: 400 });
  }
}
