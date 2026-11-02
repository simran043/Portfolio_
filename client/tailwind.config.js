/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: {
          base: '#080c14',
          card: '#0d1424',
          elevated: '#131e34',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        brand: {
          cyan: '#06b6d4',
          emerald: '#10b981',
          violet: '#8b5cf6',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
      },
    },
  },
  plugins: [],
};
