import type { APIRoute } from 'astro';
import { site } from '../config/site';
export const GET: APIRoute = () =>
  new Response(
    `User-agent: *\nAllow: /\nDisallow: /pedido\n${site.url ? `Sitemap: ${new URL('/sitemap.xml', site.url).href}\n` : ''}`,
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
