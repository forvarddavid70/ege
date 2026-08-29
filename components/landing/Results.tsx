import Reveal from "@/components/ui/Reveal";
import { ArrowRightIcon, SparkIcon, GraduationIcon } from "@/components/icons";
import type { Settings } from "@/lib/types";

// Учебные результаты — куда поступают ученики.
const UNIVERSITIES = [
  "МГУ им. Ломоносова",
  "СПбГУ",
  "Сеченовский Университет",
  "РНИМУ им. Пирогова",
  "Первый мед (ПСПбГМУ)",
  "РХТУ им. Менделеева",
  "РТУ МИРЭА (ИТХТ им. Ломоносова)",
];

// Мини-кейсы «было → стало».
const SCORE_CASES = [
  { name: "Мария, 11 класс", from: 7, to: 88 },
  { name: "Артём, 11 класс", from: 20, to: 96 },
];

export default function Results({ settings }: { settings: Settings }) {
  const stats = [
    { v: settings.avgScore, l: "средний балл ЕГЭ у учеников" },
    { v: "90+", l: "баллов у каждого третьего выпускника" },
    { v: settings.studentsCount, l: "учеников за годы практики" },
    { v: "100%", l: "сдали ЕГЭ — без пересдач" },
  ];

  return (
    <section id="results" className="relative overflow-hidden border-y border-ink-800 bg-ink-900/40">
      <div className="section">
        <Reveal>
          <p className="eyebrow">Результаты</p>
          <h2 className="section-title mt-2">Баллы, которые открывают двери в вузы</h2>
          <p className="mt-2 max-w-2xl text-ink-300">
            Химия нужна медикам, химикам, биологам и технологам. Чтобы баллов хватало на поступление в вуз мечты.
          </p>
        </Reveal>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <Reveal key={s.l} delay={i * 80}>
              <div className="card h-full text-center">
                <div className="text-4xl font-black text-gradient">{s.v}</div>
                <p className="mt-2 text-sm text-ink-300">{s.l}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Reveal>
            <div className="card h-full">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <GraduationIcon className="h-5 w-5 text-brand-300" />
                Поступили в вузы
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {UNIVERSITIES.map((u) => (
                  <span key={u} className="rounded-lg border border-ink-600 bg-ink-900/60 px-3 py-1.5 text-sm text-ink-100">
                    {u}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={90}>
            <div className="card h-full">
              <h3 className="flex items-center gap-2 font-semibold text-white">
                <SparkIcon className="h-5 w-5 text-brand-300" />
                Было → стало
              </h3>
              <ul className="mt-4 space-y-3">
                {SCORE_CASES.map((c) => (
                  <li key={c.name} className="flex items-center justify-between gap-4">
                    <span className="text-sm text-ink-200">{c.name}</span>
                    <span className="flex items-center gap-2 font-semibold">
                      <span className="text-ink-400">{c.from}</span>
                      <ArrowRightIcon className="h-4 w-4 text-brand-400" />
                      <span className="text-gradient">{c.to}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
