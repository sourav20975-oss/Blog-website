/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      colors: {
        surface: 'rgb(var(--surface) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        borderc: 'rgb(var(--borderc) / <alpha-value>)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
