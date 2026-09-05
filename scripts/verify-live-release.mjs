import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const site = process.env.SITE_URL ?? 'https://eye-comfort-profiles.sociobot.in';
const product = 'eye-comfort-profiles';
const downloadUrl = new URL('/downloads/eye-comfort-profiles-chrome.zip', site);
const localArchivePath = 'dist/site/downloads/eye-comfort-profiles-chrome.zip';
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
if (!csp.includes("connect-src 'self' https://api.sociobot.in")) throw new Error('Home CSP has the wrong connection policy.');
if (home.headers.get('cross-origin-opener-policy') !== 'same-origin') throw new Error('Home response is missing COOP.');
if (home.headers.get('x-frame-options') !== 'DENY') throw new Error('Home response is missing X-Frame-Options: DENY.');
if (home.headers.get('x-content-type-options') !== 'nosniff') throw new Error('Home response is missing nosniff.');
if (home.headers.get('referrer-policy') !== 'strict-origin-when-cross-origin') throw new Error('Home response has the wrong referrer policy.');
if (!home.headers.get('permissions-policy')?.includes('camera=()')) throw new Error('Home response is missing Permissions-Policy.');
if (!home.headers.has('strict-transport-security')) throw new Error('Home response is missing HSTS.');

const html = await home.text();
if (!html.includes('href="/downloads/eye-comfort-profiles-chrome.zip"')) {
  throw new Error('Home page does not advertise the verified extension path.');
}
for (const marker of [
  'property="og:image"',
  'name="twitter:card"',
  'href="/favicon.svg"',
  'href="/apple-touch-icon.png"',
  'Built by Param Factory',
  'Extension v1.0.0',
  'Site build repair-6'
]) {
  if (!html.includes(marker)) throw new Error(`Home page is missing required product identity markup: ${marker}`);
}
if (existsSync('dist/site/index.html')) {
  const localHtml = await readFile('dist/site/index.html', 'utf8');
  if (createHash('sha256').update(html).digest('hex') !== createHash('sha256').update(localHtml).digest('hex')) {
    throw new Error('Public home page does not match this production build.');
  }
}
const asset = required(html.match(/\/assets\/main-[^"']+\.js/)?.[0], 'Could not find the hashed main JavaScript asset.');
const assetResponse = await response(new URL(asset, site));
if (assetResponse.headers.get('cache-control') !== 'public, max-age=31536000, immutable') {
  throw new Error('Hashed JavaScript is not served with the immutable one-year cache policy.');
}

const archive = await response(downloadUrl);
if (!archive.headers.get('content-type')?.includes('application/zip')) {
  throw new Error(`Download is not application/zip (got ${archive.headers.get('content-type') ?? 'no content type'}).`);
}
if (archive.headers.get('cache-control') !== 'public, max-age=3600') {
  throw new Error('Download does not use the expected one-hour cache policy.');
}
const archiveBytes = Buffer.from(await archive.arrayBuffer());
if (archiveBytes.subarray(0, 4).toString('binary') !== 'PK\u0003\u0004') {
  throw new Error('Download does not start with a ZIP signature.');
}
const archiveHash = createHash('sha256').update(archiveBytes).digest('hex');
if (existsSync(localArchivePath)) {
  const localArchive = await readFile(localArchivePath);
  const localHash = createHash('sha256').update(localArchive).digest('hex');
  if (archiveHash !== localHash) {
    throw new Error(`Public download does not match this build (live ${archiveHash}, local ${localHash}).`);
  }
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

// @claim:supporter-price The live purchase path must reach the hosted product
// page with the advertised item and price, not merely contain a checkout URL.
const checkout = await fetch(checkoutUrl, { redirect: 'manual' });
const checkoutLocation = checkout.headers.get('location');
if (checkout.status !== 303 || !checkoutLocation?.startsWith('https://checkout.dodopayments.com/')) {
  throw new Error(`Production checkout mapping is not a Sociobot/Dodo redirect (got ${checkout.status}).`);
}
const hostedCheckout = await fetch(checkoutLocation);
if (!hostedCheckout.ok) throw new Error(`Hosted supporter checkout returned ${hostedCheckout.status}.`);
const hostedCheckoutText = await hostedCheckout.text();
if (!hostedCheckoutText.includes('Eye Comfort Profiles') || !hostedCheckoutText.includes('$19.00')) {
  throw new Error('Hosted supporter checkout does not show Eye Comfort Profiles at $19.00.');
}

await Promise.all([
  '/privacy/',
  '/terms/',
  '/robots.txt',
  '/sitemap.xml',
  '/social-preview.jpg',
  '/favicon.svg',
  '/apple-touch-icon.png'
].map((path) => response(new URL(path, site))));

const missingUrl = new URL('/this-route-does-not-exist', site);
const missing = await fetch(missingUrl);
if (missing.status !== 404) throw new Error(`Unknown routes must return the designed 404 response (got ${missing.status}).`);
const missingHtml = await missing.text();
if (!missingHtml.includes('<h1 tabindex="-1">That page is not here.</h1>') || !missingHtml.includes('Built by Param Factory')) {
  throw new Error('Unknown route did not return the designed Eye Comfort Profiles 404 page.');
}

console.log(JSON.stringify({
  site,
  download: { url: downloadUrl.href, bytes: archiveBytes.length, sha256: archiveHash, matchesLocalBuild: existsSync(localArchivePath) },
  asset,
  checkout: { redirect: checkoutLocation, product: 'Eye Comfort Profiles', price: '$19.00' },
  notFound: { url: missingUrl.href, status: missing.status }
}, null, 2));
