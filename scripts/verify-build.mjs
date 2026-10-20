import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
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
for (const page of pages) {
  const html = await fs.readFile(page, 'utf8');
  assert.match(html, /<html lang="es-PE"/);
  assert.match(html, /<title>[^<]+<\/title>/);
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
console.log(
  `${pages.length} páginas en español; ${references} enlaces y recursos locales verificados.`,
);
