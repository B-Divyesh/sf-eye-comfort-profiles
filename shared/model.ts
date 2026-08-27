export const PRODUCT_SLUG = 'eye-comfort-profiles';
export const STORAGE_KEY = 'eyeComfortState';

export const FONT_OPTIONS = {
  system: 'System sans',
  humanist: 'Humanist sans',
  serif: 'Book serif',
  mono: 'Readable mono'
} as const;

export const THEME_OPTIONS = {
  original: 'Keep site colors',
  paper: 'Warm paper',
  slate: 'Night slate',
  contrast: 'High contrast'
} as const;

export type FontChoice = keyof typeof FONT_OPTIONS;
export type ThemeChoice = keyof typeof THEME_OPTIONS;

export interface ProfileSettings {
  fontFamily: FontChoice;
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
  lineWidth: number;
  theme: ThemeChoice;
  focusBand: boolean;
  focusHeight: number;
}

export interface ComfortProfile {
  id: string;
  name: string;
  settings: ProfileSettings;
  updatedAt: number;
}

export interface ComfortState {
  version: 1;
  profiles: ComfortProfile[];
  assignments: Record<string, string>;
}

export const DEFAULT_SETTINGS: ProfileSettings = {
  fontFamily: 'humanist',
  fontSize: 18,
  lineHeight: 1.65,
  letterSpacing: 0.01,
  lineWidth: 68,
  theme: 'paper',
  focusBand: false,
  focusHeight: 96
};

export function createProfile(name = 'Comfortable reading'): ComfortProfile {
  return {
    id: crypto.randomUUID(),
    name,
    settings: { ...DEFAULT_SETTINGS },
    updatedAt: Date.now()
  };
}

export function createDefaultState(): ComfortState {
  return { version: 1, profiles: [createProfile()], assignments: {} };
}

const clamp = (value: unknown, min: number, max: number, fallback: number) => {
  const numeric = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
};

export function normalizeSettings(input: Partial<ProfileSettings> | undefined): ProfileSettings {
  const source = input ?? {};
  return {
    fontFamily: source.fontFamily && source.fontFamily in FONT_OPTIONS ? source.fontFamily : DEFAULT_SETTINGS.fontFamily,
    fontSize: clamp(source.fontSize, 14, 32, DEFAULT_SETTINGS.fontSize),
    lineHeight: clamp(source.lineHeight, 1.2, 2.2, DEFAULT_SETTINGS.lineHeight),
    letterSpacing: clamp(source.letterSpacing, 0, 0.12, DEFAULT_SETTINGS.letterSpacing),
    lineWidth: clamp(source.lineWidth, 36, 96, DEFAULT_SETTINGS.lineWidth),
    theme: source.theme && source.theme in THEME_OPTIONS ? source.theme : DEFAULT_SETTINGS.theme,
    focusBand: source.focusBand === true,
    focusHeight: clamp(source.focusHeight, 56, 180, DEFAULT_SETTINGS.focusHeight)
  };
}

export function normalizeState(input: unknown): ComfortState {
  if (!input || typeof input !== 'object') return createDefaultState();
  const raw = input as Partial<ComfortState>;
  const profiles = Array.isArray(raw.profiles)
    ? raw.profiles.flatMap((candidate) => {
        if (!candidate || typeof candidate !== 'object') return [];
        const profile = candidate as Partial<ComfortProfile>;
        if (typeof profile.id !== 'string' || typeof profile.name !== 'string' || !profile.name.trim()) return [];
        return [{
          id: profile.id,
          name: profile.name.trim().slice(0, 48),
          settings: normalizeSettings(profile.settings),
          updatedAt: clamp(profile.updatedAt, 0, Number.MAX_SAFE_INTEGER, Date.now())
        }];
      })
    : [];
  const validProfiles = profiles.length ? profiles : [createProfile()];
  const ids = new Set(validProfiles.map(({ id }) => id));
  const assignments = Object.fromEntries(
    Object.entries(raw.assignments ?? {}).filter(([host, id]) =>
      typeof host === 'string' && host.length <= 253 && typeof id === 'string' && ids.has(id)
    )
  );
  return { version: 1, profiles: validProfiles, assignments };
}

export function isSupportedUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

export function stateForExport(state: ComfortState): string {
  return JSON.stringify({ ...state, exportedAt: new Date().toISOString() }, null, 2);
}

export function importState(text: string): ComfortState {
  const parsed = JSON.parse(text) as unknown;
  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as Partial<ComfortState>).profiles)) {
    throw new Error('That file is not an Eye Comfort Profiles backup.');
  }
  return normalizeState(parsed);
}
