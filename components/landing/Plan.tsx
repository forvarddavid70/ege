import Reveal from "@/components/ui/Reveal";
import { TelegramIcon, GraduationIcon } from "@/components/icons";
import { AtomIcon, TestTubeIcon, DropIcon } from "@/components/chem";

// План подготовки — 5 шагов.
const PLAN_STEPS: { title: string; text: string; Icon: (p: { className?: string }) => JSX.Element }[] = [
  { title: "Индивидуальный план", text: "Составляю маршрут под конкретную цель — без лишнего и «для галочки».", Icon: GraduationIcon },
  { title: "Теория без воды", text: "Объясняю сложное простыми словами и на примерах, пока не станет понятно.", Icon: AtomIcon },
  { title: "Самостоятельная работа", text: "После каждого урока задаю домашнее задание для закрепления освоенного материала.", Icon: DropIcon },
  { title: "Пробники", text: "Регулярно пишем пробники в формате экзамена и разбираем каждую ошибку.", Icon: TestTubeIcon },
  { title: "Поддержка", text: "Отвечаю на вопросы между занятиями в Telegram и держу мотивацию весь год.", Icon: TelegramIcon },
];

export default function Plan() {
  return (
    <section id="plan">
      <div className="section">
        <Reveal>
          <p className="eyebrow">Как учимся</p>
          <h2 className="section-title mt-2">Наш план — 5 шагов до высокого балла</h2>
          <p className="mt-2 max-w-2xl text-ink-300">
            Понятная система вместо хаотичного «прорешивания вариантов». Каждый шаг приближает к цели.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLAN_STEPS.map((step, i) => (
            <Reveal key={step.title} delay={(i % 3) * 90}>
              <div className="card group relative h-full">
                <span className="absolute right-5 top-5 text-4xl font-black text-ink-700 transition group-hover:text-brand-600/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-500/40 bg-brand-500/10 text-brand-300">
                  <step.Icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-white">{step.title}</h3>
                <p className="mt-1 text-sm text-ink-300">{step.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
