import Link from "next/link";
import type { Settings } from "@/lib/types";

export default function SiteFooter({ settings }: { settings: Settings }) {
  return (
    <footer className="border-t border-ink-800 bg-ink-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-sm text-ink-400 sm:flex-row sm:px-6">
        <p>© {new Date().getFullYear()} {settings.brandName} • {settings.tutorName}. Репетитор по химии.</p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span>Занятия онлайн • ЕГЭ • Школьная программа</span>
          <Link href="/privacy" className="font-medium text-ink-300 transition hover:text-brand-300">
            Политика конфиденциальности
          </Link>
        </div>
      </div>

      {/* «Powered by» — тонкая подпись в самом низу страницы. */}
      <div className="border-t border-ink-800/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-center sm:px-6">
          <p className="text-xs text-ink-500">
            Powered by team of{" "}
            <a
              href="https://connect.trioz.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-300 transition hover:text-brand-200"
            >
              connect.trioz.ru
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
