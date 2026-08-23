/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0a0a0b',
        card: '#141417',
        borderc: '#27272a',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
