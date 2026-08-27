import { browser } from 'wxt/browser';
import { PRODUCT_SLUG, STORAGE_KEY, normalizeSettings, normalizeState, type ProfileSettings } from '../shared/model';
import { LICENSE_KEY } from '../shared/license';

const STYLE_ID = 'eye-comfort-profiles-style';
const BAND_ID = 'eye-comfort-profiles-band';

const fonts: Record<ProfileSettings['fontFamily'], string> = {
  system: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  humanist: '"Trebuchet MS", "Segoe UI", Candara, system-ui, sans-serif',
  serif: 'Charter, "Bitstream Charter", Georgia, serif',
  mono: 'ui-monospace, "Cascadia Mono", "Segoe UI Mono", Consolas, monospace'
};

const themes: Record<ProfileSettings['theme'], string> = {
  original: '',
  paper: `
    html, body { background-color: #f3eddf !important; color: #242925 !important; }
    :where(article, main, [role="main"]) { background-color: #f3eddf !important; }
    :where(article, main, [role="main"], p, li, blockquote, dd, dt, h1, h2, h3, h4) { color: #242925 !important; }
    :where(a) { color: #075d68 !important; }
  `,
  slate: `
    html, body { background-color: #1c2526 !important; color: #e8e3d7 !important; }
    :where(article, main, [role="main"]) { background-color: #1c2526 !important; }
    :where(article, main, [role="main"], p, li, blockquote, dd, dt, h1, h2, h3, h4) { color: #e8e3d7 !important; }
    :where(a) { color: #8dd5d2 !important; }
  `,
  contrast: `
    html, body { background-color: #fff !important; color: #111 !important; }
    :where(article, main, [role="main"]) { background-color: #fff !important; }
    :where(article, main, [role="main"], p, li, blockquote, dd, dt, h1, h2, h3, h4) { color: #111 !important; }
    :where(a) { color: #0046a8 !important; text-decoration-thickness: .12em !important; }
  `
};

function cssFor(input: ProfileSettings): string {
  const settings = normalizeSettings(input);
  return `
    body {
      font-family: ${fonts[settings.fontFamily]} !important;
      font-size: ${settings.fontSize}px !important;
      line-height: ${settings.lineHeight} !important;
      letter-spacing: ${settings.letterSpacing}em !important;
    }
    :where(article, main, [role="main"]) :where(p, li, blockquote, dd, dt, pre) {
      max-inline-size: ${settings.lineWidth}ch !important;
      line-height: ${settings.lineHeight} !important;
      letter-spacing: ${settings.letterSpacing}em !important;
    }
    :where(article, main, [role="main"]) :where(p, blockquote, pre) {
      margin-inline-end: auto !important;
    }
    ${themes[settings.theme]}
  `;
}

function removeBand(): void {
  document.getElementById(BAND_ID)?.remove();
}

function updateBand(settings: ProfileSettings): void {
  removeBand();
  if (!settings.focusBand || !document.documentElement) return;
  const band = document.createElement('div');
  band.id = BAND_ID;
  band.setAttribute('aria-hidden', 'true');
  Object.assign(band.style, {
    position: 'fixed',
    zIndex: '2147483646',
    pointerEvents: 'none',
    insetInline: '0',
    top: 'calc(50% - 48px)',
    height: `${settings.focusHeight}px`,
    background: 'rgba(242, 184, 104, 0.13)',
    borderBlock: '1px solid rgba(135, 83, 18, 0.24)',
    boxShadow: '0 -100vh 0 100vh rgba(16, 24, 23, 0.34)',
    transition: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'none' : 'top 120ms ease-out'
  });
  document.documentElement.append(band);
}

function setBandCenter(y: number): void {
  const band = document.getElementById(BAND_ID);
  if (!band) return;
  const height = band.getBoundingClientRect().height;
  band.style.top = `${Math.max(0, Math.min(innerHeight - height, y - height / 2))}px`;
}

function apply(settings: ProfileSettings | null): void {
  document.getElementById(STYLE_ID)?.remove();
  removeBand();
  if (!settings) return;
  const normalized = normalizeSettings(settings);
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = cssFor(normalized);
  (document.head ?? document.documentElement).append(style);
  updateBand(normalized);
}

async function applyAssigned(): Promise<void> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  const state = normalizeState(stored[STORAGE_KEY]);
  const profileId = state.assignments[location.hostname];
  const profile = state.profiles.find(({ id }) => id === profileId);
  apply(profile?.settings ?? null);
}

function captureCheckoutLicense(): void {
  if (location.hostname !== `${PRODUCT_SLUG}.sociobot.in`) return;
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return;
  browser.storage.local.set({ [LICENSE_KEY]: token });
}

export default defineContentScript({
  matches: ['http://*/*', 'https://*/*'],
  runAt: 'document_start',
  main() {
    captureCheckoutLicense();
    void applyAssigned();
    browser.runtime.onMessage.addListener((message: unknown) => {
      const value = message as { type?: string; settings?: ProfileSettings };
      if (value.type === 'ECP_PREVIEW' && value.settings) apply(value.settings);
      if (value.type === 'ECP_CLEAR') apply(null);
    });
    browser.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && STORAGE_KEY in changes) void applyAssigned();
    });
    addEventListener('pointermove', (event) => setBandCenter(event.clientY), { passive: true });
    addEventListener('touchmove', (event) => {
      const touch = event.touches[0];
      if (touch) setBandCenter(touch.clientY);
    }, { passive: true });
    addEventListener('focusin', (event) => {
      if (event.target instanceof Element) {
        const rect = event.target.getBoundingClientRect();
        setBandCenter(rect.top + rect.height / 2);
      }
    });
  }
});
