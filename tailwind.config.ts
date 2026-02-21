import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // GestiCash Brand Colors
        'gesticash-green': '#4CAF50',
        'gesticash-blue': '#1E88E5',
        'gesticash-orange': '#F9A825',
        'gesticash-gray': '#616161',
      },
      fontFamily: {
        sans: ['var(--font-montserrat)', 'system-ui', '-apple-system', 'sans-serif'],
        montserrat: ['var(--font-montserrat)', 'sans-serif'],
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
