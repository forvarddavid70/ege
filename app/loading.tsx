import { Skeleton, SkeletonGrid } from "@/components/ui/Skeleton";

/**
 * Скелетон-заглушка лендинга. Next.js показывает её, пока серверный
 * компонент страницы готовит данные, — так пользователь сразу видит
 * «каркас» будущего контента вместо пустого экрана.
 */
export default function HomeLoading() {
  return (
    <div className="min-h-screen bg-ink-950">
      {/* Хедер */}
      <div className="border-b border-ink-700/70 bg-ink-950/80">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-9 w-9 rounded-xl" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-2.5 w-20 rounded" />
            </div>
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Hero */}
      <section className="hero-gradient">
        <div className="section grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="mt-5 h-12 w-full rounded-lg" />
            <Skeleton className="mt-3 h-12 w-4/5 rounded-lg" />
            <div className="mt-6 space-y-2">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-4 w-2/3 rounded" />
            </div>
            <div className="mt-8 flex gap-3">
              <Skeleton className="h-12 w-56 rounded-xl" />
              <Skeleton className="h-12 w-40 rounded-xl" />
            </div>
            <div className="mt-9 grid max-w-md grid-cols-3 gap-4">
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
              <Skeleton className="h-14 rounded-lg" />
            </div>
          </div>
          <div className="hidden justify-self-center lg:block">
            <Skeleton className="h-80 w-80 rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Карточки-преимущества */}
      <section className="section pt-0">
        <SkeletonGrid count={3} className="sm:grid-cols-3" />
      </section>

      {/* Отзывы */}
      <section className="border-t border-ink-800">
        <div className="section">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="mt-3 h-8 w-80 max-w-full rounded-lg" />
          <div className="mt-8">
            <SkeletonGrid count={3} className="md:grid-cols-2 lg:grid-cols-3" variant="review" />
          </div>
        </div>
      </section>
    </div>
  );
}
