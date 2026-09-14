import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwind from '@astrojs/tailwind';

// Absolute URLs (canonical, og:image) need an origin. Vercel injects the
// project's production domain, so this picks up a custom domain by itself once
// one is attached — no code change needed when the domain lands.
const site =
  process.env.PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:4321');

// https://astro.build/config
export default defineConfig({
  site,

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