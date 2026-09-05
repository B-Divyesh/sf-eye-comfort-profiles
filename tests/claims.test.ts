import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

interface Claim {
  id: string;
  claim: string;
  where: string;
  test: string;
  sandbox: string;
}

const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Claim[];
const taggedTestSources = [
  'tests/browser/site.spec.ts',
  'tests/model.test.ts',
  'tests/license.test.ts',
  'tests/release-artifact.test.ts',
  'scripts/extension-smoke.mjs',
  'scripts/verify-live-release.mjs'
].map((path) => readFileSync(path, 'utf8')).join('\n');

describe('public claims contract', () => {
  it('lists unique claims with runnable sandbox evidence', () => {
    expect(new Set(claims.map(({ id }) => id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.claim.trim()).not.toBe('');
      expect(claim.where.trim()).not.toBe('');
      expect(claim.test).toMatch(/^(npm|npx) /);
      expect(claim.sandbox.trim()).not.toBe('');
    }
  });

  it('has exactly one tagged test implementation for every listed claim', () => {
    for (const { id } of claims) {
      const occurrences = taggedTestSources.split(`@claim:${id}`).length - 1;
      expect(occurrences, `@claim:${id}`).toBe(1);
    }
  });
});
