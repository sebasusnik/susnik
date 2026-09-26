/**
 * Tailwind 3 through PostCSS, which Astro runs on every stylesheet. The
 * @astrojs/tailwind integration did the same and stops at Astro 5; its
 * `applyBaseStyles: false` is kept by each entry CSS writing its own
 * @tailwind directives.
 */
module.exports = {
  plugins: {
    tailwindcss: { config: './tailwind.config.cjs' },
    autoprefixer: {},
  },
};
