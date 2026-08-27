import { browser } from 'wxt/browser';
import { STORAGE_KEY, type ComfortState, normalizeState } from './model';

export async function readState(): Promise<ComfortState> {
  const stored = await browser.storage.local.get(STORAGE_KEY);
  return normalizeState(stored[STORAGE_KEY]);
}

export async function writeState(state: ComfortState): Promise<void> {
  await browser.storage.local.set({ [STORAGE_KEY]: normalizeState(state) });
}
