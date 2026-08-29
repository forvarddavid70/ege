"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BenzeneRing } from "@/components/chem";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Не удалось войти");
        return;
      }
      router.refresh();
    } catch {
      setError("Сетевая ошибка. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-950 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm rounded-2xl border border-ink-800 bg-ink-900/40 p-8 backdrop-blur">
        <div className="mb-5 flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
            <BenzeneRing className="h-5 w-5" />
          </span>
          <div className="leading-none">
            <p className="text-gradient text-base font-extrabold">ЕГЭ Father</p>
            <p className="mt-1 text-xs text-ink-300">панель управления</p>
          </div>
        </div>
        <h1 className="text-xl font-bold text-white">Вход в панель</h1>
        <p className="mt-1 text-sm text-ink-300">Доступ только для автора сайта.</p>

        <div className="mt-6">
          <label className="label" htmlFor="password">Пароль</label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
        </div>

        {error && <p className="mt-3 text-sm text-rose-400">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary mt-6 w-full disabled:opacity-60">
          {loading ? "Проверяем…" : "Войти"}
        </button>
      </form>
    </div>
  );
}
