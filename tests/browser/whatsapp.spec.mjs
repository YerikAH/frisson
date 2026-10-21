import { test, expect } from '@playwright/test';

async function openHome(page) {
  await page.addInitScript(() =>
    sessionStorage.setItem('frisson-intro-seen-v1', '1'),
  );
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
}
async function passOpening(page, offset = 16) {
  await page.evaluate((offset) => {
    const sections = document.querySelectorAll(
      '#contenido > section, #contenido > article',
    );
    const end = sections[1].getBoundingClientRect().bottom + scrollY;
    scrollTo({ top: Math.ceil(end) + offset, behavior: 'instant' });
  }, offset);
}

test('WhatsApp permanece oculto en las dos primeras secciones y reaparece al bajar', async ({
  page,
}) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openHome(page);
  const button = page.locator('.whatsapp-float');
  await expect(button).toBeHidden();
  await page.evaluate(() => {
    const collection = document.querySelector('.collections');
    scrollTo({
      top: collection.offsetTop + collection.offsetHeight / 2,
      behavior: 'instant',
    });
  });
  await expect(button).toBeHidden();
  await passOpening(page);
  await expect(button).toBeVisible();
  await expect(button).toHaveCSS('opacity', '1');
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(button).toBeHidden();
  await passOpening(page);
  await expect(button).toBeVisible();
  await expect(button).toHaveCSS('opacity', '1');
  expect(errors).toEqual([]);
});

test('WhatsApp respeta movimiento reducido, cambios de tamaño y diálogos', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openHome(page);
  const button = page.locator('.whatsapp-float');
  await expect(button).toBeHidden();
  await passOpening(page, 500);
  await expect(button).toBeVisible();
  await expect(button).toHaveCSS('transform', 'none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(button).toBeVisible();
  await page.mouse.wheel(0, -100);
  await expect(page.locator('[data-scroll-header]')).toHaveAttribute(
    'data-hidden',
    'false',
  );
  await page.locator('[data-open-cart]').click();
  await expect(page.locator('#cart-dialog')).toHaveAttribute('open');
  await expect(button).toBeHidden();
  await page.keyboard.press('Escape');
  await expect(page.locator('#cart-dialog')).not.toHaveAttribute('open');
  await expect(button).toBeVisible();
  await page.setViewportSize({ width: 900, height: 800 });
  await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await expect(button).toBeHidden();
  await passOpening(page);
  await expect(button).toBeVisible();
});
