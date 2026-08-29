/**
 * Скелетон-заглушки для состояния загрузки.
 *
 * `Skeleton` — базовый прямоугольник с мерцанием (shimmer). Остальные
 * компоненты собирают из него узнаваемые «каркасы» секций, чтобы во время
 * загрузки страница не «прыгала», а плавно наполнялась контентом.
 */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`.trim()} aria-hidden="true" />;
}

/** Каркас карточки — обложка + пара строк текста. */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card">
      <Skeleton className="mb-4 h-11 w-11 rounded-xl" />
      <Skeleton className="mb-3 h-5 w-2/3 rounded-md" />
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton key={i} className={`h-3.5 rounded ${i === lines - 1 ? "w-1/2" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}

/** Каркас карточки отзыва — звёзды, текст, автор. */
export function SkeletonReview() {
  return (
    <div className="card">
      <Skeleton className="mb-4 h-4 w-24 rounded" />
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-full rounded" />
        <Skeleton className="h-3.5 w-4/5 rounded" />
      </div>
      <div className="mt-6 flex items-center gap-3">
        <Skeleton className="h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3.5 w-1/3 rounded" />
          <Skeleton className="h-3 w-1/2 rounded" />
        </div>
      </div>
    </div>
  );
}

/** Сетка скелетон-карточек заданной длины. */
export function SkeletonGrid({
  count = 3,
  className = "md:grid-cols-3",
  variant = "card",
}: {
  count?: number;
  className?: string;
  variant?: "card" | "review";
}) {
  return (
    <div className={`grid gap-5 ${className}`}>
      {Array.from({ length: count }).map((_, i) =>
        variant === "review" ? <SkeletonReview key={i} /> : <SkeletonCard key={i} />
      )}
    </div>
  );
}
