/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
        coffee: {
          100: '#f5e6d3',
          200: '#e8c9a0',
          500: '#8B4513',
          700: '#5C2E00',
          900: '#2C1500',
        }
      }
    },
  },
  plugins: [],
}
