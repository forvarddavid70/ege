import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { deleteLead, getLeads, updateLead } from "@/lib/store";
import type { LeadStatus } from "@/lib/types";

export const runtime = "nodejs";

const STATUSES: LeadStatus[] = ["new", "in_progress", "done"];

function isStatus(value: unknown): value is LeadStatus {
  return typeof value === "string" && (STATUSES as string[]).includes(value);
}

/** Список всех заявок (для админки). */
export async function GET() {
  if (!isAuthenticated()) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }
  const items = await getLeads();
  return NextResponse.json({ ok: true, items });
}

/** Изменение статуса заявки: { id, status }. */
export async function PATCH(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  let body: { id?: unknown; status?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "Не указан id заявки" }, { status: 400 });
  }
  if (!isStatus(body.status)) {
    return NextResponse.json({ ok: false, error: "Недопустимый статус" }, { status: 400 });
  }

  const updated = await updateLead(id, { status: body.status });
  if (!updated) {
    return NextResponse.json({ ok: false, error: "Заявка не найдена" }, { status: 404 });
  }
  return NextResponse.json({ ok: true, lead: updated });
}

/** Удаление заявки: { id }. */
export async function DELETE(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  let body: { id?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный JSON" }, { status: 400 });
  }

  const id = typeof body.id === "string" ? body.id : "";
  if (!id) {
    return NextResponse.json({ ok: false, error: "Не указан id заявки" }, { status: 400 });
  }

  const removed = await deleteLead(id);
  if (!removed) {
    return NextResponse.json({ ok: false, error: "Заявка не найдена" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
