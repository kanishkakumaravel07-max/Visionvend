/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Support toggling or permanent dark theme
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',      // Slate 900
          card: 'rgba(30, 41, 59, 0.7)', // Slate 800 with transparency
          border: 'rgba(255, 255, 255, 0.08)',
          accent: '#6366f1',    // Indigo 500
          cyan: '#06b6d4',      // Cyan 500
        }
      },
      backdropBlur: {
        xs: '2px',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
