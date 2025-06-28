/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'term-bg': '#140623',
        'term-bor': '#43394F',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      keyframes: {
        blink: {
          '0%, 100%': { background: 'transparent' },
          '50%': { background: '#f8f8f2' },
        },
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        cursor: 'blink 1s steps(2, end) infinite',
        'fade-in': 'fade-in 0.35s ease-out both',
      },
    },
  },
  plugins: [],
}; 