const plugin = require('tailwindcss/plugin');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        // The flyer site. These resolve to CSS variables so that `666`, which
        // flips `html.inverted`, repaints the whole page by swapping six values
        // instead of filtering it — a filter turned the blood pink.
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        mute: 'var(--mute)',
        dim: 'var(--dim)',
        faint: 'var(--faint)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        blood: '#8b0000',
        // The terminal at /terminal.
        'term-bg': '#140623',
        'term-bor': '#43394F',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
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
        // The logo dies for a frame, like a neon that is going.
        die: {
          '0%': { opacity: '1' },
          '12%': { opacity: '.15', filter: 'brightness(1.6) hue-rotate(-20deg)' },
          '22%': { opacity: '1' },
          '40%': { opacity: '.4', transform: 'translateX(1px)' },
          '50%': { opacity: '1', transform: 'none' },
          '100%': { opacity: '1' },
        },
        // Crossing into 666: cut out, absence, the other one for three frames,
        // absence, and it returns a few pixels off and settles.
        cross: {
          '0%, 6%': { opacity: '1' },
          '7%, 30%': { opacity: '0' },
          '31%, 38%': {
            opacity: '.92',
            transform: 'rotate(180deg) scale(1.03)',
            filter: 'brightness(1.35)',
          },
          '39%, 58%': { opacity: '0', transform: 'none', filter: 'none' },
          '59%': { opacity: '1', transform: 'translate(3px, -2px)' },
          '100%': { opacity: '1', transform: 'none' },
        },
      },
      animation: {
        cursor: 'blink 1s steps(2, end) infinite',
        'fade-in': 'fade-in 0.35s ease-out both',
        die: 'die .28s steps(1, end) 1',
        cross: 'cross .7s linear 1',
      },
    },
  },
  plugins: [
    // `inverted:` targets the 666 state without every rule needing a selector.
    plugin(({ addVariant }) => {
      addVariant('inverted', 'html.inverted &');
    }),
  ],
};
