import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LICENSE_KEY, cachedVerdict, saveLicense, verifyLicense } from '../shared/license';

class MemoryStorage implements Storage {
  #entries = new Map<string, string>();

  get length(): number { return this.#entries.size; }
  clear(): void { this.#entries.clear(); }
  getItem(key: string): string | null { return this.#entries.get(key) ?? null; }
  key(index: number): string | null { return [...this.#entries.keys()][index] ?? null; }
  removeItem(key: string): void { this.#entries.delete(key); }
  setItem(key: string, value: string): void { this.#entries.set(key, String(value)); }
}

let storage: MemoryStorage;
let now = 1_000_000;

beforeEach(() => {
  storage = new MemoryStorage();
  vi.stubGlobal('localStorage', storage);
  vi.stubGlobal('fetch', vi.fn());
  vi.spyOn(Date, 'now').mockImplementation(() => now);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('supporter license behavior', () => {
  it('@claim:license-daily-check verifies a stored license at most once per day', async () => {
    saveLicense('daily-token');
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(new Response(JSON.stringify({ valid: true, reason: 'ok', expires_at: null }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ valid: true, reason: 'ok', expires_at: null }), { status: 200 }));

    await expect(verifyLicense()).resolves.toMatchObject({ valid: true, reason: 'ok', checkedAt: now });
    now += 86_399_999;
    await expect(verifyLicense()).resolves.toMatchObject({ valid: true, reason: 'ok' });
    expect(fetchMock).toHaveBeenCalledTimes(1);

    now += 1;
    await expect(verifyLicense()).resolves.toMatchObject({ valid: true, reason: 'ok', checkedAt: now });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('@claim:refund-revocation stores a revoked verification result as inactive', async () => {
    saveLicense('refunded-token');
    const fetchMock = vi.mocked(fetch);
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ valid: false, reason: 'revoked', expires_at: null }), { status: 200 }));

    await expect(verifyLicense(true)).resolves.toMatchObject({ valid: false, reason: 'revoked', checkedAt: now });
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining('license=refunded-token'));
    expect(cachedVerdict()).toMatchObject({ valid: false, reason: 'revoked' });
    expect(storage.getItem(LICENSE_KEY)).toBe('refunded-token');
  });
});
