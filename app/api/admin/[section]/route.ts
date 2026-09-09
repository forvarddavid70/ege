import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSection, saveSection } from "@/lib/store";
import type { Course, EgeTask, MaterialItem, NewsItem, Review, Section } from "@/lib/types";

export const runtime = "nodejs";

const SECTIONS: Section[] = ["news", "courses", "ege", "reviews", "materials"];
const DIFFICULTIES = ["базовый", "повышенный", "высокий"] as const;

function str(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

/** Приводит рейтинг к целому числу в диапазоне 1..5. */
function clampRating(v: unknown): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return 5;
  return Math.min(5, Math.max(1, n));
}

function makeId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function normalize(
  section: Section,
  raw: unknown[]
): NewsItem[] | Course[] | EgeTask[] | Review[] | MaterialItem[] {
  if (section === "news") {
    return raw.map((r: any): NewsItem => ({
      id: str(r?.id) || makeId(),
      title: str(r?.title),
      date: str(r?.date) || new Date().toISOString().slice(0, 10),
      summary: str(r?.summary),
      body: str(r?.body),
      imageUrl: str(r?.imageUrl),
      youtubeUrl: str(r?.youtubeUrl),
    }));
  }
  if (section === "materials") {
    return raw.map((r: any): MaterialItem => ({
      id: str(r?.id) || makeId(),
      title: str(r?.title),
      summary: str(r?.summary),
      body: str(r?.body),
      youtubeUrl: str(r?.youtubeUrl),
      date: str(r?.date) || new Date().toISOString().slice(0, 10),
    }));
  }
  if (section === "courses") {
    return raw.map((r: any): Course => ({
      id: str(r?.id) || makeId(),
      title: str(r?.title),
      description: str(r?.description),
      audience: str(r?.audience),
      format: str(r?.format),
      price: str(r?.price),
    }));
  }
  if (section === "reviews") {
    return raw.map((r: any): Review => ({
      id: str(r?.id) || makeId(),
      name: str(r?.name),
      role: str(r?.role),
      rating: clampRating(r?.rating),
      text: str(r?.text),
      date: str(r?.date) || new Date().toISOString().slice(0, 10),
      result: str(r?.result),
      avatarUrl: str(r?.avatarUrl),
    }));
  }
  return raw.map((r: any): EgeTask => {
    const difficulty = DIFFICULTIES.includes(r?.difficulty) ? r.difficulty : "базовый";
    return {
      id: str(r?.id) || makeId(),
      number: str(r?.number),
      topic: str(r?.topic),
      difficulty,
      statement: str(r?.statement),
      solution: str(r?.solution),
      answer: str(r?.answer),
    };
  });
}

function isSection(value: string): value is Section {
  return (SECTIONS as string[]).includes(value);
}

export async function GET(_req: Request, { params }: { params: { section: string } }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }
  if (!isSection(params.section)) {
    return NextResponse.json({ ok: false, error: "Неизвестный раздел" }, { status: 404 });
  }
  const items = await getSection(params.section);
  return NextResponse.json({ ok: true, items });
}

export async function PUT(request: Request, { params }: { params: { section: string } }) {
  if (!isAuthenticated()) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }
  if (!isSection(params.section)) {
    return NextResponse.json({ ok: false, error: "Неизвестный раздел" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Некорректный JSON" }, { status: 400 });
  }

  const rawItems = Array.isArray(body) ? body : (body as any)?.items;
  if (!Array.isArray(rawItems)) {
    return NextResponse.json({ ok: false, error: "Ожидался массив items" }, { status: 400 });
  }

  const items = normalize(params.section, rawItems);
  await saveSection(params.section, items);
  return NextResponse.json({ ok: true, items });
}
