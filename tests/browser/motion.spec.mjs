import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Isolate interaction checks from the first-visit brand introduction.
  await page.addInitScript(() =>
    sessionStorage.setItem('frisson-intro-seen-v1', '1'),
  );
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'warning' && /GSAP/.test(message.text()))
      errors.push(message.text());
  });
  page.__motionErrors = errors;
});
test.afterEach(async ({ page }) => expect(page.__motionErrors).toEqual([]));

async function home(page) {
  await page.goto('/');
  await expect(page.locator('[data-scroll-header] astro-slot')).toBeAttached();
  await expect(page.locator('[data-scroll-header] .header')).toHaveAttribute(
    'data-nav-indicator',
    '',
  );
  await page.locator('.hero-bouquet-image').evaluate((image) => image.decode());
}

test('portada conserva geometría, centrado y lectura; entradas sin saltos', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    window.__layoutShifts = [];
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.__layoutShifts.push(entry.value);
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await home(page);
  await page.waitForTimeout(1500);
  await expect(page.locator('h1')).toHaveText('Flores que tehacen sentir.');
  const geometry = await page.evaluate(() => {
    const bouquet = document
      .querySelector('.hero-bouquet')
      .getBoundingClientRect();
    return {
      width: document.documentElement.scrollWidth,
      viewport: innerWidth,
      centered: Math.abs(bouquet.x + bouquet.width / 2 - innerWidth / 2),
      cls: window.__layoutShifts.reduce((a, b) => a + b, 0),
    };
  });
  expect(geometry.width).toBeLessThanOrEqual(geometry.viewport);
  expect(geometry.centered).toBeLessThan(1);
  expect(geometry.cls).toBeLessThan(0.02);
  await page.screenshot({ path: testInfo.outputPath('portada.png') });
});

test('variedades: última selección, decodificación, panel estable y teclado', async ({
  page,
}) => {
  await home(page);
  const panel = page.locator('#variety-panel');
  await panel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  const before = await panel.boundingBox();
  const tabs = page.locator('[data-variety]');
  for (const i of [1, 4, 2, 3, 4]) await tabs.nth(i).click();
  await expect(panel).not.toHaveAttribute('aria-busy');
  await expect(tabs.nth(4)).toHaveAttribute('aria-selected', 'true');
  await expect(panel).toHaveAttribute('aria-labelledby', 'variety-4');
  await expect(page.locator('#variety-image')).toHaveAttribute(
    'src',
    /flores-amarillas/,
  );
  await expect(page.locator('#variety-text')).toContainText(
    'La belleza de lo que florece hoy',
  );
  await expect(page.locator('#variety-link')).toHaveAttribute(
    'href',
    /De%20temporada/,
  );
  expect(
    Math.abs((await panel.boundingBox()).height - before.height),
  ).toBeLessThan(2);
  await tabs.nth(4).press('Home');
  await expect(tabs.first()).toBeFocused();
  await expect(panel).toHaveAttribute('aria-labelledby', 'variety-0');
  await tabs.first().press('End');
  await tabs.last().press('ArrowRight');
  await expect(tabs.first()).toBeFocused();
  await expect(panel).not.toHaveAttribute('aria-busy');
});

test('acordeones interrumpidos y formulario conservan datos y foco', async ({
  page,
}) => {
  await home(page);
  const details = page.locator('.personalize-details');
  const summary = details.locator('summary');
  await summary.scrollIntoViewIfNeeded();
  await summary.dispatchEvent('click');
  await page.waitForTimeout(65);
  await summary.dispatchEvent('click');
  await page.waitForTimeout(65);
  await summary.dispatchEvent('click');
  const name = details.locator('[name="nombre"]');
  await name.fill('María');
  await expect(name).toBeFocused();
  await summary.press('Enter');
  await expect(details).not.toHaveAttribute('open');
  await summary.press('Space');
  await expect(name).toHaveValue('María');
  await expect(details.locator('[data-details-body]')).not.toHaveAttribute(
    'style',
    /height/,
  );
  const faqs = page.locator('.faq details');
  await faqs.first().locator('summary').scrollIntoViewIfNeeded();
  await faqs.first().locator('summary').dispatchEvent('click');
  await page.waitForTimeout(60);
  await faqs.first().locator('summary').dispatchEvent('click');
  await expect(faqs.first()).not.toHaveAttribute('open');
  await faqs.first().locator('summary').press('Enter');
  await faqs.nth(1).locator('summary').press('Enter');
  await expect(faqs.first()).toHaveAttribute('open');
  await expect(faqs.nth(1)).toHaveAttribute('open');
});

test('selección, cantidades y diálogos conservan foco y Escape', async ({
  page,
}) => {
  await home(page);
  const add = page.locator('[data-add-product]').first();
  await add.scrollIntoViewIfNeeded();
  await add.focus();
  await add.press('Enter');
  await expect(page.locator('.toast')).toContainText('se añadió');
  await page.keyboard.press('Tab');
  const opener = page.locator('[data-open-cart]');
  // Keyboard focus restores the hidden navigation before opening the native modal.
  await opener.focus();
  await opener.press('Enter');
  const dialog = page.locator('#cart-dialog');
  await expect(dialog).toHaveAttribute('open');
  await expect(page.locator('.whatsapp-float')).toBeHidden();
  const plus = dialog.locator('[data-increment]');
  await plus.click();
  await plus.click();
  await expect(plus).toBeFocused();
  await expect(dialog.locator('[data-quantity]')).toHaveText('3');
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open');
  await expect(opener).toBeFocused();
  await opener.press('Enter');
  await dialog.locator('.remove-product').click();
  await expect(dialog.locator('[data-cart-id]')).toHaveCount(0);
  await expect(dialog.locator('.cart-empty')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toHaveAttribute('open');
  const search = page.locator('[data-open-search]');
  await search.focus();
  await search.press('Enter');
  await page.locator('#search-input').fill('lirios');
  await expect(page.locator('#search-results a').first()).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('#search-dialog')).not.toHaveAttribute('open');
  await expect(search).toBeFocused();
});

test('filtros rápidos conservan contador, aria-pressed y elementos ocultos', async ({
  page,
}) => {
  await page.goto('/catalogo');
  const filters = page.locator('[data-filter]');
  for (const i of [1, 3, 4, 2, 0, 1]) await filters.nth(i).click();
  await expect(filters.nth(1)).toHaveAttribute('aria-pressed', 'true');
  const visible = page.locator('.catalog-grid .product-card:not([hidden])');
  const count = await visible.count();
  await expect(page.locator('#catalog-count')).toContainText(String(count));
  const categories = await visible.evaluateAll((cards) =>
    cards.map((card) => card.dataset.category),
  );
  expect(categories.every((category) => category === 'Ramos franceses')).toBe(
    true,
  );
  expect(
    await page
      .locator('.catalog-grid .product-card[hidden] a')
      .evaluateAll((links) => links.every((a) => !a.checkVisibility())),
  ).toBe(true);
  await filters.first().click();
  await expect(page.locator('.catalog-grid .product-card[hidden]')).toHaveCount(
    0,
  );
});

test('delivery inmediato y galería nativa con restauración del foco', async ({
  page,
}) => {
  await home(page);
  await page.locator('#delivery-zone').selectOption('Chilca');
  await expect(page.locator('#delivery-result')).toContainText('Chilca');
  await expect(page.locator('#delivery-result')).toHaveAttribute(
    'aria-live',
    'polite',
  );
  const image = page.locator('[data-gallery-image]').first();
  await image.click();
  await expect(page.locator('#gallery-dialog')).toHaveAttribute('open');
  await page.keyboard.press('Escape');
  await expect(page.locator('#gallery-dialog')).not.toHaveAttribute('open');
  await expect(image).toBeFocused();
});

test('header conserva rama, fondo, altura, dirección y teclado', async ({
  page,
}, testInfo) => {
  await home(page);
  const header = page.locator('[data-scroll-header]');
  const branch = header.locator('.wordmark [role="img"] > span').first();
  const mobile = testInfo.project.name === 'mobile';
  await expect(header).toHaveCSS('height', mobile ? '112px' : '128px');
  await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(branch).toHaveCSS('opacity', '1');
  await expect(branch).toHaveCSS('height', mobile ? '56px' : '64px');
  if (!mobile)
    await expect(header.locator('.wordmark')).not.toHaveCSS(
      'background-color',
      'rgba(0, 0, 0, 0)',
    );
  if (testInfo.project.name === 'mobile') {
    const toggle = page.locator('.menu-toggle');
    for (let i = 0; i < 3; i++) await toggle.dispatchEvent('click');
    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#mobile-menu')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#mobile-menu')).toBeHidden();
    await expect(toggle).toBeFocused();
  }
  await page.locator('main').focus();
  await page.mouse.move(0, 0);
  await page.evaluate(() => scrollTo({ top: 750, behavior: 'instant' }));
  await expect(page.locator('[data-scroll-header]')).toHaveAttribute(
    'data-hidden',
    'true',
  );
  await page.evaluate(() => scrollTo({ top: 700, behavior: 'instant' }));
  await expect(page.locator('[data-scroll-header]')).toHaveAttribute(
    'data-hidden',
    'false',
  );
  await expect(header).toHaveCSS('height', mobile ? '64px' : '72px');
  await expect(branch).toHaveCSS('height', '0px');
  await expect(branch).toHaveCSS('opacity', '0');
  await expect(header).not.toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await expect(header.locator('.wordmark')).toHaveCSS(
    'background-color',
    'rgba(0, 0, 0, 0)',
  );
  await page.evaluate(() => scrollTo({ top: 850, behavior: 'instant' }));
  await expect(page.locator('[data-scroll-header]')).toHaveAttribute(
    'data-hidden',
    'true',
  );
  await page.keyboard.press('Tab');
  await expect(page.locator('[data-scroll-header]')).toHaveAttribute(
    'data-hidden',
    'false',
  );
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(header).toHaveAttribute('data-scrolled', 'false');
  await expect(header).toHaveCSS('height', mobile ? '112px' : '128px');
  await expect(branch).toHaveCSS('opacity', '1');
  await expect(header).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
});

test('movimiento reducido y cambios de preferencia dejan contenido y controles disponibles', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await home(page);
  expect(
    await page
      .locator('.hero-bouquet-image')
      .evaluate((e) => getComputedStyle(e).transform),
  ).toBe('none');
  await page.locator('[data-variety]').nth(2).click();
  await expect(page.locator('#variety-panel')).not.toHaveAttribute('aria-busy');
  await expect(page.locator('#variety-image')).toHaveCSS('opacity', '1');
  await page.locator('.faq summary').first().click();
  await expect(page.locator('.faq details').first()).toHaveAttribute('open');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.locator('.personalize-details summary').dispatchEvent('click');
  await page.waitForTimeout(75);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(
    page.locator('.personalize-details [name="nombre"]'),
  ).toBeVisible();
  for (const fieldset of await page
    .locator('.personalize-details fieldset')
    .all())
    await expect(fieldset).toHaveCSS('opacity', '1');
  await expect(
    page.locator('.personalize-details [data-details-body]'),
  ).not.toHaveAttribute('style', /height/);
});

test('páginas interiores, validación y resumen inmediato', async ({ page }) => {
  for (const path of [
    '/historia',
    '/contacto',
    '/privacidad',
    '/terminos',
    '/404',
    '/catalogo/ramo-frances',
  ]) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.goto('/personalizados');
  await page.locator('[name="nombre"]').fill('María');
  await page.locator('[name="tipo"]').selectOption('Ramo francés');
  await page.locator('[name="destinatario"]').fill('Ana');
  await page.locator('[name="direccion"]').fill('Calle Flores 123');
  const date = page.locator('[name="fecha"]');
  await date.fill(await date.getAttribute('min'));
  await page.locator('[name="zona"]').selectOption('Chilca');
  await page.locator('[name="horario"]').fill('14:00');
  await page.locator('input[type="checkbox"]').check();
  await page.locator('[type="submit"]').click();
  await expect(page.locator('#request-dialog')).toHaveAttribute('open');
  await expect(page.locator('#request-message')).toContainText('María');
  await page.keyboard.press('Escape');
  await expect(page.locator('[name="nombre"]')).toHaveValue('María');
  await page.goto('/pedido');
  await expect(page.locator('[name="nombre"]')).toHaveValue('María');
});

test('sin JavaScript conserva textos, recortes y details nativos', async ({
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
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.hero-bouquet-image')).toBeVisible();
  await page.locator('.personalize-details summary').click();
  await expect(
    page.locator('.personalize-details [name="nombre"]'),
  ).toBeVisible();
  await context.close();
});

test('una imagen lenta anterior nunca reemplaza la última variedad y los fallos se recuperan', async ({
  page,
}) => {
  await home(page);
  await page.route('**/images/arreglo-macetero.webp', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 450));
    await route.continue();
  });
  const tabs = page.locator('[data-variety]');
  await tabs.nth(1).click();
  await tabs.last().click();
  await expect(page.locator('#variety-panel')).not.toHaveAttribute('aria-busy');
  await page.waitForTimeout(500);
  await expect(page.locator('#variety-image')).toHaveAttribute(
    'src',
    /flores-amarillas/,
  );
  await page.route('**/images/arreglo-florero.webp', (route) => route.abort());
  await tabs.nth(2).click();
  await expect(page.locator('#variety-panel')).not.toHaveAttribute('aria-busy');
  await expect(tabs.last()).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#variety-image')).toHaveCSS('opacity', '1');
});

test('Escape durante la apertura del diálogo completa el cierre y restaura el foco', async ({
  page,
}) => {
  await home(page);
  const search = page.locator('[data-open-search]');
  await search.focus();
  await search.press('Enter');
  await page.keyboard.press('Escape');
  await expect(page.locator('#search-dialog')).not.toHaveAttribute('open');
  await expect(search).toBeFocused();
  await search.press('Enter');
  await page.locator('#search-input').fill('rosas');
  await expect(page.locator('#search-results a').first()).toBeVisible();
});
