import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

const zipPath = 'dist/site/downloads/eye-comfort-profiles-chrome.zip';

describe('published MV3 download artifact', () => {
  it('@claim:chromium-download is a valid ZIP at the exact advertised static download path after build:site', () => {
    expect(existsSync(zipPath)).toBe(true);
    expect(readFileSync(zipPath).subarray(0, 4).toString('binary')).toBe('PK\u0003\u0004');
    expect(() => execFileSync('unzip', ['-t', zipPath], { stdio: 'pipe' })).not.toThrow();
  });

  it('contains a Manifest V3 extension manifest', () => {
    const manifest = JSON.parse(execFileSync('unzip', ['-p', zipPath, 'manifest.json'], { encoding: 'utf8' })) as {
      manifest_version: number;
      name: string;
    };
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.name).toBe('Eye Comfort Profiles');
  });
});
