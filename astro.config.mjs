// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { loadEnv } from 'vite';
import {
  DEFAULT_SITE_URL,
  isIndexablePath,
  normalizeSiteUrl,
} from './src/lib/seo.ts';

const env = loadEnv(
  process.env.NODE_ENV || 'development',
  process.cwd(),
  'PUBLIC_',
);
const siteUrl = normalizeSiteUrl(
  process.env.PUBLIC_SITE_URL || env.PUBLIC_SITE_URL || DEFAULT_SITE_URL,
);

// https://astro.build/config
export default defineConfig({
  site: siteUrl,
  trailingSlash: 'never',
  devToolbar: { enabled: false },
  integrations: [
    react(),
    sitemap({ filter: (page) => isIndexablePath(new URL(page).pathname) }),
  ],
  vite: {
    plugins: [tailwindcss()],
    // Discover all GSAP entry points together so the header never imports a stale dev bundle.
    optimizeDeps: { include: ['gsap', 'gsap/Flip', 'gsap/ScrollTrigger'] },
  },
});
