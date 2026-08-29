import { StarIcon } from "@/components/icons";

/** Показывает оценку от 1 до 5 звёздами (заполненные + контурные). */
export default function StarRating({
  value,
  className = "h-4 w-4",
}: {
  value: number;
  className?: string;
}) {
  const filled = Math.min(5, Math.max(0, Math.round(value)));
  return (
    <span
      className="inline-flex items-center gap-0.5 text-amber-400"
      role="img"
      aria-label={`Оценка ${filled} из 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon
          key={i}
          className={`${className} ${i < filled ? "text-amber-400" : "text-ink-600"}`}
          filled={i < filled}
        />
      ))}
    </span>
  );
}
