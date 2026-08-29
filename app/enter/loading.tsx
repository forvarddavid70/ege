import { Skeleton } from "@/components/ui/Skeleton";

/** Скелетон-заглушка админ-панели /enter на время загрузки данных. */
export default function EnterLoading() {
  return (
    <div className="min-h-screen bg-ink-950">
      <header className="border-b border-ink-700 bg-ink-900">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-64 rounded" />
            <Skeleton className="h-3 w-40 rounded" />
          </div>
          <Skeleton className="h-10 w-40 rounded-xl" />
        </div>
        <div className="mx-auto flex w-full max-w-5xl gap-2 px-2 py-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-28 rounded-lg" />
          ))}
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">
        <div className="rounded-2xl border border-ink-700 bg-ink-800/70 p-6">
          <Skeleton className="mb-6 h-6 w-56 rounded" />
          <div className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3.5 w-32 rounded" />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
