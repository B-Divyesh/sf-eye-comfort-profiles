import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, importState, isSupportedUrl, normalizeSettings, normalizeState, stateForExport } from '../shared/model';

describe('profile validation', () => {
  it('clamps imported readability settings to safe ranges', () => {
    expect(normalizeSettings({
      ...DEFAULT_SETTINGS,
      fontSize: 200,
      lineHeight: -2,
      lineWidth: 2,
      letterSpacing: Number.NaN,
      focusHeight: 999
    })).toEqual({
      ...DEFAULT_SETTINGS,
      fontSize: 32,
      lineHeight: 1.2,
      lineWidth: 36,
      letterSpacing: DEFAULT_SETTINGS.letterSpacing,
      focusHeight: 180
    });
  });

  it('drops assignments that reference missing profiles', () => {
    const state = normalizeState({
      profiles: [{ id: 'kept', name: 'Article', settings: DEFAULT_SETTINGS, updatedAt: 1 }],
      assignments: { 'example.com': 'kept', 'removed.test': 'missing' }
    });
    expect(state.assignments).toEqual({ 'example.com': 'kept' });
  });

  it('@claim:backup-roundtrip round-trips a portable backup', () => {
    const state = normalizeState({
      profiles: [{ id: 'one', name: 'Night reading', settings: { ...DEFAULT_SETTINGS, theme: 'slate' }, updatedAt: 2 }],
      assignments: { 'example.com': 'one' }
    });
    expect(importState(stateForExport(state))).toEqual(state);
  });

  it('rejects unrelated JSON imports', () => {
    expect(() => importState('{"hello":"world"}')).toThrow(/not an Eye Comfort Profiles backup/);
  });
});

describe('page eligibility', () => {
  it('supports regular HTTP pages only', () => {
    expect(isSupportedUrl('https://example.com/article')).toBe(true);
    expect(isSupportedUrl('http://localhost:4173')).toBe(true);
    expect(isSupportedUrl('chrome://extensions')).toBe(false);
    expect(isSupportedUrl('file:///tmp/page.html')).toBe(false);
    expect(isSupportedUrl(undefined)).toBe(false);
  });
});
