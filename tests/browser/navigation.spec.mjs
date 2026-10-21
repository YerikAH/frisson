import { test, expect } from '@playwright/test';

async function observeNavigation(page) {
  await page.addInitScript(() => {
    window.__frissonPageId = crypto.randomUUID();
    window.__transition = {
      supported: 'onpagereveal' in window,
      active: false,
      ready: false,
      finished: false,
    };
    window.addEventListener('pagereveal', (event) => {
      window.__transition.active = !!event.viewTransition;
      if (event.viewTransition) {
        event.viewTransition.ready
          .then(() => {
            window.__transition.ready = true;
            window.__transition.animationNames = document
              .getAnimations()
              .map((animation) => animation.animationName);
          })
          .catch(() => {});
        event.viewTransition.finished.then(() => {
          window.__transition.finished = true;
        });
      }
    });
  });
}

test('transición entre documentos HTML conserva metadatos y controles tras navegar', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await observeNavigation(page);
  await page.goto('/');
  const firstDocument = await page.evaluate(() => window.__frissonPageId);
  const response = page.waitForResponse(
    (response) =>
      response.request().isNavigationRequest() &&
      new URL(response.url()).pathname === '/catalogo',
  );
  await page.locator('.footer a[href="/catalogo"]').click();
  const htmlResponse = await response;
  expect(htmlResponse.headers()['content-type']).toContain('text/html');
  const html = await htmlResponse.text();
  expect(html).toMatch(/<h1[\s>]/);
  expect(html).toContain('rel="canonical"');
  expect(html).toContain('application/ld+json');
  expect(html).toContain('href="/contacto"');
  await expect(page).toHaveURL(/\/catalogo$/);
  expect(await page.evaluate(() => window.__frissonPageId)).not.toBe(
    firstDocument,
  );
  await expect(page).toHaveTitle(
    'Ramos y arreglos florales en Huancayo | Frisson',
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/catalogo$/,
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
    'content',
    /\/catalogo$/,
  );
  await expect(page.locator('.nav-left a[href="/catalogo"]')).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect
    .poll(() => page.evaluate(() => window.__transition.ready))
    .toBe(true);
  const transition = await page.evaluate(() => window.__transition);
  expect(transition.animationNames).toContain('frisson-page-in');
  await expect
    .poll(() => page.evaluate(() => window.__transition.finished))
    .toBe(true);
  await page.locator('[data-filter]').nth(1).click();
  await expect(page.locator('[data-filter]').nth(1)).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.locator('[data-add-product]').first().click();
  await expect(page.locator('.toast')).toContainText('se añadió');
  await page.mouse.wheel(0, -300);
  await expect(page.locator('[data-scroll-header]')).toHaveAttribute(
    'data-hidden',
    'false',
  );
  await page.locator('[data-open-search]').click();
  await expect(page.locator('#search-dialog')).toHaveAttribute('open');
  await page.locator('#search-input').fill('rosas');
  await expect(page.locator('#search-results a').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#search-dialog')).not.toHaveAttribute('open');
  expect(errors).toEqual([]);
});

test('reducir movimiento desactiva la transición sin afectar navegación ni SEO', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await observeNavigation(page);
  await page.goto('/');
  const before = await page.evaluate(() => window.__frissonPageId);
  await page.locator('.footer a[href="/historia"]').click();
  await expect(page).toHaveURL(/\/historia$/);
  expect(await page.evaluate(() => window.__frissonPageId)).not.toBe(before);
  expect(await page.evaluate(() => window.__transition.active)).toBe(false);
  await expect(page.locator('h1')).toContainText('se trata de sentir');
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute(
    'content',
    /noindex/,
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/historia$/,
  );
});

test('enlaces y contenido siguen disponibles sin JavaScript', async ({
  browser,
  baseURL,
}, testInfo) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: testInfo.project.use.viewport,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.footer a[href="/catalogo"]').click();
  await expect(page).toHaveURL(/\/catalogo$/);
  await expect(page.locator('h1')).toContainText('de emociones');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/catalogo$/,
  );
  await page.locator('.product-card h3 a').first().click();
  await expect(page.locator('.detail-copy h1')).toBeVisible();
  await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(
    1,
  );
  await context.close();
});

test('atrás, adelante y anclas mantienen la navegación nativa', async ({
  page,
}) => {
  await observeNavigation(page);
  await page.goto('/');
  await page.locator('.footer a[href="/catalogo"]').click();
  await expect(page).toHaveURL(/\/catalogo$/);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('h1')).toContainText('Flores que te');
  await page.goForward();
  await expect(page).toHaveURL(/\/catalogo$/);
  await page.locator('.footer a[href="/historia"]').click();
  await expect(page).toHaveURL(/\/historia$/);
  const beforeAnchor = await page.evaluate(() => window.__frissonPageId);
  await page.locator('.footer a[href="/historia#inspiracion"]').click();
  await expect(page).toHaveURL(/\/historia#inspiracion$/);
  expect(await page.evaluate(() => window.__frissonPageId)).toBe(beforeAnchor);
  await expect(page.locator('#inspiracion')).toBeInViewport();
});
