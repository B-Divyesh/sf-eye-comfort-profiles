import { PRODUCT_SLUG } from './model';

export const LICENSE_KEY = `sb_license:${PRODUCT_SLUG}`;
const VERDICT_KEY = `${LICENSE_KEY}:verdict`;
const BILLING_BASE = 'https://pilot-api.sociobot.in/api/v1';
const DAY = 86_400_000;

export interface LicenseVerdict {
  valid: boolean;
  reason: string;
  expires_at?: string | null;
  checkedAt: number;
}

export function checkoutUrl(): string {
  return `${BILLING_BASE}/products/${PRODUCT_SLUG}/checkout`;
}

export function saveLicense(token: string): void {
  localStorage.setItem(LICENSE_KEY, token.trim());
  localStorage.removeItem(VERDICT_KEY);
}

export function captureLicenseFromUrl(): boolean {
  const url = new URL(location.href);
  const token = url.searchParams.get('license');
  if (!token) return false;
  saveLicense(token);
  url.searchParams.delete('license');
  history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  return true;
}

export function cachedVerdict(): LicenseVerdict | null {
  try {
    return JSON.parse(localStorage.getItem(VERDICT_KEY) ?? 'null') as LicenseVerdict | null;
  } catch {
    return null;
  }
}

export async function verifyLicense(force = false): Promise<LicenseVerdict | null> {
  const token = localStorage.getItem(LICENSE_KEY);
  if (!token) return null;
  const cached = cachedVerdict();
  if (!force && cached && Date.now() - cached.checkedAt < DAY) return cached;
  const response = await fetch(`${BILLING_BASE}/products/${PRODUCT_SLUG}/verify?license=${encodeURIComponent(token)}`);
  if (!response.ok) throw new Error('License service is temporarily unavailable.');
  const payload = await response.json() as Omit<LicenseVerdict, 'checkedAt'>;
  const verdict = { ...payload, checkedAt: Date.now() };
  localStorage.setItem(VERDICT_KEY, JSON.stringify(verdict));
  return verdict;
}
