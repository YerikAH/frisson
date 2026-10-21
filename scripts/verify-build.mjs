import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import sharp from 'sharp';
const root = path.resolve('dist');
async function walk(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(p)));
    else if (p.endsWith('.html')) result.push(p);
  }
  return result;
}
const pages = await walk(root);
let references = 0;
const titles = new Set();
const descriptions = new Set();
const indexableUrls = new Set();
const checkedImages = new Set();

function attributes(tag) {
  return Object.fromEntries(
    [...tag.matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, name, value]) => [
      name,
      value,
    ]),
  );
}
function metadata(html, key) {
  const matches = [...html.matchAll(/<meta\s[^>]+>/g)]
    .map(([tag]) => attributes(tag))
    .filter((tag) => tag.name === key || tag.property === key);
  assert.equal(matches.length, 1, `${key}: debe aparecer exactamente una vez`);
  assert.ok(matches[0].content, `${key}: contenido vacío`);
  return matches[0].content;
}
for (const page of pages) {
  const html = await fs.readFile(page, 'utf8');
  assert.match(html, /<html lang="es-PE"/);
  assert.match(
    html,
    /<!doctype html>/i,
    `${page}: debe ser un documento HTML completo`,
  );
  const main = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert.match(
    main || '',
    /<h1(?:\s|>)/,
    `${page}: el contenido principal debe venir en el HTML`,
  );
  const intro = html.match(/<div\b[^>]*\bid="brand-intro"[^>]*>/)?.[0] || '';
  const shell = html.match(/<div\b[^>]*\bid="site-shell"[^>]*>/)?.[0] || '';
  assert.match(
    intro,
    /\shidden(?:\s|>)/,
    `${page}: intro oculta sin JavaScript`,
  );
  assert.doesNotMatch(
    intro,
    /\bdata-replay-on-reload\b/,
    `${page}: producción conserva la intro una vez por sesión`,
  );
  assert.ok(shell, `${page}: falta el contenido de la web`);
  assert.doesNotMatch(
    shell,
    /\sinert(?:\s|>)/,
    `${page}: contenido disponible sin JavaScript`,
  );
  assert.doesNotMatch(
    html,
    /<meta[^>]+name="astro-view-transitions-enabled"/,
    `${page}: conservar navegación entre documentos HTML`,
  );
  assert.match(html, /<title>[^<]+<\/title>/);
  const title = html.match(/<title>([^<]+)<\/title>/)[1];
  const description = metadata(html, 'description');
  assert.ok(!titles.has(title), `Título duplicado: ${title}`);
  assert.ok(
    !descriptions.has(description),
    `Descripción duplicada: ${description}`,
  );
  titles.add(title);
  descriptions.add(description);
  assert.equal(
    [...html.matchAll(/<h1(?:\s|>)/g)].length,
    1,
    `${page}: debe tener un solo h1`,
  );
  assert.equal(metadata(html, 'og:title'), title);
  assert.equal(metadata(html, 'og:description'), description);
  assert.equal(metadata(html, 'twitter:title'), title);
  assert.equal(metadata(html, 'twitter:description'), description);
  assert.equal(metadata(html, 'twitter:card'), 'summary_large_image');
  assert.equal(metadata(html, 'og:locale'), 'es_PE');
  const imageUrl = new URL(metadata(html, 'og:image'));
  assert.equal(metadata(html, 'twitter:image'), imageUrl.href);
  assert.equal(metadata(html, 'og:image:secure_url'), imageUrl.href);
  assert.ok(metadata(html, 'og:image:alt'));
  assert.ok(metadata(html, 'twitter:image:alt'));
  if (!checkedImages.has(imageUrl.pathname)) {
    const image = await sharp(
      path.join(root, decodeURI(imageUrl.pathname)),
    ).metadata();
    assert.equal(image.width, Number(metadata(html, 'og:image:width')));
    assert.equal(image.height, Number(metadata(html, 'og:image:height')));
    assert.equal(image.width, 1200);
    assert.equal(image.height, 630);
    assert.equal(metadata(html, 'og:image:type'), `image/${image.format}`);
    checkedImages.add(imageUrl.pathname);
  }
  const pageUrl = new URL(metadata(html, 'og:url'));
  assert.equal(imageUrl.origin, pageUrl.origin);
  assert.equal(pageUrl.search, '');
  assert.equal(pageUrl.hash, '');
  const noindex = metadata(html, 'robots').includes('noindex');
  const route =
    '/' +
    path
      .relative(root, page)
      .replace(/index\.html$/, '')
      .replace(/\/$/, '');
  const expectedNoindex = route === '/pedido' || route === '/404.html';
  assert.equal(noindex, expectedNoindex, `Indexación inesperada: ${route}`);
  assert.doesNotMatch(
    html,
    /<nav aria-label="Ruta de navegación"/,
    `${route}: no debe mostrar breadcrumbs`,
  );
  const schemas = [
    ...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs),
  ];
  if (!noindex) {
    const canonical = [...html.matchAll(/<link\s[^>]+>/g)]
      .map(([tag]) => attributes(tag))
      .filter((tag) => tag.rel === 'canonical');
    assert.equal(canonical.length, 1);
    assert.equal(canonical[0].href, pageUrl.href);
    assert.equal(pageUrl.pathname, route || '/');
    indexableUrls.add(pageUrl.href);
    assert.equal(schemas.length, 1, `${route}: falta JSON-LD`);
    const schema = JSON.parse(schemas[0][1]);
    assert.equal(schema['@context'], 'https://schema.org');
    assert.ok(
      schema['@graph'].some((node) => node['@type'] === 'Organization'),
    );
    assert.ok(schema['@graph'].some((node) => node['@type'] === 'WebSite'));
    if (route.startsWith('/catalogo/')) {
      const product = schema['@graph'].find(
        (node) => node['@type'] === 'Product',
      );
      assert.ok(product, `${route}: faltan datos de la composición`);
      assert.ok(
        !product.aggregateRating,
        'No publicar valoraciones sin confirmar',
      );
      assert.equal(product.url, pageUrl.href);
      await fs.access(path.join(root, new URL(product.image).pathname));
    }
    if (route !== '/') {
      assert.ok(
        schema['@graph'].some((node) => node['@type'] === 'BreadcrumbList'),
      );
    }
    if (route === '/' || route === '/contacto') {
      const faq = schema['@graph'].find(
        (node) =>
          Array.isArray(node['@type']) && node['@type'].includes('FAQPage'),
      );
      assert.ok(faq?.mainEntity.length);
      for (const question of faq.mainEntity) {
        assert.ok(
          html.includes(question.name),
          'Pregunta estructurada sin contenido visible',
        );
        assert.ok(
          html.includes(question.acceptedAnswer.text),
          'Respuesta estructurada sin contenido visible',
        );
      }
    }
  } else {
    assert.equal(schemas.length, 0);
  }
  const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(([, id]) => id);
  assert.equal(new Set(ids).size, ids.length, `${route}: IDs duplicados`);
  for (const [, value] of html.matchAll(
    /\saria-(?:controls|labelledby|describedby)="([^"]+)"/g,
  )) {
    for (const id of value.split(/\s+/))
      assert.ok(
        ids.includes(id),
        `${route}: referencia ARIA inexistente ${id}`,
      );
  }
  for (const [, ref] of html.matchAll(/(?:href|src)="(\/[^"?]*)"/g)) {
    const url = decodeURI(ref.split('#')[0]);
    if (!url) continue;
    const target = path.join(root, url);
    const candidates = [target, path.join(target, 'index.html')];
    const found = await Promise.all(
      candidates.map((p) =>
        fs
          .stat(p)
          .then((s) => s.isFile())
          .catch(() => false),
      ),
    );
    assert.ok(
      found.some(Boolean),
      `${path.relative(root, page)}: referencia inexistente ${ref}`,
    );
    references++;
  }
  for (const [, ref] of html.matchAll(/href="(\/[^"?]*#[^"]+)"/g)) {
    const [route, id] = ref.split('#');
    const target = path.join(root, route, 'index.html');
    try {
      const source = await fs.readFile(target, 'utf8');
      assert.ok(source.includes(`id="${id}"`), `Ancla inexistente: ${ref}`);
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
}
const sitemapIndex = await fs.readFile(
  path.join(root, 'sitemap-index.xml'),
  'utf8',
);
assert.match(sitemapIndex, /<sitemapindex\s/);
const sitemapUrls = new Set();
for (const [, location] of sitemapIndex.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const xml = await fs.readFile(
    path.join(root, new URL(location).pathname),
    'utf8',
  );
  assert.match(xml, /<urlset\s/);
  for (const [, url] of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    assert.ok(!sitemapUrls.has(url), `URL repetida en sitemap: ${url}`);
    sitemapUrls.add(url);
  }
}
assert.deepEqual(
  [...sitemapUrls].sort(),
  [...indexableUrls].sort(),
  'El sitemap debe contener todas y solo las páginas canónicas indexables',
);
const robots = await fs.readFile(path.join(root, 'robots.txt'), 'utf8');
const origin = new URL([...indexableUrls][0]).origin;
assert.ok(robots.includes(`Sitemap: ${origin}/sitemap-index.xml`));
assert.ok(
  !robots.includes('Disallow: /pedido'),
  'Permitir leer el noindex de /pedido',
);
console.log(
  `${pages.length} páginas, ${sitemapUrls.size} URLs en sitemap, ${checkedImages.size} tarjetas sociales y ${references} enlaces/recursos verificados; metadatos, JSON-LD y referencias ARIA correctos.`,
);
