import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
// Файлы появляются в рантайме (их загружают в админке), поэтому ответ
// не должен кэшироваться на этапе сборки.
export const dynamic = "force-dynamic";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

// Имя файла, которое генерирует /api/admin/upload: <base36>-<hex>.png.
// Строгая проверка отсекает выход за пределы каталога (path traversal).
const NAME_RE = /^[a-z0-9]+-[a-f0-9]+\.png$/i;

/**
 * Отдаёт загруженную картинку из public/uploads.
 *
 * Зачем отдельный роут: в продакшене (`next start`) статику из public/
 * Next регистрирует при старте сервера, поэтому файлы, загруженные позже
 * через админку, не отдаются напрямую (404). Динамический роут читает файл
 * с диска на каждый запрос и решает эту проблему, сохраняя прежний
 * публичный путь `/uploads/<имя>`.
 */
export async function GET(_req: Request, { params }: { params: { name: string } }) {
  const name = params.name;
  if (!NAME_RE.test(name)) {
    return new NextResponse("Not found", { status: 404 });
  }

  const filePath = path.join(UPLOAD_DIR, name);
  // Дополнительная защита: итоговый путь обязан лежать внутри UPLOAD_DIR.
  if (path.dirname(filePath) !== UPLOAD_DIR) {
    return new NextResponse("Not found", { status: 404 });
  }

  let file: Buffer;
  try {
    file = await fs.readFile(filePath);
  } catch {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(file), {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      // Имена уникальны (timestamp + случайные байты), поэтому кэшируем надолго.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
