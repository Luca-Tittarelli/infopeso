/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  "darkMode": "class",
  theme: {
    extend: {
      colors: {
        dark: "#000320",
        light: "#EDEDED",
        main: "#38B6FF",
        primary: "#0049AD",
      },
      screens: {
        '2md': '880px',
        'xsm': '480px'
      },
    },
  },
  plugins: [],
}
