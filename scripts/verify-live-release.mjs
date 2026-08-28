import { createHash } from 'node:crypto';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const site = process.env.SITE_URL ?? 'https://eye-comfort-profiles.sociobot.in';
const product = 'eye-comfort-profiles';
const downloadUrl = new URL('/downloads/eye-comfort-profiles-chrome.zip', site);
const checkoutUrl = 'https://api.sociobot.in/api/v1/products/eye-comfort-profiles/checkout';

function required(value, message) {
  if (!value) throw new Error(message);
  return value;
}

async function response(url, options) {
  const result = await fetch(url, options);
  if (!result.ok && result.status !== 303) {
    throw new Error(`${url} returned ${result.status} ${result.statusText}`);
  }
  return result;
}

const home = await response(site);
const csp = required(home.headers.get('content-security-policy'), 'Home response is missing CSP.');
if (!csp.includes("frame-ancestors 'none'")) throw new Error('Home CSP does not prevent framing.');
if (home.headers.get('cross-origin-opener-policy') !== 'same-origin') throw new Error('Home response is missing COOP.');
if (home.headers.get('x-frame-options') !== 'DENY') throw new Error('Home response is missing X-Frame-Options: DENY.');

const html = await home.text();
const asset = required(html.match(/\/assets\/main-[^"']+\.js/)?.[0], 'Could not find the hashed main JavaScript asset.');
const assetResponse = await response(new URL(asset, site));
if (assetResponse.headers.get('cache-control') !== 'public, max-age=31536000, immutable') {
  throw new Error('Hashed JavaScript is not served with the immutable one-year cache policy.');
}

const archive = await response(downloadUrl);
if (!archive.headers.get('content-type')?.includes('application/zip')) {
  throw new Error(`Download is not application/zip (got ${archive.headers.get('content-type') ?? 'no content type'}).`);
}
const archiveBytes = Buffer.from(await archive.arrayBuffer());
if (archiveBytes.subarray(0, 4).toString('binary') !== 'PK\u0003\u0004') {
  throw new Error('Download does not start with a ZIP signature.');
}

const directory = await mkdtemp(join(tmpdir(), 'eye-comfort-profiles-'));
const archivePath = join(directory, 'eye-comfort-profiles-chrome.zip');
try {
  await writeFile(archivePath, archiveBytes);
  const unzip = spawnSync('unzip', ['-t', archivePath], { encoding: 'utf8' });
  if (unzip.status !== 0) throw new Error(`Downloaded archive fails unzip -t: ${unzip.stderr || unzip.stdout}`);
  const manifest = spawnSync('unzip', ['-p', archivePath, 'manifest.json'], { encoding: 'utf8' });
  if (manifest.status !== 0) throw new Error('Downloaded archive does not contain manifest.json.');
  const parsedManifest = JSON.parse(manifest.stdout);
  if (parsedManifest.manifest_version !== 3 || parsedManifest.name !== 'Eye Comfort Profiles') {
    throw new Error('Downloaded archive does not contain the expected Eye Comfort Profiles MV3 manifest.');
  }
} finally {
  await rm(directory, { recursive: true, force: true });
}

const checkout = await fetch(checkoutUrl, { redirect: 'manual' });
if (checkout.status !== 303 || !checkout.headers.get('location')?.startsWith('https://checkout.dodopayments.com/')) {
  throw new Error(`Production checkout mapping is not a Sociobot/Dodo redirect (got ${checkout.status}).`);
}

console.log(JSON.stringify({
  site,
  download: { url: downloadUrl.href, bytes: archiveBytes.length, sha256: createHash('sha256').update(archiveBytes).digest('hex') },
  asset,
  checkout: checkout.headers.get('location')
}, null, 2));
