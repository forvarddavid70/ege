import Reveal from "@/components/ui/Reveal";
import { CheckIcon } from "@/components/icons";
import { DropIcon, BondIcon } from "@/components/chem";

const ADVANTAGES = [
  {
    t: "Индивидуальная программа",
    d: "Я не веду всех по одному шаблону, а подбираю стратегию подготовки под конкретного человека.",
    I: DropIcon,
  },
  {
    t: "Упрощаю вашу задачу",
    d: "Моя задача — сделать подготовку максимально простой и комфортной, поэтому я выдаю готовые конспекты, скидываю записи занятий и оперативно отвечаю на все вопросы вне уроков.",
    I: BondIcon,
  },
  {
    t: "Эффективная стратегия",
    d: "Проходим каждый раздел до полного понимания, при котором соответствующие задания ЕГЭ решаются стабильно. Постоянно повторяем и закрепляем пройденный материал, пишем пробники по пройденным разделам для отслеживания прогресса.",
    I: CheckIcon,
  },
];

export default function Advantages() {
  return (
    <section className="section pt-0">
      <div className="grid gap-4 sm:grid-cols-3">
        {ADVANTAGES.map(({ t, d, I }, i) => (
          <Reveal key={t} delay={i * 90}>
            <div className="card h-full">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-brand-500/40 bg-brand-500/10 text-brand-300">
                <I className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-white">{t}</h3>
              <p className="mt-1 text-sm text-ink-300">{d}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
