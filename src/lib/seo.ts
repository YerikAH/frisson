export const DEFAULT_SITE_URL = 'https://frisson.pe';

/** Una sola versión de cada ruta, sin parámetros de campañas ni barra final. */
export function normalizePathname(pathname: string): string {
  return pathname.split(/[?#]/)[0].replace(/\/+$/, '') || '/';
}

export function normalizeSiteUrl(value: string): string {
  const url = new URL(value.trim());
  if (
    !['https:', 'http:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      'PUBLIC_SITE_URL debe ser el dominio absoluto, sin rutas ni parámetros.',
    );
  }
  return url.origin;
}

export function isIndexablePath(pathname: string): boolean {
  return !['/pedido', '/404', '/404.html'].includes(
    normalizePathname(pathname),
  );
}

/** Evita que contenido editorial pueda cerrar el script JSON-LD. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
