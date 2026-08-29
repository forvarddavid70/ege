import { TelegramIcon } from "./icons";

export default function FloatingTelegram({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-brand-gradient px-4 py-3 text-white shadow-glow transition hover:brightness-110 sm:px-5"
      aria-label="Написать в Telegram"
    >
      <TelegramIcon className="h-6 w-6" />
      <span className="hidden text-sm font-semibold sm:inline">Написать в Telegram</span>
    </a>
  );
}
