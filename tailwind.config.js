/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['IBM Plex Sans', 'sans-serif'],
        heading: ['Dela Gothic One', 'sans-serif'],
      },
    },
  },
  plugins: [],
}