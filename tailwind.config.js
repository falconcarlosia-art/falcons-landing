import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./FalconsLanding.jsx"],
  theme: {
    extend: {
      // Tokens del sitio público (specs/008-rediseno-tienda). El panel admin
      // sigue usando la paleta slate de Tailwind.
      colors: {
        bg: "#0B0F17",
        surface: "#131A26",
        "surface-2": "#1B2433",
        line: "#263244",
        ink: "#F1F5F9",
        muted: "#94A3B8",
        subtle: "#64748B",
        brand: { DEFAULT: "#F59E0B", hover: "#FBBF24", ink: "#1A1204" },
        wa: { DEFAULT: "#16A34A", hover: "#22C55E" },
        photo: "#F3F4F6",
      },
      fontFamily: {
        sans: ["Geist", "system-ui", "sans-serif"],
        mono: ["'Geist Mono'", "ui-monospace", "monospace"],
        logo: ["Orbitron", "sans-serif"],
      },
      borderRadius: {
        card: "16px",
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(1)" },
          "40%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
        "sheet-up": {
          from: { transform: "translateY(100%)" },
          to: { transform: "translateY(0)" },
        },
        "slide-in": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        pop: "pop 0.35s ease-out",
        "sheet-up": "sheet-up 0.25s ease-out",
        "slide-in": "slide-in 0.25s ease-out",
        "fade-in": "fade-in 0.2s ease-out",
      },
    },
  },
  plugins: [typography],
};
