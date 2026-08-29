"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

/**
 * Плавное появление блока при прокрутке (scroll reveal).
 *
 * Пока элемент вне зоны видимости — он слегка смещён вниз и прозрачен;
 * как только он попадает во вьюпорт (IntersectionObserver), включается
 * CSS-переход (см. `.reveal` в globals.css). Анимация проигрывается один раз.
 *
 * Уважает `prefers-reduced-motion`: пользователям, отключившим анимации,
 * контент показывается сразу, без сдвигов.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Задержка появления в миллисекундах — для «каскада» соседних блоков. */
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Если анимации отключены системно — показываем сразу.
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      ref={ref}
      className={`reveal ${visible ? "reveal-visible" : ""} ${className}`.trim()}
      style={delay ? { transitionDelay: `${delay}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
