/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // CSS variables se drive hote hain - light/dark me values flip hoti hain (index.css)
        surface: 'rgb(var(--surface) / <alpha-value>)',
        card: 'rgb(var(--card) / <alpha-value>)',
        borderc: 'rgb(var(--borderc) / <alpha-value>)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
