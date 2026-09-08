import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Every route is fully static; the terminal is client-side React. Serving
  // from the CDN avoids a serverless invocation and a cold start per visit.
  output: 'static',

  adapter: vercel(),

  integrations: [
    react(),
    tailwind({
      config: './tailwind.config.cjs'
    })
  ],

  // no custom Vite plugins needed; Astro's Tailwind integration wires them up for us
});