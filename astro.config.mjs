import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: node({
    mode: 'standalone'
  }),

  integrations: [
    react(),
    tailwind({
      config: './tailwind.config.cjs'
    })
  ],

  // no custom Vite plugins needed; Astro's Tailwind integration wires them up for us
});