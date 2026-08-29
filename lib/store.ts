import { promises as fs } from "fs";
import path from "path";
import type {
  Course,
  EgeTask,
  Lead,
  MaterialItem,
  NewsItem,
  Review,
  Section,
  Settings,
} from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

// Приоритет отдаётся *.local.json (правки из админки), затем — исходному сид-файлу.
async function readJson<T>(name: string, fallback: T): Promise<T> {
  const localPath = path.join(DATA_DIR, `${name}.local.json`);
  const seedPath = path.join(DATA_DIR, `${name}.json`);
  for (const p of [localPath, seedPath]) {
    try {
      const raw = await fs.readFile(p, "utf8");
      return JSON.parse(raw) as T;
    } catch {
      // пробуем следующий источник
    }
  }
  return fallback;
}

async function writeJson<T>(name: string, value: T): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const localPath = path.join(DATA_DIR, `${name}.local.json`);
  await fs.writeFile(localPath, JSON.stringify(value, null, 2), "utf8");
}

export async function getSettings(): Promise<Settings> {
  // Мержим с дефолтами, чтобы старые local-файлы без новых полей не ломали сайт.
  const saved = await readJson<Partial<Settings>>("settings", {});
  return { ...DEFAULT_SETTINGS, ...saved };
}

export async function saveSettings(value: Settings): Promise<void> {
  await writeJson("settings", value);
}

export async function getNews(): Promise<NewsItem[]> {
  const items = await readJson<NewsItem[]>("news", []);
  return [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getCourses(): Promise<Course[]> {
  return readJson<Course[]>("courses", []);
}

export async function getEge(): Promise<EgeTask[]> {
  return readJson<EgeTask[]>("ege", []);
}

export async function getReviews(): Promise<Review[]> {
  const items = await readJson<Review[]>("reviews", []);
  // Свежие отзывы — выше.
  return [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getMaterials(): Promise<MaterialItem[]> {
  const items = await readJson<MaterialItem[]>("materials", []);
  // Свежие материалы — выше.
  return [...items].sort((a, b) => (a.date < b.date ? 1 : -1));
}

/* ────────────────────────── Заявки (лиды) ────────────────────────── */

// Заявки хранятся только в *.local.json и не попадают в git (см. .gitignore),
// поэтому персональные данные клиентов не оказываются в репозитории.
export async function getLeads(): Promise<Lead[]> {
  const items = await readJson<Lead[]>("leads", []);
  // Свежие заявки — выше.
  return [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function saveLeads(items: Lead[]): Promise<void> {
  await writeJson("leads", items);
}

/** Добавляет новую заявку в начало списка и возвращает сохранённую запись. */
export async function addLead(lead: Lead): Promise<Lead> {
  const items = await readJson<Lead[]>("leads", []);
  items.unshift(lead);
  await writeJson("leads", items);
  return lead;
}

/** Обновляет поля заявки по id. Возвращает обновлённую запись или null, если не найдена. */
export async function updateLead(
  id: string,
  patch: Partial<Lead>
): Promise<Lead | null> {
  const items = await readJson<Lead[]>("leads", []);
  const idx = items.findIndex((l) => l.id === id);
  if (idx === -1) return null;
  items[idx] = { ...items[idx], ...patch, id: items[idx].id };
  await writeJson("leads", items);
  return items[idx];
}

/** Удаляет заявку по id. Возвращает true, если запись была найдена и удалена. */
export async function deleteLead(id: string): Promise<boolean> {
  const items = await readJson<Lead[]>("leads", []);
  const next = items.filter((l) => l.id !== id);
  if (next.length === items.length) return false;
  await writeJson("leads", next);
  return true;
}

export async function getSection(section: Section) {
  if (section === "news") return getNews();
  if (section === "courses") return getCourses();
  if (section === "reviews") return getReviews();
  if (section === "materials") return getMaterials();
  return getEge();
}

export async function saveSection(
  section: Section,
  value: NewsItem[] | Course[] | EgeTask[] | Review[] | MaterialItem[]
): Promise<void> {
  await writeJson(section, value);
}

export const DEFAULT_SETTINGS: Settings = {
  tutorName: "Никита Понасенков",
  brandName: "ЕГЭ Father",
  avatarUrl: "/tutor.jpg",
  aboutImages: [],
  headline: "Химия на 90+ баллов с «ЕГЭ Father»",
  subheadline:
    "Никита Понасенков — репетитор по химии и эксперт ЕГЭ. Разбираю сложное простыми словами, довожу до высокого балла и держу мотивацию весь год.",
  heroQuote: "Скажешь спасибо через полгода",
  about:
    "Меня зовут Никита Понасенков, я преподаю химию и готовлю к ЕГЭ. За годы практики выработал систему, которая работает даже с теми, кто «не понимает химию»: сначала наводим порядок в базе, затем отрабатываем каждый тип задания по кодификатору ФИПИ, а после — решаем пробники и разбираем ошибки. Веду Telegram-канал с разборами, лайфхаками и поддержкой — там же публикую бесплатные материалы.",
  telegramUsername: "your_telegram",
  telegramBotUsername: "",
  telegramChannel: "",
  telegramPrefill:
    "Здравствуйте, Никита! Хочу записаться на занятия по химии. Расскажите, пожалуйста, о свободных местах.",
  email: "hello@example.com",
  phone: "+7 (900) 000-00-00",
  experienceYears: "8+",
  studentsCount: "500+",
  avgScore: "88",
  siteUrl: "",
  yandexMetrikaId: "",
  googleTagManagerId: "",
  googleSiteVerification: "",
};
