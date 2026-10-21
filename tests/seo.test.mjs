import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizePathname,
  normalizeSiteUrl,
  isIndexablePath,
  serializeJsonLd,
} from '../src/lib/seo.ts';

test('las URLs canónicas omiten campañas, fragmentos y barras finales', () => {
  assert.equal(
    normalizePathname('/catalogo/?utm_source=instagram#coleccion'),
    '/catalogo',
  );
  assert.equal(normalizePathname('/?utm_source=instagram'), '/');
  assert.equal(
    normalizePathname('/catalogo/ramo-frances/'),
    '/catalogo/ramo-frances',
  );
});

test('el dominio configurado no admite protocolos, credenciales ni rutas inválidas', () => {
  assert.equal(normalizeSiteUrl(' https://frisson.pe/ '), 'https://frisson.pe');
  for (const url of [
    'frisson.pe',
    'ftp://frisson.pe',
    'https://user:secret@frisson.pe',
    'https://frisson.pe/catalogo',
    'https://frisson.pe/?utm_source=test',
    'https://frisson.pe/#inicio',
  ]) {
    assert.throws(() => normalizeSiteUrl(url), undefined, url);
  }
});

test('pedido y 404 siguen fuera del índice incluso con parámetros o barra final', () => {
  for (const route of ['/pedido', '/pedido/?tipo=ramo', '/404', '/404.html'])
    assert.equal(isIndexablePath(route), false);
  for (const route of [
    '/',
    '/catalogo',
    '/catalogo/ramo-frances',
    '/contacto',
    '/privacidad',
    '/terminos',
  ])
    assert.equal(isIndexablePath(route), true);
});

test('los datos estructurados conservan el contenido sin permitir cerrar el script', () => {
  const content = {
    name: 'Flores </script><script>alert("x")</script> & emociones',
  };
  const json = serializeJsonLd(content);
  assert.ok(!json.includes('<'));
  assert.deepEqual(JSON.parse(json), content);
});
