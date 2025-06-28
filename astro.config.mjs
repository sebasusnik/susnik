import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel/serverless';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  output: 'server',

  adapter: vercel(),

  integrations: [
    react(),
    tailwind({
      config: './tailwind.config.cjs'
    })
  ],

  // no custom Vite plugins needed; Astro's Tailwind integration wires them up for us
});