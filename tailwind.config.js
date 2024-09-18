/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  "darkMode": "class",
  theme: {
    extend: {
      screens: {
        '2md': '880px',
        'xsm': '480px'
      },
    },
  },
  plugins: [],
}
