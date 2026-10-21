import type { APIRoute } from 'astro';
import { site } from '../config/site';
export const GET: APIRoute = () =>
  new Response(
    // /pedido debe poder rastrearse para que los buscadores lean su noindex.
    `User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap-index.xml', site.url).href}\n`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
