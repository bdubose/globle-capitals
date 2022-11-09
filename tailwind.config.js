/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        header: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
  darkMode: "class"
}