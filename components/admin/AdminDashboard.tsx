"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import AssignmentManager from "@/components/admin/AssignmentManager";
import type { AssignmentStore } from "@/lib/assignments";
import { formatDateTime } from "@/lib/format";
import type {
  Course,
  EgeTask,
  Lead,
  LeadStatus,
  MaterialItem,
  NewsItem,
  Review,
  Section,
  Settings,
} from "@/lib/types";

type Tab = "settings" | "leads" | "assignments" | Section;

const TABS: { key: Tab; label: string }[] = [
  { key: "settings", label: "Настройки" },
  { key: "leads", label: "Заявки" },
  { key: "assignments", label: "Выдача заданий" },
  { key: "news", label: "Блог / новости" },
  { key: "materials", label: "Материалы" },
  { key: "courses", label: "Курсы" },
  { key: "ege", label: "Задания ЕГЭ" },
  { key: "reviews", label: "Отзывы" },
];

function newId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

async function save(url: string, body: unknown): Promise<string | null> {
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) return data.error || "Ошибка сохранения";
    return null;
  } catch {
    return "Сетевая ошибка";
  }
}

function Status({ state }: { state: "idle" | "saving" | "saved" | "error"; }) {
  if (state === "saving") return <span className="text-sm text-ink-300">Сохраняем…</span>;
  if (state === "saved") return <span className="text-sm text-emerald-400">Сохранено ✓</span>;
  if (state === "error") return <span className="text-sm text-rose-400">Ошибка при сохранении</span>;
  return null;
}

export default function AdminDashboard({
  initialSettings,
  initialNews,
  initialCourses,
  initialEge,
  initialReviews,
  initialMaterials,
  initialLeads,
  initialAssignments,
  initialAssignmentReviewId,
  initialTab,
}: {
  initialSettings: Settings;
  initialNews: NewsItem[];
  initialCourses: Course[];
  initialEge: EgeTask[];
  initialReviews: Review[];
  initialMaterials: MaterialItem[];
  initialLeads: Lead[];
  initialAssignments: AssignmentStore;
  initialAssignmentReviewId?: string;
  initialTab?: Tab;
}) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>(initialTab ?? "settings");

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-ink-700 bg-ink-900">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-white">Панель управления «ЕГЭ Father»</h1>
            <p className="text-xs text-ink-400">Скрытый раздел /enter — не индексируется</p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="btn-ghost">Открыть сайт</a>
            <button onClick={logout} className="btn-ghost">Выйти</button>
          </div>
        </div>
        <nav className="mx-auto flex w-full max-w-5xl gap-1 overflow-x-auto px-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`whitespace-nowrap rounded-t-lg px-4 py-2 text-sm font-medium transition ${
                tab === t.key ? "bg-ink-950 text-brand-300" : "text-ink-400 hover:text-ink-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        {tab === "settings" && <SettingsEditor initial={initialSettings} />}
        {tab === "leads" && <LeadsEditor initial={initialLeads} />}
        {tab === "assignments" && <AssignmentManager initial={initialAssignments} initialReviewId={initialAssignmentReviewId} />}
        {tab === "news" && <NewsEditor initial={initialNews} />}
        {tab === "materials" && <MaterialsEditor initial={initialMaterials} />}
        {tab === "courses" && <CoursesEditor initial={initialCourses} />}
        {tab === "ege" && <EgeEditor initial={initialEge} />}
        {tab === "reviews" && <ReviewsEditor initial={initialReviews} />}
      </main>
    </div>
  );
}

/* ────────────────────────── Настройки ────────────────────────── */

function SettingsEditor({ initial }: { initial: Settings }) {
  const [form, setForm] = useState<Settings>({ ...initial, aboutImages: initial.aboutImages ?? [] });
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function addAboutImage(url: string) {
    setForm((f) => ({ ...f, aboutImages: [...f.aboutImages, url].slice(0, 8) }));
  }
  function removeAboutImage(idx: number) {
    setForm((f) => ({ ...f, aboutImages: f.aboutImages.filter((_, i) => i !== idx) }));
  }

  async function onSave() {
    setState("saving");
    const err = await save("/api/admin/settings", form);
    setState(err ? "error" : "saved");
  }

  const textFields: { key: keyof Settings; label: string; area?: boolean }[] = [
    { key: "tutorName", label: "Имя репетитора" },
    { key: "brandName", label: "Бренд (например «ЕГЭ Father»)" },
    { key: "headline", label: "Заголовок на главном экране" },
    { key: "subheadline", label: "Подзаголовок", area: true },
    { key: "heroQuote", label: "Слоган (например «Скажешь спасибо через полгода»)" },
    { key: "about", label: "Обо мне (текст раздела «Обо мне»)", area: true },
    { key: "telegramUsername", label: "Telegram-логин для связи (без @)" },
    { key: "telegramChannel", label: "Telegram-канал (без @, необязательно)" },
    { key: "telegramBotUsername", label: "Telegram-бот (без @, необязательно)" },
    { key: "telegramPrefill", label: "Текст сообщения по умолчанию", area: true },
    { key: "email", label: "E-mail" },
    { key: "phone", label: "Телефон" },
    { key: "experienceYears", label: "Опыт (лет)" },
    { key: "studentsCount", label: "Количество учеников" },
    { key: "avgScore", label: "Средний балл ЕГЭ" },
    { key: "siteUrl", label: "Адрес сайта для SEO (напр. https://example.ru)" },
    { key: "yandexMetrikaId", label: "Яндекс.Метрика — номер счётчика (необязательно)" },
    { key: "googleTagManagerId", label: "Google Tag Manager — ID контейнера, напр. GTM-XXXX (необязательно)" },
    { key: "googleSiteVerification", label: "Google Search Console — токен подтверждения (google-site-verification, необязательно)" },
  ];

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-ink-700 bg-ink-800/70 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-semibold text-white">Общие настройки и контакты</h2>
          <div className="flex items-center gap-3">
            <Status state={state} />
            <button onClick={onSave} className="btn-primary">Сохранить</button>
          </div>
        </div>

        {/* Аватар репетитора: загрузка PNG-файла + запасное поле URL. */}
        <div className="mb-6 rounded-xl border border-ink-700 bg-ink-900/40 p-4">
          <label className="label">Фото/аватар репетитора</label>
          <div className="flex flex-wrap items-center gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-ink-600 bg-ink-800">
              {form.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={form.avatarUrl} alt="Превью аватара" className="h-full w-full object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-xs text-ink-400">нет фото</span>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <ImageUploader onUploaded={(url) => set("avatarUrl", url)} label="Загрузить PNG" />
              {form.avatarUrl && (
                <button
                  type="button"
                  onClick={() => set("avatarUrl", "")}
                  className="text-left text-sm font-medium text-rose-400 hover:text-rose-300"
                >
                  Убрать фото
                </button>
              )}
            </div>
          </div>
          <div className="mt-3">
            <label className="label text-xs text-ink-400">…или укажите путь/URL вручную (необязательно)</label>
            <input
              className="input"
              value={form.avatarUrl}
              onChange={(e) => set("avatarUrl", e.target.value)}
              placeholder="/tutor.jpg или https://…"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {textFields.map((f) => (
            <div key={String(f.key)} className={f.area ? "sm:col-span-2" : ""}>
              <label className="label">{f.label}</label>
              {f.area ? (
                <textarea
                  className="input min-h-[80px]"
                  value={form[f.key] as string}
                  onChange={(e) => set(f.key, e.target.value as Settings[typeof f.key])}
                />
              ) : (
                <input
                  className="input"
                  value={form[f.key] as string}
                  onChange={(e) => set(f.key, e.target.value as Settings[typeof f.key])}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Галерея раздела «О себе»: загрузка PNG-файлов (рекомендуемый размер 800×600). */}
      <div className="rounded-2xl border border-ink-700 bg-ink-800/70 p-6">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-semibold text-white">Изображения раздела «О себе»</h2>
          <ImageUploader onUploaded={addAboutImage} label="+ Добавить PNG" />
        </div>
        <p className="mb-4 text-sm text-ink-400">
          Загрузите изображения в формате PNG. Рекомендуемый размер — 800×600 px (соотношение 4:3),
          до 8 штук. Отображаются в разделе «Обо мне».
        </p>
        {form.aboutImages.length === 0 ? (
          <p className="rounded-xl border border-dashed border-ink-600 bg-ink-800/50 p-6 text-center text-sm text-ink-300">
            Пока нет изображений — нажмите «Добавить PNG».
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {form.aboutImages.map((url, idx) => (
              <div key={`${url}-${idx}`} className="overflow-hidden rounded-xl border border-ink-700 bg-ink-900/40">
                <div className="aspect-[4/3] w-full bg-ink-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Изображение ${idx + 1}`} className="h-full w-full object-cover" />
                </div>
                <div className="flex justify-end p-2">
                  <button
                    type="button"
                    onClick={() => removeAboutImage(idx)}
                    className="text-sm font-medium text-rose-400 hover:text-rose-300"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-3">
          <Status state={state} />
          <button onClick={onSave} className="btn-primary">Сохранить</button>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────── Заявки ────────────────────────── */

const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: "Новая",
  in_progress: "В работе",
  done: "Обработана",
};

const LEAD_STATUS_BADGE: Record<LeadStatus, string> = {
  new: "border-brand-500/40 bg-brand-500/15 text-brand-200",
  in_progress: "border-amber-500/40 bg-amber-500/15 text-amber-200",
  done: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
};

const LEAD_STATUSES: LeadStatus[] = ["new", "in_progress", "done"];

function telegramHandleHref(value: string): string {
  const clean = value.replace(/^@/, "").trim();
  return "https://t.me/" + clean;
}

function LeadsEditor({ initial }: { initial: Lead[] }) {
  const [items, setItems] = useState<Lead[]>(initial);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");

  async function changeStatus(id: string, status: LeadStatus) {
    setBusyId(id);
    setError(null);
    const prev = items;
    setItems((arr) => arr.map((l) => (l.id === id ? { ...l, status } : l)));
    try {
      const res = await fetch("/api/admin/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) {
        setItems(prev);
        setError(data.error || "Не удалось обновить статус");
      }
    } catch {
      setItems(prev);
      setError("Сетевая ошибка");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("Удалить заявку? Действие необратимо.")) return;
    setBusyId(id);
    setError(null);
    const prev = items;
    setItems((arr) => arr.filter((l) => l.id !== id));
    try {
      const res = await fetch("/api/admin/leads", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      const data = await res.json().catch(() => ({ ok: false }));
      if (!res.ok || !data.ok) {
        setItems(prev);
        setError(data.error || "Не удалось удалить заявку");
      }
    } catch {
      setItems(prev);
      setError("Сетевая ошибка");
    } finally {
      setBusyId(null);
    }
  }

  const counts = {
    all: items.length,
    new: items.filter((l) => l.status === "new").length,
    in_progress: items.filter((l) => l.status === "in_progress").length,
    done: items.filter((l) => l.status === "done").length,
  };
  const visible = filter === "all" ? items : items.filter((l) => l.status === filter);

  const filters: { key: "all" | LeadStatus; label: string }[] = [
    { key: "all", label: `Все (${counts.all})` },
    { key: "new", label: `Новые (${counts.new})` },
    { key: "in_progress", label: `В работе (${counts.in_progress})` },
    { key: "done", label: `Обработаны (${counts.done})` },
  ];

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-white">Заявки с сайта</h2>
          <p className="text-sm text-ink-400">
            Заявки из формы «Оставить заявку». Обновляются после перезагрузки страницы.
          </p>
        </div>
        {error && <span className="text-sm text-rose-400">{error}</span>}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              filter === f.key
                ? "border-brand-500/50 bg-brand-500/15 text-brand-200"
                : "border-ink-700 text-ink-300 hover:text-ink-100"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Empty
          text={
            items.length === 0
              ? "Заявок пока нет. Как только клиент отправит форму — она появится здесь."
              : "В этом статусе заявок нет."
          }
        />
      ) : (
        <div className="space-y-4">
          {visible.map((lead) => (
            <div key={lead.id} className="rounded-2xl border border-ink-700 bg-ink-800/70 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-white">{lead.name || "Без имени"}</h3>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-medium ${LEAD_STATUS_BADGE[lead.status]}`}
                    >
                      {LEAD_STATUS_LABELS[lead.status]}
                    </span>
                    {lead.autoReplied && (
                      <span className="rounded-full border border-ink-600 px-2 py-0.5 text-xs text-ink-300">
                        ✓ автоответ отправлен
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink-400">{formatDateTime(lead.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    className="input h-9 w-auto py-1"
                    value={lead.status}
                    disabled={busyId === lead.id}
                    onChange={(e) => changeStatus(lead.id, e.target.value as LeadStatus)}
                  >
                    {LEAD_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {LEAD_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => remove(lead.id)}
                    disabled={busyId === lead.id}
                    className="text-sm font-medium text-rose-400 hover:text-rose-300 disabled:opacity-50"
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                {lead.phone && (
                  <ContactRow label="Телефон">
                    <a className="text-brand-300 hover:text-brand-200" href={`tel:${lead.phone}`}>
                      {lead.phone}
                    </a>
                  </ContactRow>
                )}
                {lead.email && (
                  <ContactRow label="E-mail">
                    <a className="text-brand-300 hover:text-brand-200" href={`mailto:${lead.email}`}>
                      {lead.email}
                    </a>
                  </ContactRow>
                )}
                {lead.telegram && (
                  <ContactRow label="Telegram">
                    <a
                      className="text-brand-300 hover:text-brand-200"
                      href={telegramHandleHref(lead.telegram)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {lead.telegram}
                    </a>
                  </ContactRow>
                )}
                {lead.vk && (
                  <ContactRow label="ВКонтакте">
                    {/^https?:\/\//.test(lead.vk) ? (
                      <a
                        className="text-brand-300 hover:text-brand-200"
                        href={lead.vk}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {lead.vk}
                      </a>
                    ) : (
                      <span className="text-ink-100">{lead.vk}</span>
                    )}
                  </ContactRow>
                )}
              </dl>

              {lead.message && (
                <div className="mt-3 rounded-xl border border-ink-700 bg-ink-900/40 p-3 text-sm text-ink-200">
                  <p className="whitespace-pre-wrap">{lead.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function ContactRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-ink-400">{label}:</dt>
      <dd className="break-all">{children}</dd>
    </div>
  );
}

/* ────────────────────────── Новости ────────────────────────── */

function NewsEditor({ initial }: { initial: NewsItem[] }) {
  const [items, setItems] = useState<NewsItem[]>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update(id: string, patch: Partial<NewsItem>) {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function add() {
    setItems((arr) => [
      { id: newId(), title: "", date: new Date().toISOString().slice(0, 10), summary: "", body: "", imageUrl: "", youtubeUrl: "" },
      ...arr,
    ]);
  }
  function remove(id: string) {
    setItems((arr) => arr.filter((i) => i.id !== id));
  }
  async function onSave() {
    setState("saving");
    const err = await save("/api/admin/news", { items });
    setState(err ? "error" : "saved");
  }

  return (
    <EditorShell title="Блог / новости" onAdd={add} addLabel="Добавить запись" onSave={onSave} state={state}>
      <p className="rounded-xl border border-ink-700 bg-ink-900/40 p-4 text-sm text-ink-300">
        Карточка открывает материал целиком. Добавьте обложку или ссылку на YouTube: для ролика сайт автоматически покажет превью и встроит плеер в полной записи.
      </p>
      {items.map((n) => (
        <ItemCard key={n.id} onRemove={() => remove(n.id)}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="label">Заголовок</label>
              <input className="input" value={n.title} onChange={(e) => update(n.id, { title: e.target.value })} />
            </div>
            <div>
              <label className="label">Дата</label>
              <input type="date" className="input" value={n.date} onChange={(e) => update(n.id, { date: e.target.value })} />
            </div>
          </div>
          <div className="mt-3">
            <label className="label">Ссылка на видео YouTube (необязательно)</label>
            <input
              className="input"
              value={n.youtubeUrl ?? ""}
              onChange={(e) => update(n.id, { youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=… или https://youtu.be/…"
            />
          </div>
          <div className="mt-3 rounded-xl border border-ink-700 bg-ink-900/40 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <label className="label mb-0">Обложка записи (необязательно)</label>
                <p className="mt-1 text-xs text-ink-400">PNG, JPEG или WebP до 5 МБ. Для YouTube приоритет у превью ролика.</p>
              </div>
              <ImageUploader label={n.imageUrl ? "Заменить картинку" : "Загрузить картинку"} onUploaded={(url) => update(n.id, { imageUrl: url })} />
            </div>
            {n.imageUrl && (
              <div className="mt-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={n.imageUrl} alt="Предпросмотр обложки" className="max-h-64 w-full rounded-lg border border-ink-600 object-contain" />
                <button type="button" onClick={() => update(n.id, { imageUrl: "" })} className="mt-2 text-sm font-medium text-rose-400 hover:text-rose-300">Удалить картинку</button>
              </div>
            )}
          </div>
          <div className="mt-3">
            <label className="label">Короткая информация (видна на карточке)</label>
            <textarea className="input min-h-[60px]" value={n.summary ?? ""} onChange={(e) => update(n.id, { summary: e.target.value })} />
          </div>
          <div className="mt-3">
            <label className="label">Полный текст (открывается по клику)</label>
            <textarea className="input min-h-[90px]" value={n.body} onChange={(e) => update(n.id, { body: e.target.value })} />
          </div>
        </ItemCard>
      ))}
      {items.length === 0 && <Empty text="Записей пока нет — добавьте первую." />}
    </EditorShell>
  );
}

/* ────────────────────────── Материалы для клиентов ────────────────────────── */

function MaterialsEditor({ initial }: { initial: MaterialItem[] }) {
  const [items, setItems] = useState<MaterialItem[]>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update(id: string, patch: Partial<MaterialItem>) {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function add() {
    setItems((arr) => [
      {
        id: newId(),
        title: "",
        summary: "",
        body: "",
        youtubeUrl: "",
        date: new Date().toISOString().slice(0, 10),
      },
      ...arr,
    ]);
  }
  function remove(id: string) {
    setItems((arr) => arr.filter((i) => i.id !== id));
  }
  async function onSave() {
    setState("saving");
    const err = await save("/api/admin/materials", { items });
    setState(err ? "error" : "saved");
  }

  return (
    <EditorShell title="Материалы для клиентов" onAdd={add} addLabel="Добавить материал" onSave={onSave} state={state}>
      <p className="rounded-xl border border-ink-700 bg-ink-900/40 p-4 text-sm text-ink-300">
        Эти материалы показываются на сайте в разделе «Посты и видео от автора» (перед формой заявки).
        Клиент видит карточку с названием и короткой информацией, а по клику открывается оверлей
        с полным текстом и видео. Если указать ссылку на YouTube — в карточке появится обложка ролика,
        а в оверлее — встроенный плеер. Без ссылки материал оформляется как пост.
      </p>
      {items.map((m) => (
        <ItemCard key={m.id} onRemove={() => remove(m.id)}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="label">Название</label>
              <input className="input" value={m.title} onChange={(e) => update(m.id, { title: e.target.value })} />
            </div>
            <div>
              <label className="label">Дата</label>
              <input type="date" className="input" value={m.date} onChange={(e) => update(m.id, { date: e.target.value })} />
            </div>
          </div>
          <div className="mt-3">
            <label className="label">Ссылка на видео YouTube (необязательно)</label>
            <input
              className="input"
              value={m.youtubeUrl}
              onChange={(e) => update(m.id, { youtubeUrl: e.target.value })}
              placeholder="https://www.youtube.com/watch?v=… или https://youtu.be/…"
            />
          </div>
          <div className="mt-3">
            <label className="label">Короткая информация (видна на карточке)</label>
            <textarea className="input min-h-[60px]" value={m.summary} onChange={(e) => update(m.id, { summary: e.target.value })} />
          </div>
          <div className="mt-3">
            <label className="label">Полный текст (открывается в оверлее)</label>
            <textarea className="input min-h-[140px]" value={m.body} onChange={(e) => update(m.id, { body: e.target.value })} />
          </div>
        </ItemCard>
      ))}
      {items.length === 0 && <Empty text="Материалов пока нет — добавьте первый." />}
    </EditorShell>
  );
}

/* ────────────────────────── Курсы ────────────────────────── */

function CoursesEditor({ initial }: { initial: Course[] }) {
  const [items, setItems] = useState<Course[]>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update(id: string, patch: Partial<Course>) {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function add() {
    setItems((arr) => [
      ...arr,
      { id: newId(), title: "", description: "", audience: "", format: "", price: "" },
    ]);
  }
  function remove(id: string) {
    setItems((arr) => arr.filter((i) => i.id !== id));
  }
  async function onSave() {
    setState("saving");
    const err = await save("/api/admin/courses", { items });
    setState(err ? "error" : "saved");
  }

  return (
    <EditorShell title="Курсы" onAdd={add} addLabel="Добавить курс" onSave={onSave} state={state}>
      {items.map((c) => (
        <ItemCard key={c.id} onRemove={() => remove(c.id)}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Название</label>
              <input className="input" value={c.title} onChange={(e) => update(c.id, { title: e.target.value })} />
            </div>
            <div>
              <label className="label">Для кого</label>
              <input className="input" value={c.audience} onChange={(e) => update(c.id, { audience: e.target.value })} />
            </div>
            <div>
              <label className="label">Формат</label>
              <input className="input" value={c.format} onChange={(e) => update(c.id, { format: e.target.value })} />
            </div>
            <div>
              <label className="label">Стоимость</label>
              <input className="input" value={c.price} onChange={(e) => update(c.id, { price: e.target.value })} />
            </div>
          </div>
          <div className="mt-3">
            <label className="label">Описание</label>
            <textarea className="input min-h-[80px]" value={c.description} onChange={(e) => update(c.id, { description: e.target.value })} />
          </div>
        </ItemCard>
      ))}
      {items.length === 0 && <Empty text="Курсов пока нет — добавьте первый." />}
    </EditorShell>
  );
}

/* ────────────────────────── Задания ЕГЭ ────────────────────────── */

function EgeEditor({ initial }: { initial: EgeTask[] }) {
  const [items, setItems] = useState<EgeTask[]>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update(id: string, patch: Partial<EgeTask>) {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function add() {
    setItems((arr) => [
      ...arr,
      { id: newId(), number: "", topic: "", difficulty: "базовый", statement: "", solution: "", answer: "" },
    ]);
  }
  function remove(id: string) {
    setItems((arr) => arr.filter((i) => i.id !== id));
  }
  async function onSave() {
    setState("saving");
    const err = await save("/api/admin/ege", { items });
    setState(err ? "error" : "saved");
  }

  return (
    <EditorShell title="Задания ЕГЭ" onAdd={add} addLabel="Добавить задание" onSave={onSave} state={state}>
      {items.map((t) => (
        <ItemCard key={t.id} onRemove={() => remove(t.id)}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Номер задания</label>
              <input className="input" value={t.number} onChange={(e) => update(t.id, { number: e.target.value })} />
            </div>
            <div>
              <label className="label">Тема</label>
              <input className="input" value={t.topic} onChange={(e) => update(t.id, { topic: e.target.value })} />
            </div>
            <div>
              <label className="label">Сложность</label>
              <select
                className="input"
                value={t.difficulty}
                onChange={(e) => update(t.id, { difficulty: e.target.value as EgeTask["difficulty"] })}
              >
                <option value="базовый">базовый</option>
                <option value="повышенный">повышенный</option>
                <option value="высокий">высокий</option>
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="label">Условие</label>
            <textarea className="input min-h-[70px]" value={t.statement} onChange={(e) => update(t.id, { statement: e.target.value })} />
          </div>
          <div className="mt-3">
            <label className="label">Решение</label>
            <textarea className="input min-h-[70px]" value={t.solution} onChange={(e) => update(t.id, { solution: e.target.value })} />
          </div>
          <div className="mt-3">
            <label className="label">Ответ</label>
            <input className="input" value={t.answer} onChange={(e) => update(t.id, { answer: e.target.value })} />
          </div>
        </ItemCard>
      ))}
      {items.length === 0 && <Empty text="Заданий пока нет — добавьте первое." />}
    </EditorShell>
  );
}

/* ────────────────────────── Отзывы ────────────────────────── */

function ReviewsEditor({ initial }: { initial: Review[] }) {
  const [items, setItems] = useState<Review[]>(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  function update(id: string, patch: Partial<Review>) {
    setItems((arr) => arr.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }
  function add() {
    setItems((arr) => [
      {
        id: newId(),
        name: "",
        role: "",
        rating: 5,
        text: "",
        date: new Date().toISOString().slice(0, 10),
        result: "",
        avatarUrl: "",
      },
      ...arr,
    ]);
  }
  function remove(id: string) {
    setItems((arr) => arr.filter((i) => i.id !== id));
  }
  async function onSave() {
    setState("saving");
    const err = await save("/api/admin/reviews", { items });
    setState(err ? "error" : "saved");
  }

  return (
    <EditorShell title="Отзывы" onAdd={add} addLabel="Добавить отзыв" onSave={onSave} state={state}>
      {items.map((r) => (
        <ItemCard key={r.id} onRemove={() => remove(r.id)}>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Имя автора</label>
              <input className="input" value={r.name} onChange={(e) => update(r.id, { name: e.target.value })} />
            </div>
            <div>
              <label className="label">Кто это (напр. «11 класс, ЕГЭ»)</label>
              <input className="input" value={r.role} onChange={(e) => update(r.id, { role: e.target.value })} />
            </div>
            <div>
              <label className="label">Оценка</label>
              <select
                className="input"
                value={r.rating}
                onChange={(e) => update(r.id, { rating: Number(e.target.value) })}
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {"★".repeat(n)}{"☆".repeat(5 - n)} — {n}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <label className="label">Дата</label>
              <input type="date" className="input" value={r.date} onChange={(e) => update(r.id, { date: e.target.value })} />
            </div>
            <div>
              <label className="label">Результат-бейдж (напр. «ЕГЭ 94 балла»)</label>
              <input className="input" value={r.result} onChange={(e) => update(r.id, { result: e.target.value })} />
            </div>
            <div>
              <label className="label">Фото автора (URL, необязательно)</label>
              <input className="input" value={r.avatarUrl} onChange={(e) => update(r.id, { avatarUrl: e.target.value })} />
            </div>
          </div>
          <div className="mt-3">
            <label className="label">Текст отзыва</label>
            <textarea className="input min-h-[100px]" value={r.text} onChange={(e) => update(r.id, { text: e.target.value })} />
          </div>
        </ItemCard>
      ))}
      {items.length === 0 && <Empty text="Отзывов пока нет — добавьте первый." />}
    </EditorShell>
  );
}

/* ────────────────────────── Общие оболочки ────────────────────────── */

function EditorShell({
  title,
  addLabel,
  onAdd,
  onSave,
  state,
  children,
}: {
  title: string;
  addLabel: string;
  onAdd: () => void;
  onSave: () => void;
  state: "idle" | "saving" | "saved" | "error";
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold text-white">{title}</h2>
        <div className="flex items-center gap-3">
          <Status state={state} />
          <button onClick={onAdd} className="btn-ghost">+ {addLabel}</button>
          <button onClick={onSave} className="btn-primary">Сохранить всё</button>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function ItemCard({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <div className="rounded-2xl border border-ink-700 bg-ink-800/70 p-5">
      <div className="flex justify-end">
        <button onClick={onRemove} className="text-sm font-medium text-rose-400 hover:text-rose-300">
          Удалить
        </button>
      </div>
      {children}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl border border-dashed border-ink-600 bg-ink-800/50 p-6 text-center text-sm text-ink-300">{text}</p>;
}
