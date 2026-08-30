import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/privacy/', '/terms/']) {
  test(`${path} has clean serious accessibility results`, async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];
    const failedRequests: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('requestfailed', (request) => failedRequests.push(request.url()));
    await page.goto(path);
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/\S+ — Eye Comfort Profiles|Eye Comfort Profiles — \S+/);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([]);
    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
    expect(failedRequests).toEqual([]);
  });
}

test('home preview responds and the layout does not overflow', async ({ page }) => {
  await page.goto('/');
  await page.locator('#demo-size').fill('24');
  await expect(page.locator('#demo-size-value')).toHaveText('24 px');
  await page.getByLabel('Slate').check();
  await expect(page.locator('#reading-preview')).toHaveAttribute('data-surface', 'slate');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('@claim:sample-demo opens sample settings in one click and saves nothing', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('#demo-size-value')).toHaveText('24 px');
  await expect(page.locator('#demo-space-value')).toHaveText('1.80×');
  await expect(page.locator('#demo-width-value')).toHaveText('52 ch');
  await expect(page.locator('#reading-preview')).toHaveAttribute('data-surface', 'slate');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);

  await page.locator('#demo-size').fill('28');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#demo-size-value')).toHaveText('24 px');
});

test('@claim:first-party-site sends no third-party runtime requests', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/?demo=1');
  await page.locator('#demo-size').fill('26');
  await page.getByLabel('High').check();
  expect([...origins]).toEqual(['http://127.0.0.1:4173']);
});

test('keyboard controls and designed focus remain usable', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to main content' })).toBeFocused();
  await page.locator('#demo-size').focus();
  await page.keyboard.press('End');
  await expect(page.locator('#demo-size-value')).toHaveText('28 px');
  const focus = await page.locator('#demo-size').evaluate((element) => {
    const style = getComputedStyle(element);
    return { style: style.outlineStyle, width: parseFloat(style.outlineWidth), color: style.outlineColor };
  });
  expect(focus.style).not.toBe('none');
  expect(focus.width).toBeGreaterThanOrEqual(3);
});

test('reduced motion removes meaningful transitions', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const durations = await page.locator('.button').first().evaluate((element) => {
    const style = getComputedStyle(element);
    return [style.animationDuration, style.transitionDuration];
  });
  expect(durations.every((value) => value.split(',').every((duration) => parseFloat(duration) <= 0.001))).toBe(true);
});

test('supporter CTA uses the live Sociobot checkout mapping', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#checkout-link')).toHaveAttribute(
    'href',
    'https://api.sociobot.in/api/v1/products/eye-comfort-profiles/checkout'
  );
  await expect(page.getByText('$19', { exact: true })).toBeVisible();
});
