import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";

// Загружаем только PNG и ограничиваем размер файла.
const MAX_BYTES = 5 * 1024 * 1024; // 5 МБ
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Сигнатура PNG: 89 50 4E 47 0D 0A 1A 0A — проверяем содержимое, а не только тип.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

export async function POST(request: Request) {
  if (!isAuthenticated()) {
    return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ ok: false, error: "Ожидались данные формы" }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ ok: false, error: "Файл не найден" }, { status: 400 });
  }
  if (file.type && file.type !== "image/png") {
    return NextResponse.json(
      { ok: false, error: "Можно загружать только изображения PNG." },
      { status: 415 }
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "Файл слишком большой — максимум 5 МБ." },
      { status: 413 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length < 8 || !buffer.subarray(0, 8).equals(PNG_SIGNATURE)) {
    return NextResponse.json(
      { ok: false, error: "Файл не похож на PNG." },
      { status: 415 }
    );
  }

  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.png`;

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
  } catch (err) {
    console.error("Upload write error:", err);
    return NextResponse.json(
      { ok: false, error: "Не удалось сохранить файл на сервере." },
      { status: 500 }
    );
  }

  // Публичный путь: файлы из public/ отдаются с корня сайта.
  return NextResponse.json({ ok: true, url: `/uploads/${name}` });
}
