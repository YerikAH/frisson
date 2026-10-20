import type { APIRoute } from 'astro';
import { site } from '../config/site';
import { products } from '../data/products';
export const GET: APIRoute = () => {
  const paths = [
    '/',
    '/catalogo',
    '/personalizados',
    '/historia',
    '/contacto',
    '/privacidad',
    '/terminos',
    ...products.map((p) => `/catalogo/${p.id}`),
  ];
  const urls = site.url
    ? paths
        .map(
          (path) =>
            `<url><loc>${new URL(path, site.url).href.replaceAll('&', '&amp;')}</loc></url>`,
        )
        .join('')
    : '';
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
};
