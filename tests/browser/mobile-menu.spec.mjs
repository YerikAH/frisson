import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 390, height: 844 } });
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    sessionStorage.setItem('frisson-intro-seen-v1', '1'),
  );
  await page.goto('/');
});

async function openMenu(page) {
  await page.mouse.wheel(0, -120);
  await expect(page.locator('[data-scroll-header]')).toHaveAttribute(
    'data-hidden',
    'false',
  );
  await page.locator('.menu-toggle').click();
  const panel = page.locator('#mobile-menu');
  await expect(panel).toHaveAttribute('open');
  return panel;
}
async function fullScreen(page) {
  const bounds = await page.locator('#mobile-menu').boundingBox();
  const viewport = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
  }));
  expect(Math.abs(bounds.x)).toBeLessThan(1);
  expect(Math.abs(bounds.y)).toBeLessThan(1);
  expect(Math.abs(bounds.width - viewport.width)).toBeLessThan(1);
  expect(Math.abs(bounds.height - viewport.height)).toBeLessThan(1);
}

test('menú ocupa toda la pantalla y bloquea el fondo en móvil y tablet', async ({
  page,
}) => {
  for (const viewport of [
    { width: 320, height: 568 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 844, height: 390 },
  ]) {
    await page.setViewportSize(viewport);
    const panel = await openMenu(page);
    await expect(panel).toHaveCSS('clip-path', 'none');
    await fullScreen(page);
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    const backgroundY = await page.evaluate(() => scrollY);
    await panel.hover();
    await page.mouse.wheel(0, 700);
    expect(await page.evaluate(() => scrollY)).toBe(backgroundY);
    await panel.locator('[data-close-menu]').click();
    await expect(panel).not.toHaveAttribute('open');
    await expect(page.locator('.menu-toggle')).toBeFocused();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test('aperturas y cierres interrumpidos responden a la última acción', async ({
  page,
}) => {
  const toggle = page.locator('.menu-toggle');
  const panel = page.locator('#mobile-menu');
  for (let i = 0; i < 3; i++) await toggle.dispatchEvent('click');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(panel).toHaveAttribute('open');
  await page.keyboard.press('Escape');
  await expect(panel).not.toHaveAttribute('open');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.waitForTimeout(90);
  await panel.locator('[data-close-menu]').dispatchEvent('click');
  await page.waitForTimeout(70);
  await toggle.dispatchEvent('click');
  await expect(panel).toHaveCSS('clip-path', 'none');
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await fullScreen(page);
  await panel.locator('[data-close-menu]').click();
  await expect(panel).not.toHaveAttribute('open');
});

test('el foco permanece en el menú y Escape lo devuelve al botón', async ({
  page,
}) => {
  const panel = await openMenu(page);
  await expect(panel.locator('[data-close-menu]')).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(panel.locator('.mobile-menu-link').first()).toBeFocused();
  await expect(panel.locator('[data-menu-text]').first()).toHaveCSS(
    'opacity',
    '1',
  );
  await expect(panel).toHaveCSS('clip-path', 'none');
  const last = panel.locator('a').last();
  await last.focus();
  await page.keyboard.press('Tab');
  await expect(panel.locator('.mobile-menu-brand')).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(last).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(panel).not.toHaveAttribute('open');
  await expect(page.locator('.menu-toggle')).toBeFocused();
});

test('movimiento reducido y cambio a escritorio dejan la navegación disponible', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const panel = await openMenu(page);
  await expect(panel).toHaveCSS('clip-path', 'none');
  await expect(panel.locator('[data-menu-text]').first()).toHaveCSS(
    'transform',
    'none',
  );
  await fullScreen(page);
  await page.setViewportSize({ width: 1280, height: 900 });
  await expect(panel).not.toHaveAttribute('open');
  await expect(page.locator('.menu-toggle')).toHaveAttribute(
    'aria-expanded',
    'false',
  );
  await expect(page.locator('.nav-left')).toBeVisible();
  await expect(page.locator('body')).toHaveCSS('overflow', 'visible');
});

test('los enlaces conservan navegación HTML, estado activo y anclas', async ({
  page,
}) => {
  let panel = await openMenu(page);
  await panel.locator('.mobile-menu-link[href="/#colecciones"]').click();
  await expect(panel).not.toHaveAttribute('open');
  await expect(page).toHaveURL(/#colecciones$/);
  await expect(page.locator('#colecciones')).toBeInViewport();
  panel = await openMenu(page);
  const response = page.waitForResponse(
    (response) =>
      response.request().isNavigationRequest() &&
      new URL(response.url()).pathname === '/catalogo',
  );
  await panel.locator('.mobile-menu-link[href="/catalogo"]').click();
  expect((await response).headers()['content-type']).toContain('text/html');
  await expect(page).toHaveURL(/\/catalogo$/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    /\/catalogo$/,
  );
  await expect(page.locator('#mobile-menu')).not.toHaveAttribute('open');
  panel = await openMenu(page);
  await expect(
    panel.locator('.mobile-menu-link[href="/catalogo"]'),
  ).toHaveAttribute('aria-current', 'page');
});
