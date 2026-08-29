import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";
import { isAuthenticated } from "@/lib/auth";

export const runtime = "nodejs";
const MAX_BYTES = 5 * 1024 * 1024;
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

function detectImage(buffer: Buffer): "png" | "jpg" | "webp" | null {
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "png";
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  if (buffer.length >= 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP") return "webp";
  return null;
}

export async function POST(request: Request) {
  if (!isAuthenticated()) return NextResponse.json({ ok: false, error: "Не авторизован" }, { status: 401 });
  let form: FormData;
  try { form = await request.formData(); }
  catch { return NextResponse.json({ ok: false, error: "Ожидались данные формы" }, { status: 400 }); }
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ ok: false, error: "Файл не найден" }, { status: 400 });
  if (file.size > MAX_BYTES) return NextResponse.json({ ok: false, error: "Файл слишком большой — максимум 5 МБ." }, { status: 413 });
  const buffer = Buffer.from(await file.arrayBuffer());
  const extension = detectImage(buffer);
  if (!extension) return NextResponse.json({ ok: false, error: "Поддерживаются изображения PNG, JPEG и WebP." }, { status: 415 });
  const name = `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}.${extension}`;
  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, name), buffer);
  } catch (error) {
    console.error("Upload write error:", error);
    return NextResponse.json({ ok: false, error: "Не удалось сохранить файл на сервере." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, url: `/uploads/${name}` });
}
