import typography from "@tailwindcss/typography";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}", "./FalconsLanding.jsx"],
  theme: {
    extend: {},
  },
  plugins: [typography],
};
