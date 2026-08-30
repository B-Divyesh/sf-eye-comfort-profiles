import { createServer } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const extensionPath = join(process.cwd(), 'dist/extension/chrome-mv3');
const chromePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? chromium.executablePath();
const articleMarkup = '<!doctype html><html><head><title>Reading sample</title></head><body><main><article><h1>Local article</h1><p>A comfortable local reading sample.</p><button id="reader-button">Continue reading</button></article></main></body></html>';
const claimTags = [
  '@claim:free-reading-controls',
  '@claim:local-profile-privacy',
  '@claim:offline-profile',
  '@claim:site-profile-reload'
];

const requestedClaim = process.argv.find((argument) => argument.startsWith('--claim='))?.slice('--claim='.length);
if (requestedClaim && !claimTags.includes(requestedClaim)) {
  throw new Error(`Unknown claim tag: ${requestedClaim}`);
}

function findExtensionId(root = document) {
  for (const element of root.querySelectorAll('*')) {
    if (element.tagName === 'EXTENSIONS-ITEM' && element.id) return element.id;
    if (element.shadowRoot) {
      const nested = findExtensionId(element.shadowRoot);
      if (nested) return nested;
    }
  }
  return null;
}

const server = createServer((_, response) => {
  response.writeHead(200, { 'content-type': 'text/html' });
  response.end(articleMarkup);
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
const profile = await mkdtemp(join(tmpdir(), 'eye-comfort-profiles-smoke-'));
let context;

try {
  context = await chromium.launchPersistentContext(profile, {
    executablePath: chromePath,
    headless: false,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [`--disable-extensions-except=${extensionPath}`, `--load-extension=${extensionPath}`]
  });
  const requests = [];
  context.on('request', (request) => requests.push(request.url()));
  const article = await context.newPage();
  const consoleErrors = [];
  article.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await article.goto(`http://127.0.0.1:${port}/article`);
  const untouched = await article.evaluate(() => ({
    fontSize: getComputedStyle(document.body).fontSize,
    profileStyle: Boolean(document.getElementById('eye-comfort-profiles-style')),
    focusBand: Boolean(document.getElementById('eye-comfort-profiles-band'))
  }));
  if (untouched.fontSize !== '16px' || untouched.profileStyle || untouched.focusBand) {
    throw new Error(`The page changed before explicit profile assignment: ${JSON.stringify(untouched)}`);
  }

  const extensions = await context.newPage();
  await extensions.goto('chrome://extensions/');
  await extensions.waitForTimeout(400);
  const extensionId = await extensions.evaluate(findExtensionId);
  if (!extensionId) throw new Error('The unpacked extension was not listed by Chrome.');
  await extensions.close();

  const cdp = await context.newCDPSession(article);
  const popupUrl = `chrome-extension://${extensionId}/popup.html`;
  const popupPromise = context.waitForEvent('page', { predicate: (page) => page.url() === popupUrl });
  await cdp.send('Target.createTarget', { url: popupUrl, background: true });
  const popup = await popupPromise;
  popup.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await popup.waitForSelector('#app:not([hidden])');
  if (await popup.locator('#host').textContent() !== '127.0.0.1') throw new Error('Popup did not target the active article tab.');

  await popup.locator('#font-size').focus();
  await popup.keyboard.press('End');
  await popup.locator('#theme').selectOption('slate');
  await popup.locator('#focus-band').focus();
  await popup.keyboard.press('Space');
  await popup.locator('#focus-height').focus();
  await popup.keyboard.press('End');
  await popup.locator('#assign').focus();
  await popup.keyboard.press('Enter');

  await article.waitForFunction(() => getComputedStyle(document.body).fontSize === '32px' && Boolean(document.getElementById('eye-comfort-profiles-band')));
  await article.locator('#reader-button').focus();
  const applied = await article.evaluate(() => {
    const band = document.getElementById('eye-comfort-profiles-band');
    return {
      fontSize: getComputedStyle(document.body).fontSize,
      background: getComputedStyle(document.body).backgroundColor,
      bandHeight: band ? getComputedStyle(band).height : null,
      bandTop: band?.getBoundingClientRect().top
    };
  });
  if (applied.fontSize !== '32px' || applied.background !== 'rgb(28, 37, 38)' || applied.bandHeight !== '180px' || typeof applied.bandTop !== 'number') {
    throw new Error(`Profile did not apply its keyboard-selected bounds: ${JSON.stringify(applied)}`);
  }

  await context.setOffline(true);
  await popup.locator('#font-size').focus();
  await popup.keyboard.press('ArrowLeft');
  await article.waitForFunction(() => getComputedStyle(document.body).fontSize === '31px');
  await context.setOffline(false);
  await article.reload();
  await article.waitForFunction(() => getComputedStyle(document.body).fontSize === '31px' && Boolean(document.getElementById('eye-comfort-profiles-band')));

  const unexpectedRequests = requests.filter((value) => {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname !== '127.0.0.1';
  });
  if (unexpectedRequests.length) throw new Error(`The local profile flow sent external requests: ${unexpectedRequests.join(', ')}`);
  if (consoleErrors.length) throw new Error(`Article emitted console errors: ${consoleErrors.join('; ')}`);

  console.log(JSON.stringify({
    claims: claimTags,
    extensionId,
    untouched,
    applied,
    offlineUpdate: '31px applied with the browser offline',
    reload: '31px reapplied from local extension storage',
    externalRequests: unexpectedRequests,
    consoleErrors
  }, null, 2));
} finally {
  await context?.close();
  await new Promise((resolve) => server.close(resolve));
  await rm(profile, { recursive: true, force: true });
}
