import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Насыщенный фиолетовый (violet) — фирменный акцент «ЕГЭ Father».
        // Работает в паре с accent (фуксия) в фирменных градиентах.
        brand: {
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
          950: "#2e1065",
        },
        // Дополнительный акцент — фуксия/магента: второй конец градиентов.
        accent: {
          400: "#e879f9",
          500: "#d946ef",
          600: "#c026d3",
        },
        // Чёрно-серая шкала для тёмной темы
        ink: {
          950: "#08080c",
          900: "#0d0d14",
          800: "#14141d",
          700: "#1c1c28",
          600: "#262633",
          500: "#3a3a4a",
          400: "#5c5c70",
          300: "#8b8b9e",
          200: "#b9b9c6",
          100: "#e4e4ec",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        // Фирменный фиолетово-фуксиевый градиент для кнопок, колец и акцентов.
        "brand-gradient": "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #d946ef 100%)",
        "brand-gradient-soft":
          "linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(217,70,239,0.14) 100%)",
      },
      boxShadow: {
        // Мягкое фиолетовое «свечение» под градиентные элементы.
        glow: "0 12px 40px -12px rgba(124, 58, 237, 0.5)",
        "glow-sm": "0 6px 20px -8px rgba(124, 58, 237, 0.45)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // Мерцание для скелетонов-заглушек
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        shimmer: "shimmer 1.6s infinite",
      },
    },
  },
  plugins: [],
};

export default config;
