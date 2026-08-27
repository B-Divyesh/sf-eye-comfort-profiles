import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/privacy/', '/terms/']) {
  test(`${path} has clean serious accessibility results`, async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter(({ impact }) => impact === 'serious' || impact === 'critical')).toEqual([]);
    expect(consoleErrors).toEqual([]);
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
