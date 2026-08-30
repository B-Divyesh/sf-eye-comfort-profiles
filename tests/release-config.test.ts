import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BILLING_BASE, checkoutUrl } from '../shared/license';
import { PRODUCT_SLUG } from '../shared/model';

const staticConfig = JSON.parse(readFileSync('site/public/staticwebapp.config.json', 'utf8')) as {
  globalHeaders: Record<string, string>;
  routes: Array<{ route: string; headers: Record<string, string> }>;
  responseOverrides: Record<string, { rewrite: string; statusCode: number }>;
};
const popupHtml = readFileSync('entrypoints/popup/index.html', 'utf8');
const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as { scripts: Record<string, string> };
const productionDeploy = readFileSync('scripts/deploy-production.mjs', 'utf8');
const liveVerification = readFileSync('scripts/verify-live-release.mjs', 'utf8');

describe('release configuration', () => {
  it('uses the live $19 Sociobot checkout mapping', () => {
    expect(BILLING_BASE).toBe('https://api.sociobot.in/api/v1');
    expect(checkoutUrl()).toBe(`https://api.sociobot.in/api/v1/products/${PRODUCT_SLUG}/checkout`);
  });

  it('uses a designed 404 response and caches hashed assets immutably', () => {
    expect(staticConfig.responseOverrides['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
    expect(readFileSync('site/404.html', 'utf8')).toContain('<h1>That page is not here.</h1>');
    expect(liveVerification).toContain("new URL('/this-route-does-not-exist', site)");
    expect(liveVerification).toContain('missing.status !== 404');
    expect(staticConfig.routes).toContainEqual({
      route: '/assets/*',
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }
    });
  });

  it('deploys the complete site directory and verifies the public extension archive afterwards', () => {
    expect(packageJson.scripts['deploy:production']).toBe('node scripts/deploy-production.mjs');
    expect(productionDeploy).toContain("run('/opt/fleet/lib/deploy-static.sh', [slug, directory]);");
    expect(productionDeploy).toContain("spawnSync(process.execPath, ['scripts/verify-live-release.mjs']");
    expect(productionDeploy).toContain('for (;;)');
    expect(productionDeploy).toContain("`${directory}/downloads/eye-comfort-profiles-chrome.zip`");
  });

  it('stages the extension archive from the factory static build entry point', () => {
    expect(packageJson.scripts['build:site']).toBe(
      'vite build --config vite.site.config.ts && npm run package:extension'
    );
    expect(packageJson.scripts['test:release']).toBe(
      'npm run clean && npm run build:site && vitest run tests/release-artifact.test.ts'
    );
  });

  it('ships the required static response hardening policies', () => {
    const headers = staticConfig.globalHeaders;
    expect(headers['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    expect(headers['Content-Security-Policy']).toContain('connect-src \'self\' https://api.sociobot.in');
    expect(headers['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(headers['Permissions-Policy']).toContain('camera=()');
    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
  });

  it('lets keyboard users reach the advertised maximum focus-band height', () => {
    const control = popupHtml.match(/<input id="focus-height"[^>]+>/)?.[0];
    expect(control).toBeDefined();
    const min = Number(control?.match(/min="(\d+)"/)?.[1]);
    const max = Number(control?.match(/max="(\d+)"/)?.[1]);
    const step = Number(control?.match(/step="(\d+)"/)?.[1]);
    expect((max - min) % step).toBe(0);
    expect(max).toBe(180);
  });
});
