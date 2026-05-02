/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Legacy compat
        dark: "#0A0E17",
        light: "#FAFBFC",
        main: "#0066FF",
        primary: "#0066FF",

        // Surface system
        surface: {
          DEFAULT: "var(--bg-surface)",
          hover: "var(--bg-surface-hover)",
        },

        // Accent
        accent: {
          DEFAULT: "#0066FF",
          soft: "#EBF2FF",
          dark: "#3B82F6",
          "dark-soft": "#1E3A5F",
        },

        // Semantic data colors
        positive: "var(--positive)",
        "positive-soft": "var(--positive-soft)",
        negative: "var(--negative)",
        "negative-soft": "var(--negative-soft)",

        // Neutrals
        ink: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
      },

      fontFamily: {
        heading: ['Satoshi', 'system-ui', 'sans-serif'],
        body: ['"General Sans"', 'system-ui', 'sans-serif'],
        sans: ['"General Sans"', 'system-ui', 'sans-serif'],
      },

      spacing: {
        '4.5': '1.125rem',
        '13': '3.25rem',
        '15': '3.75rem',
        '18': '4.5rem',
        '22': '5.5rem',
        '100': '25rem',
      },

      borderRadius: {
        'card': '12px',
        'card-lg': '16px',
        'pill': '9999px',
      },

      boxShadow: {
        'card': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'card-dark': '0 1px 4px rgba(0,0,0,0.3)',
        'card-dark-hover': '0 6px 20px rgba(0,0,0,0.4)',
        'header': '0 1px 0 var(--border-subtle)',
      },

      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-bottom': {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out-bottom': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
        'draw-line': {
          '0%': { strokeDashoffset: '1' },
          '100%': { strokeDashoffset: '0' },
        },
      },

      animation: {
        'shimmer': 'shimmer 1.8s ease-in-out infinite',
        'fade-up': 'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fade-in 0.3s ease forwards',
        'slide-in-bottom': 'slide-in-bottom 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-out-bottom': 'slide-out-bottom 0.3s ease forwards',
      },

      screens: {
        'xs': '480px',
        'xsm': '480px',
        '2md': '880px',
      },
    },
  },
  plugins: [],
}
