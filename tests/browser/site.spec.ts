import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

for (const path of ['/', '/privacy/', '/terms/', '/404.html']) {
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
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', /Eye Comfort Profiles/);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary_large_image');
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /social-preview\.jpg$/);
    await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute('href', '/favicon.svg');
    await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', '/apple-touch-icon.png');
    await expect(page.locator('footer')).toContainText('Built by Param Factory');
    await expect(page.locator('footer')).toContainText('v1.0.2');
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

test('@claim:sample-demo opens sample settings in one click and saves nothing', async ({ page, browser }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveTitle('Demo — Eye Comfort Profiles');
  await expect(page.locator('#demo-banner')).toBeVisible();
  await expect(page.locator('#demo-size-value')).toHaveText('24 px');
  await expect(page.locator('#demo-space-value')).toHaveText('1.80×');
  await expect(page.locator('#demo-width-value')).toHaveText('52 ch');
  await expect(page.locator('#reading-preview')).toHaveAttribute('data-surface', 'slate');
  expect(await page.evaluate(() => localStorage.length)).toBe(0);

  await page.locator('#demo-size').fill('28');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.locator('#demo-size-value')).toHaveText('24 px');
  await page.getByRole('link', { name: 'Leave demo' }).click();
  await expect(page).toHaveURL('/');

  const isolatedContext = await browser.newContext();
  await isolatedContext.addInitScript(() => {
    localStorage.setItem('sb_license:eye-comfort-profiles', 'real-license-token');
    localStorage.setItem('sb_license:eye-comfort-profiles:verdict', JSON.stringify({ valid: true, checkedAt: 1 }));
  });
  const isolatedPage = await isolatedContext.newPage();
  const demoRequests: string[] = [];
  isolatedPage.on('request', (request) => demoRequests.push(request.url()));
  await isolatedPage.goto('/?demo=1#controls');
  await expect(isolatedPage.locator('#demo-banner')).toBeVisible();
  await expect(isolatedPage.locator('#license-message')).toBeEmpty();
  expect(await isolatedPage.evaluate(() => ({
    token: localStorage.getItem('sb_license:eye-comfort-profiles'),
    verdict: localStorage.getItem('sb_license:eye-comfort-profiles:verdict')
  }))).toEqual({
    token: 'real-license-token',
    verdict: JSON.stringify({ valid: true, checkedAt: 1 })
  });
  expect(demoRequests.every((url) => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
  await isolatedContext.close();
});

test('demo notice and its reset actions remain visible after a 390px reader scroll', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
  await expect(page.locator('#demo-banner')).toBeVisible();
  const banner = await page.locator('#demo-banner').boundingBox();
  const viewport = page.viewportSize();
  expect(banner).not.toBeNull();
  expect(viewport).not.toBeNull();
  expect(banner!.y).toBeGreaterThanOrEqual(0);
  expect(banner!.y + banner!.height).toBeLessThanOrEqual(viewport!.height);
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Leave demo' })).toBeVisible();
});

test('@claim:first-party-site sends no third-party runtime requests', async ({ page }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/?demo=1');
  await page.locator('#demo-size').fill('26');
  await page.getByLabel('High contrast').check();
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

test('same-site legal navigation focuses and announces each destination heading', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Privacy' }).first().click();
  await expect(page).toHaveURL('/privacy/');
  await expect(page.getByRole('heading', { name: 'Privacy', level: 1 })).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Privacy — Eye Comfort Profiles');

  await page.goBack();
  await expect(page).toHaveURL('/');
  await expect(page.getByRole('heading', { name: /Save reading settings for each website/i, level: 1 })).toBeFocused();
  await expect(page.locator('#route-announcer')).toHaveText('Eye Comfort Profiles — Save settings by website');
});

test('every route uses the same primary destinations', async ({ page }) => {
  const destinations: ReadonlyArray<readonly [string, string]> = [
    ['Demo', '/?demo=1#controls'],
    ['How it works', '/#how'],
    ['Controls', '/#controls'],
    ['Privacy', '/privacy/']
  ];

  for (const path of ['/', '/privacy/', '/terms/', '/404.html']) {
    await page.goto(path);
    const links = page.locator('header nav a');
    await expect(links).toHaveCount(destinations.length);
    for (const [index, [name, href]] of destinations.entries()) {
      await expect(links.nth(index)).toHaveText(name);
      await expect(links.nth(index)).toHaveAttribute('href', href);
    }
  }
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

test('@claim:supporter-price offers the $19 one-time supporter unlock without gating reading controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#checkout-link')).toHaveAttribute(
    'href',
    'https://api.sociobot.in/api/v1/products/eye-comfort-profiles/checkout'
  );
  await expect(page.getByText('$19', { exact: true })).toBeVisible();
  await expect(page.getByText('No subscription', { exact: true })).toBeVisible();
  await expect(page.getByText(/every comfort control.*remain free/i)).toBeVisible();
});

test('@claim:comfort-not-medical-advice states the extension medical boundary plainly', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Comfort settings, not medical advice.' })).toBeVisible();
  await expect(page.locator('.care-note p').last()).toContainText('It does not test, diagnose, prevent, or treat any eye condition.');
});
