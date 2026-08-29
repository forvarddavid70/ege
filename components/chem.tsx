/**
 * Кастомные SVG-элементы на химическую тематику для бренда «ЕГЭ Father».
 * Всё нарисовано вручную (без внешних картинок/фото) в фирменной
 * чёрно-серо-фиолетовой палитре.
 */

/** Гексагональная «сетка» из бензольных колец — фон для тёмных секций. */
export function HexGrid({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 800 400"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="hexpattern" width="90" height="78" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
          <path
            d="M22 2 L67 2 L89 39 L67 76 L22 76 L0 39 Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
          />
        </pattern>
      </defs>
      <rect width="800" height="400" fill="url(#hexpattern)" />
    </svg>
  );
}

/** Крупная декоративная молекула с атомами, связями и орбитами. */
export function MoleculeArt({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="molGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
        <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#c4b5fd" />
          <stop offset="100%" stopColor="#7c3aed" />
        </radialGradient>
      </defs>

      {/* Связи */}
      <g stroke="url(#molGrad)" strokeWidth="3" strokeLinecap="round" opacity="0.9">
        <line x1="160" y1="160" x2="72" y2="96" />
        <line x1="160" y1="160" x2="250" y2="98" />
        <line x1="160" y1="160" x2="96" y2="244" />
        <line x1="160" y1="160" x2="242" y2="236" />
        <line x1="72" y1="96" x2="250" y2="98" />
        <line x1="96" y1="244" x2="242" y2="236" />
      </g>

      {/* Орбита */}
      <ellipse
        cx="160"
        cy="160"
        rx="128"
        ry="70"
        stroke="#8b5cf6"
        strokeWidth="1.5"
        strokeDasharray="4 8"
        opacity="0.5"
        transform="rotate(28 160 160)"
      />

      {/* Атомы */}
      <circle cx="160" cy="160" r="30" fill="url(#nodeGlow)" />
      <text x="160" y="167" textAnchor="middle" fontSize="22" fontWeight="700" fill="#0d0d14">C</text>

      <circle cx="72" cy="96" r="20" fill="#1c1c28" stroke="#a78bfa" strokeWidth="2.5" />
      <text x="72" y="103" textAnchor="middle" fontSize="15" fontWeight="700" fill="#c4b5fd">O</text>

      <circle cx="250" cy="98" r="20" fill="#1c1c28" stroke="#a78bfa" strokeWidth="2.5" />
      <text x="250" y="105" textAnchor="middle" fontSize="15" fontWeight="700" fill="#c4b5fd">H</text>

      <circle cx="96" cy="244" r="20" fill="#1c1c28" stroke="#e879f9" strokeWidth="2.5" />
      <text x="96" y="251" textAnchor="middle" fontSize="15" fontWeight="700" fill="#f0abfc">N</text>

      <circle cx="242" cy="236" r="20" fill="#1c1c28" stroke="#e879f9" strokeWidth="2.5" />
      <text x="242" y="243" textAnchor="middle" fontSize="15" fontWeight="700" fill="#f0abfc">Na</text>
    </svg>
  );
}

/** Бензольное кольцо с чередующимися двойными связями. */
export function BenzeneRing({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <polygon
        points="24,4 42,14 42,34 24,44 6,34 6,14"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      <g stroke="currentColor" strokeWidth="2" opacity="0.75">
        <line x1="10" y1="17" x2="10" y2="31" />
        <line x1="38" y1="17" x2="38" y2="31" />
        <line x1="21" y1="8" x2="27" y2="8" transform="rotate(30 24 8)" />
      </g>
      <circle cx="24" cy="24" r="8.5" stroke="currentColor" strokeWidth="1.6" opacity="0.5" />
    </svg>
  );
}

/** Атом с электронными орбитами (модель Резерфорда). */
export function AtomIcon({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden="true">
      <circle cx="24" cy="24" r="4" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="2" fill="none">
        <ellipse cx="24" cy="24" rx="20" ry="8" />
        <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(60 24 24)" />
        <ellipse cx="24" cy="24" rx="20" ry="8" transform="rotate(120 24 24)" />
      </g>
    </svg>
  );
}

/** Колба Эрленмейера с делениями. */
export function FlaskIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 3h6M10 3v6l-5.5 9.5A2 2 0 0 0 6.2 21h11.6a2 2 0 0 0 1.7-3L14 9V3" />
      <path strokeLinecap="round" d="M7.5 15h9" />
    </svg>
  );
}

/** Пробирка с жидкостью и пузырьками. */
export function TestTubeIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 2h8M9 2v16a3 3 0 0 0 6 0V2" />
      <path strokeLinecap="round" d="M9 13c1.5 1 4.5 1 6 0" />
      <circle cx="12" cy="16.5" r="0.6" fill="currentColor" stroke="none" />
      <circle cx="13.4" cy="18" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** Значок «связь/молекула» из двух атомов. */
export function BondIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <circle cx="6" cy="12" r="3.2" />
      <circle cx="18" cy="12" r="3.2" />
      <path strokeLinecap="round" d="M9.2 12h5.6" />
    </svg>
  );
}

/** Значок капли/реагента. */
export function DropIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />
    </svg>
  );
}

/** Декоративная SVG-«обложка» для карточек блога вместо фото. */
export function BlogCover({ variant = 0, className = "" }: { variant?: number; className?: string }) {
  const palettes = [
    { from: "#7c3aed", to: "#d946ef", glyph: "benzene" },
    { from: "#6d28d9", to: "#8b5cf6", glyph: "flask" },
    { from: "#a21caf", to: "#7c3aed", glyph: "atom" },
    { from: "#5b21b6", to: "#c026d3", glyph: "tube" },
  ] as const;
  const p = palettes[variant % palettes.length];
  const gid = `bc${variant}`;

  return (
    <svg className={className} viewBox="0 0 400 220" fill="none" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={p.from} />
          <stop offset="100%" stopColor={p.to} />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="#0d0d14" />
      <rect width="400" height="220" fill={`url(#${gid})`} opacity="0.22" />

      {/* лёгкая гекс-сетка */}
      <g stroke="#ffffff" strokeWidth="0.8" opacity="0.08">
        {Array.from({ length: 6 }).map((_, r) =>
          Array.from({ length: 10 }).map((_, c) => (
            <path
              key={`${r}-${c}`}
              d="M12 0 L36 0 L48 21 L36 42 L12 42 L0 21 Z"
              transform={`translate(${c * 48 + (r % 2 ? 24 : 0)} ${r * 34})`}
              fill="none"
            />
          ))
        )}
      </g>

      <g transform="translate(200 110)" stroke="#ffffff" opacity="0.9" fill="none" strokeWidth="3">
        {p.glyph === "benzene" && (
          <>
            <polygon points="0,-46 40,-23 40,23 0,46 -40,23 -40,-23" strokeLinejoin="round" />
            <circle r="20" strokeWidth="2" opacity="0.6" />
          </>
        )}
        {p.glyph === "atom" && (
          <>
            <circle r="6" fill="#ffffff" stroke="none" />
            <ellipse rx="44" ry="17" />
            <ellipse rx="44" ry="17" transform="rotate(60)" />
            <ellipse rx="44" ry="17" transform="rotate(120)" />
          </>
        )}
        {p.glyph === "flask" && (
          <path strokeLinecap="round" strokeLinejoin="round" d="M-14 -40h28M-10 -40v22l-22 40a6 6 0 0 0 5 9h46a6 6 0 0 0 5-9l-22-40v-22" />
        )}
        {p.glyph === "tube" && (
          <path strokeLinecap="round" strokeLinejoin="round" d="M-18 -42h36M-13 -42v70a13 13 0 0 0 26 0v-70" />
        )}
      </g>
    </svg>
  );
}
