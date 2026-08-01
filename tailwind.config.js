/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          mint: '#a7f3d0',     // Tailwind emerald-200 / sage-ish
          sage: '#86efac',     // Tailwind green-300
          terracotta: '#ea580c', // Tailwind orange-600
          dark: '#1e293b',     // Tailwind slate-800
          light: '#f8fafc',    // Tailwind slate-50
        }
      }
    },
  },
  plugins: [],
}
