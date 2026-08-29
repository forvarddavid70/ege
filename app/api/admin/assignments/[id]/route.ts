import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { updateProject, type AssignmentReview } from "@/lib/assignments";

export const runtime = "nodejs";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  if (!isAuthenticated()) return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  try {
    const body = await request.json() as { review: AssignmentReview };
    const items = Array.isArray(body.review?.items) ? body.review.items : [];
    const total = items.reduce((sum, item) => sum + Math.max(0, Number(item.score) || 0), 0);
    const review = { ...body.review, items, total, finishedAt: new Date().toISOString() };
    const project = await updateProject(params.id, (p) => ({ ...p, review, status: "reviewed" }));
    if (!project) return NextResponse.json({ ok: false, error: "Работа не найдена" }, { status: 404 });
    return NextResponse.json({ ok: true, project });
  } catch {
    return NextResponse.json({ ok: false, error: "Не удалось завершить проверку" }, { status: 400 });
  }
}
