import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getAssignments, saveAssignments, type AssignmentStore } from "@/lib/assignments";

export const runtime = "nodejs";

export async function GET() {
  if (!isAuthenticated()) return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  return NextResponse.json({ ok: true, data: await getAssignments() });
}

export async function PUT(request: Request) {
  if (!isAuthenticated()) return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  try {
    const body = await request.json() as AssignmentStore;
    if (!Array.isArray(body.folders) || !Array.isArray(body.projects)) throw new Error();
    await saveAssignments(body);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректные данные" }, { status: 400 });
  }
}
