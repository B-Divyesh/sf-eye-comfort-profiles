import { createServer } from 'node:http';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from 'playwright';

const extensionPath = join(process.cwd(), 'dist/extension/chrome-mv3');
const chromePath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ?? chromium.executablePath();
// A representative article sets its own prose typography, as common CMS
// themes do. This guards the regression where body-only CSS lost to p rules.
const articleMarkup = '<!doctype html><html><head><title>Reading sample</title><style>body { background: rgb(246, 244, 240); color: rgb(31, 35, 33); } article p { font-family: Georgia, serif; font-size: 15px; line-height: 1.35; letter-spacing: normal; max-width: 90ch; }</style></head><body><main><article><h1>Local article</h1><p id="article-copy">A comfortable local reading sample.</p><button id="reader-button">Continue reading</button></article></main></body></html>';
const claimTags = [
  '@claim:free-reading-controls',
  '@claim:live-page-preview',
  '@claim:four-font-styles',
  '@claim:local-profile-privacy',
  '@claim:offline-profile',
  '@claim:site-profile-reload',
  '@claim:supporter-faceplates',
  '@claim:protected-pages-unchanged',
  '@claim:focus-band-behavior',
  '@claim:unassigned-pages-unchanged',
  '@claim:license-restore',
  '@claim:unlicensed-profile-tools'
];
const [freeReadingControlsClaim, livePagePreviewClaim, fourFontStylesClaim, localProfilePrivacyClaim, offlineProfileClaim, siteProfileReloadClaim, supporterFaceplatesClaim, protectedPagesUnchangedClaim, focusBandBehaviorClaim, unassignedPagesUnchangedClaim, licenseRestoreClaim, unlicensedProfileToolsClaim] = claimTags;

const requestedClaim = process.argv.find((argument) => argument.startsWith('--claim='))?.slice('--claim='.length);
if (requestedClaim && !claimTags.includes(requestedClaim)) {
  throw new Error(`Unknown claim tag: ${requestedClaim}`);
}
const runsClaim = (tag) => !requestedClaim || requestedClaim === tag;

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
  const protectedPage = await context.newPage();
  await protectedPage.goto('chrome://settings/');
  await protectedPage.waitForTimeout(150);
  const protectedPageUnchanged = await protectedPage.evaluate(() => ({
    profileStyle: Boolean(document.getElementById('eye-comfort-profiles-style')),
    focusBand: Boolean(document.getElementById('eye-comfort-profiles-band'))
  }));
  await protectedPage.close();
  if (runsClaim(protectedPagesUnchangedClaim) && (protectedPageUnchanged.profileStyle || protectedPageUnchanged.focusBand)) {
    throw new Error(`A browser-protected page was changed: ${JSON.stringify(protectedPageUnchanged)}`);
  }
  const article = await context.newPage();
  const consoleErrors = [];
  article.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  await article.goto(`http://127.0.0.1:${port}/article`);
  const untouched = await article.evaluate(() => ({
    fontSize: getComputedStyle(document.body).fontSize,
    paragraphFontSize: getComputedStyle(document.querySelector('#article-copy')).fontSize,
    profileStyle: Boolean(document.getElementById('eye-comfort-profiles-style')),
    focusBand: Boolean(document.getElementById('eye-comfort-profiles-band'))
  }));
  if (untouched.fontSize !== '16px' || untouched.paragraphFontSize !== '15px' || untouched.profileStyle || untouched.focusBand) {
    throw new Error(`The page changed before explicit profile assignment: ${JSON.stringify(untouched)}`);
  }
  if (runsClaim(unassignedPagesUnchangedClaim) && (untouched.profileStyle || untouched.focusBand || untouched.paragraphFontSize !== '15px')) {
    throw new Error(`An unassigned regular page was changed: ${JSON.stringify(untouched)}`);
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

  if (runsClaim(fourFontStylesClaim)) {
    const styles = ['system', 'humanist', 'serif', 'mono'];
    const options = await popup.locator('#font-family option').evaluateAll((items) => items.map((item) => item.value));
    if (JSON.stringify(options) !== JSON.stringify(styles)) {
      throw new Error(`The popup did not offer the four documented font styles: ${JSON.stringify(options)}`);
    }
  }

  const switchTarget = await popup.locator('.switch').boundingBox();
  const switchInputTarget = await popup.locator('#focus-band').boundingBox();
  if (!switchTarget || !switchInputTarget || switchTarget.width < 44 || switchTarget.height < 44 || switchInputTarget.width < 44 || switchInputTarget.height < 44) {
    throw new Error(`The focus-band switch target is too small: label=${JSON.stringify(switchTarget)}, input=${JSON.stringify(switchInputTarget)}`);
  }
  const popupLabels = await popup.evaluate(() => ({
    profileContext: document.querySelector('.eyebrow')?.textContent?.trim(),
    controlsLabel: document.querySelector('.dial-bank')?.getAttribute('aria-label')
  }));
  if (popupLabels.profileContext !== 'Reading profiles' || popupLabels.controlsLabel !== 'Reading controls') {
    throw new Error(`Popup did not expose plain profile and controls labels: ${JSON.stringify(popupLabels)}`);
  }

  let livePagePreview = 'not selected';
  if (runsClaim(livePagePreviewClaim)) {
    await popup.locator('#font-size').focus();
    await popup.keyboard.press('End');
    await article.waitForFunction(() => getComputedStyle(document.querySelector('#article-copy')).fontSize === '32px');
    // The storage event that caused the earlier regression is asynchronous.
    // Wait beyond it and prove the rendered preview is still present.
    await article.waitForTimeout(350);
    const beforeSave = await article.evaluate(() => ({
      fontSize: getComputedStyle(document.querySelector('#article-copy')).fontSize,
      profileStyle: Boolean(document.getElementById('eye-comfort-profiles-style'))
    }));
    const assignments = await popup.evaluate(async () => (await chrome.storage.local.get('eyeComfortState')).eyeComfortState?.assignments ?? {});
    if (beforeSave.fontSize !== '32px' || !beforeSave.profileStyle || assignments['127.0.0.1'] !== undefined) {
      throw new Error(`A changed setting did not remain visible before saving to this website: ${JSON.stringify({ ...beforeSave, assignments })}`);
    }
    livePagePreview = '32px preview remained visible before the website was assigned';
  }

  await popup.locator('#font-family').selectOption('humanist');
  await popup.locator('#font-size').focus();
  await popup.keyboard.press('End');
  await popup.locator('#line-height').focus();
  await popup.keyboard.press('End');
  await popup.locator('#line-width').focus();
  await popup.keyboard.press('Home');
  await popup.locator('#theme').selectOption('slate');
  await popup.locator('#focus-band').focus();
  await popup.keyboard.press('Space');
  await popup.locator('#focus-height').focus();
  await popup.keyboard.press('End');
  await popup.locator('#assign').focus();
  await popup.keyboard.press('Enter');

  await popup.waitForFunction(() => document.querySelector('#assign')?.textContent === 'Saved to this website');
  await article.waitForFunction(() => {
    const copy = document.querySelector('#article-copy');
    const band = document.getElementById('eye-comfort-profiles-band');
    return getComputedStyle(document.body).fontSize === '32px'
      && getComputedStyle(copy).fontSize === '32px'
      && getComputedStyle(band).height === '180px';
  });
  await article.locator('#reader-button').focus();
  const applied = await article.evaluate(() => {
    const band = document.getElementById('eye-comfort-profiles-band');
    const copy = document.querySelector('#article-copy');
    return {
      fontSize: getComputedStyle(document.body).fontSize,
      paragraphFontSize: getComputedStyle(copy).fontSize,
      paragraphFontFamily: getComputedStyle(copy).fontFamily,
      paragraphLineHeight: getComputedStyle(copy).lineHeight,
      paragraphLetterSpacing: getComputedStyle(copy).letterSpacing,
      paragraphMaxWidth: getComputedStyle(copy).maxWidth,
      background: getComputedStyle(document.body).backgroundColor,
      bandHeight: band ? getComputedStyle(band).height : null,
      bandTop: band?.getBoundingClientRect().top
    };
  });
  if (runsClaim(freeReadingControlsClaim) && (
    applied.fontSize !== '32px'
    || applied.paragraphFontSize !== '32px'
    || !applied.paragraphFontFamily.includes('Trebuchet')
    || applied.paragraphLineHeight !== '70.4px'
    || Math.abs(parseFloat(applied.paragraphLetterSpacing) - .32) > .01
    || applied.paragraphMaxWidth === 'none'
    || applied.background !== 'rgb(28, 37, 38)'
    || applied.bandHeight !== '180px'
    || typeof applied.bandTop !== 'number'
  )) {
    throw new Error(`Profile did not apply its keyboard-selected bounds: ${JSON.stringify(applied)}`);
  }

  if (runsClaim(livePagePreviewClaim)) {
    await popup.locator('#new-profile').click();
    await popup.waitForFunction(() => document.querySelectorAll('#profile-select option').length === 2);
    await popup.locator('#font-size').focus();
    await popup.keyboard.press('Home');
    await article.waitForFunction(() => getComputedStyle(document.querySelector('#article-copy')).fontSize === '14px');
    await article.waitForTimeout(350);
    const replacementPreview = await popup.evaluate(async () => {
      const state = (await chrome.storage.local.get('eyeComfortState')).eyeComfortState;
      const selected = (document.querySelector('#profile-select')).value;
      return { selected, assigned: state?.assignments?.['127.0.0.1'] };
    });
    if (!replacementPreview.assigned || replacementPreview.selected === replacementPreview.assigned) {
      throw new Error(`The second profile was unexpectedly saved before its preview: ${JSON.stringify(replacementPreview)}`);
    }
    await popup.locator('#assign').click();
    await popup.waitForFunction(() => document.querySelector('#assign')?.textContent === 'Saved to this website');
    livePagePreview = '32px preview remained visible before first assignment; 14px replacement-profile preview also stayed visible before reassignment';
  }

  let freeReadingControls = 'not selected';
  const checkEveryFontStyle = runsClaim(freeReadingControlsClaim) || runsClaim(fourFontStylesClaim);
  if (checkEveryFontStyle) {
    const fontExpectations = {
      system: 'system-ui',
      humanist: 'trebuchet',
      serif: 'charter',
      mono: 'ui-monospace'
    };
    for (const [value, expected] of Object.entries(fontExpectations)) {
      await popup.locator('#font-family').selectOption(value);
      await article.waitForFunction((token) => getComputedStyle(document.querySelector('#article-copy')).fontFamily.toLowerCase().includes(token), expected);
    }
  }

  if (runsClaim(freeReadingControlsClaim)) {
    const license = await popup.evaluate(async (licenseKey) => ({
      local: localStorage.getItem(licenseKey),
      transferred: (await chrome.storage.local.get(licenseKey))[licenseKey]
    }), 'sb_license:eye-comfort-profiles');
    if (license.local || license.transferred) {
      throw new Error(`Reading controls unexpectedly started with a supporter license: ${JSON.stringify(license)}`);
    }

    await popup.locator('#font-size').focus();
    await popup.keyboard.press('Home');
    await article.waitForFunction(() => getComputedStyle(document.querySelector('#article-copy')).fontSize === '14px');
    await popup.keyboard.press('End');
    await article.waitForFunction(() => getComputedStyle(document.querySelector('#article-copy')).fontSize === '32px');

    await popup.locator('#line-height').focus();
    await popup.keyboard.press('Home');
    await article.waitForFunction(() => Math.abs(parseFloat(getComputedStyle(document.querySelector('#article-copy')).lineHeight) - 38.4) < .1);
    await popup.keyboard.press('End');
    await article.waitForFunction(() => Math.abs(parseFloat(getComputedStyle(document.querySelector('#article-copy')).lineHeight) - 70.4) < .1);

    await popup.locator('#letter-spacing').focus();
    await popup.keyboard.press('Home');
    await article.waitForFunction(() => getComputedStyle(document.querySelector('#article-copy')).letterSpacing === 'normal' || Math.abs(parseFloat(getComputedStyle(document.querySelector('#article-copy')).letterSpacing)) < .01);
    await popup.keyboard.press('End');
    await article.waitForFunction(() => Math.abs(parseFloat(getComputedStyle(document.querySelector('#article-copy')).letterSpacing) - 3.84) < .05);

    await popup.locator('#line-width').focus();
    await popup.keyboard.press('Home');
    await article.waitForFunction(() => parseFloat(getComputedStyle(document.querySelector('#article-copy')).maxWidth) > 0);
    const narrowLine = await article.locator('#article-copy').evaluate((copy) => parseFloat(getComputedStyle(copy).maxWidth));
    await popup.keyboard.press('End');
    await article.waitForFunction((narrow) => parseFloat(getComputedStyle(document.querySelector('#article-copy')).maxWidth) > narrow, narrowLine);
    const wideLine = await article.locator('#article-copy').evaluate((copy) => parseFloat(getComputedStyle(copy).maxWidth));
    if (Math.abs((wideLine / narrowLine) - (96 / 36)) > .04) {
      throw new Error(`Line-width endpoints did not render as 36ch and 96ch: narrow=${narrowLine}, wide=${wideLine}`);
    }

    const surfaceColors = {
      original: 'rgb(246, 244, 240)',
      paper: 'rgb(243, 237, 223)',
      slate: 'rgb(28, 37, 38)',
      contrast: 'rgb(255, 255, 255)'
    };
    for (const [value, expected] of Object.entries(surfaceColors)) {
      await popup.locator('#theme').selectOption(value);
      await article.waitForFunction((color) => getComputedStyle(document.body).backgroundColor === color, expected);
    }

    await popup.locator('#focus-height').focus();
    await popup.keyboard.press('Home');
    await article.waitForFunction(() => {
      const band = document.getElementById('eye-comfort-profiles-band');
      return Boolean(band) && getComputedStyle(band).height === '56px';
    });
    await popup.keyboard.press('End');
    await article.waitForFunction(() => {
      const band = document.getElementById('eye-comfort-profiles-band');
      return Boolean(band) && getComputedStyle(band).height === '180px';
    });
    freeReadingControls = 'four fonts, four surfaces, and every advertised numeric control boundary applied without a license';
  }

  if (checkEveryFontStyle || runsClaim(freeReadingControlsClaim)) {
    await popup.locator('#font-family').selectOption('humanist');
    await popup.locator('#font-size').focus();
    await popup.keyboard.press('End');
    await popup.locator('#line-height').focus();
    await popup.keyboard.press('End');
    await popup.locator('#letter-spacing').focus();
    await popup.keyboard.press('End');
    await popup.locator('#line-width').focus();
    await popup.keyboard.press('Home');
    await popup.locator('#theme').selectOption('slate');
    await popup.locator('#focus-height').focus();
    await popup.keyboard.press('End');
    await article.waitForFunction(() => getComputedStyle(document.querySelector('#article-copy')).fontSize === '32px' && getComputedStyle(document.body).backgroundColor === 'rgb(28, 37, 38)');
  }

  let unlicensedProfileTools = 'not selected';
  if (runsClaim(unlicensedProfileToolsClaim)) {
    const license = await popup.evaluate(async (licenseKey) => ({
      local: localStorage.getItem(licenseKey),
      transferred: (await chrome.storage.local.get(licenseKey))[licenseKey]
    }), 'sb_license:eye-comfort-profiles');
    if (license.local || license.transferred) {
      throw new Error(`Fresh profile tools unexpectedly started with a supporter license: ${JSON.stringify(license)}`);
    }

    await popup.locator('summary').click();
    await popup.locator('#export').waitFor();
    const downloadPromise = popup.waitForEvent('download');
    await popup.locator('#export').click();
    const download = await downloadPromise;
    if (download.suggestedFilename() !== 'eye-comfort-profiles-backup.json') {
      throw new Error(`Profile backup used the wrong filename: ${download.suggestedFilename()}`);
    }
    const backupStream = await download.createReadStream();
    if (!backupStream) throw new Error('Profile backup could not be read after export.');
    const chunks = [];
    for await (const chunk of backupStream) chunks.push(chunk);
    const backupText = Buffer.concat(chunks).toString('utf8');
    const backup = JSON.parse(backupText);
    const assignedProfile = backup.profiles?.find((profile) => profile.id === backup.assignments?.['127.0.0.1']);
    if (!assignedProfile || assignedProfile.settings?.fontSize !== 32) {
      throw new Error(`Exported backup did not contain the unlicensed saved profile: ${backupText}`);
    }

    await popup.locator('#import').setInputFiles({
      name: 'eye-comfort-profiles-backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(backupText)
    });
    await popup.waitForFunction(() => document.querySelector('#notice')?.textContent === 'Backup imported. Existing profiles were replaced.');
    const restoredState = await popup.evaluate(async () => (await chrome.storage.local.get('eyeComfortState')).eyeComfortState);
    const restoredProfile = restoredState?.profiles?.find((profile) => profile.id === restoredState.assignments?.['127.0.0.1']);
    if (!restoredProfile || restoredProfile.settings?.fontSize !== 32) {
      throw new Error(`Imported backup did not restore the unlicensed profile: ${JSON.stringify(restoredState)}`);
    }
    await popup.locator('#profile-select').selectOption(restoredProfile.id);
    if (applied.paragraphFontSize !== '32px') {
      throw new Error(`Unlicensed reading controls did not change the article: ${JSON.stringify(applied)}`);
    }
    unlicensedProfileTools = 'unlicensed profile saved, matched, applied, exported, and imported';
  }

  let focusBandBehavior = 'not selected';
  if (runsClaim(focusBandBehaviorClaim)) {
    const pointerY = 250;
    await article.mouse.move(20, pointerY);
    await article.waitForTimeout(200);
    const pointerTop = await article.locator('#eye-comfort-profiles-band').evaluate((band) => band.getBoundingClientRect().top);
    if (Math.abs(pointerTop - (pointerY - 90)) >= 3) {
      throw new Error(`Focus band did not follow the pointer: top=${pointerTop}`);
    }
    await article.locator('h1').evaluate((heading) => {
      heading.setAttribute('tabindex', '-1');
      heading.focus();
    });
    await article.locator('#reader-button').focus();
    await article.waitForTimeout(200);
    const keyboardPosition = await article.evaluate(() => {
      const band = document.getElementById('eye-comfort-profiles-band');
      const button = document.getElementById('reader-button');
      if (!band || !button) return null;
      const bandCenter = band.getBoundingClientRect().top + band.getBoundingClientRect().height / 2;
      const buttonRect = button.getBoundingClientRect();
      return { bandCenter, buttonCenter: buttonRect.top + buttonRect.height / 2 };
    });
    if (!keyboardPosition || Math.abs(keyboardPosition.bandCenter - keyboardPosition.buttonCenter) >= 3) {
      throw new Error(`Focus band did not follow keyboard focus: ${JSON.stringify(keyboardPosition)}`);
    }
    await article.evaluate(() => {
      const button = document.querySelector('#reader-button');
      button?.setAttribute('data-clicks', '0');
      button?.addEventListener('click', () => {
        button.setAttribute('data-clicks', String(Number(button.getAttribute('data-clicks')) + 1));
      }, { once: true });
    });
    await article.locator('#reader-button').click();
    const clickCount = Number(await article.locator('#reader-button').getAttribute('data-clicks'));
    const pointerEvents = await article.locator('#eye-comfort-profiles-band').evaluate((band) => getComputedStyle(band).pointerEvents);
    if (clickCount !== 1 || pointerEvents !== 'none') {
      throw new Error(`Focus band did not allow a click through: clicks=${clickCount}, pointer-events=${pointerEvents}`);
    }
    focusBandBehavior = 'pointer and keyboard focus moved the transparent click-through band';
  }

  let supporterFaceplates = 'not selected';
  if (requestedClaim === supporterFaceplatesClaim) {
    const token = 'returned-supporter-token';
    const licenseKey = 'sb_license:eye-comfort-profiles';
    await context.route(`https://api.sociobot.in/api/v1/products/eye-comfort-profiles/verify?license=${token}`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null })
    }));
    // This is the same handoff location used when the product site returns a
    // license to the installed extension. Popup init moves it into its local
    // license store, verifies it, and only then reveals decorative options.
    await popup.evaluate(async ({ key, value }) => { await chrome.storage.local.set({ [key]: value }); }, { key: licenseKey, value: token });
    await popup.reload();
    await popup.waitForSelector('#app:not([hidden])');
    await popup.locator('summary').click();
    await popup.waitForSelector('#faceplate-options:not([hidden])');
    const faceplates = await popup.locator('#faceplate option').evaluateAll((options) => options.map((option) => option.value));
    if (JSON.stringify(faceplates) !== JSON.stringify(['brass', 'coral', 'petrol'])) {
      throw new Error(`Verified license did not reveal the three supporter faceplates: ${JSON.stringify(faceplates)}`);
    }
    await popup.locator('#faceplate').selectOption('petrol');
    if (await popup.evaluate(() => document.body.dataset.faceplate) !== 'petrol') {
      throw new Error('Selected supporter faceplate did not apply to the popup.');
    }
    const transferred = await popup.evaluate(async (key) => (await chrome.storage.local.get(key))[key], licenseKey);
    if (transferred !== undefined) throw new Error('Returned license token was not moved into local license storage.');
    supporterFaceplates = 'verified returned token unlocked brass, coral, and petrol faceplates';
  }

  let restoredLicense = 'not selected';
  if (requestedClaim === licenseRestoreClaim) {
    const token = 'restored-supporter-token';
    await context.route(`https://api.sociobot.in/api/v1/products/eye-comfort-profiles/verify?license=${token}`, (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null })
    }));
    await popup.locator('summary').click();
    await popup.locator('#license').fill(token);
    await popup.locator('#restore').click();
    await popup.waitForFunction(() => document.querySelector('#license-state')?.textContent === 'Supporter faceplates unlocked. Thank you.');
    const faceplates = await popup.locator('#faceplate option').evaluateAll((options) => options.map((option) => option.value));
    if (JSON.stringify(faceplates) !== JSON.stringify(['brass', 'coral', 'petrol'])) {
      throw new Error(`A restored valid license did not reveal the faceplates: ${JSON.stringify(faceplates)}`);
    }
    restoredLicense = 'fixture token restored brass, coral, and petrol faceplates';
  }

  let offlineUpdate = 'not selected';
  if (runsClaim(offlineProfileClaim)) {
    await context.setOffline(true);
    await popup.locator('#font-size').focus();
    await popup.keyboard.press('ArrowLeft');
    await article.waitForFunction(() => getComputedStyle(document.querySelector('#article-copy')).fontSize === '31px');
    await context.setOffline(false);
    offlineUpdate = '31px applied with the browser offline';
  }

  let reload = 'not selected';
  if (runsClaim(siteProfileReloadClaim)) {
    const expectedSize = runsClaim(offlineProfileClaim) ? '31px' : '32px';
    await article.reload();
    await article.waitForFunction((fontSize) => getComputedStyle(document.querySelector('#article-copy')).fontSize === fontSize && Boolean(document.getElementById('eye-comfort-profiles-band')), expectedSize);
    reload = `${expectedSize} reapplied from local extension storage`;
  }

  if (runsClaim(localProfilePrivacyClaim)) {
    const storedState = await popup.evaluate(async () => (await chrome.storage.local.get('eyeComfortState')).eyeComfortState);
    const expectedStoredSize = runsClaim(offlineProfileClaim) ? 31 : 32;
    const assignedProfile = storedState?.profiles?.find((profile) => profile.id === storedState.assignments?.['127.0.0.1']);
    if (!assignedProfile || assignedProfile.settings?.fontSize !== expectedStoredSize) {
      throw new Error(`The saved profile was not retained in browser extension storage: ${JSON.stringify(storedState)}`);
    }
  }

  const unexpectedRequests = requests.filter((value) => {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.hostname !== '127.0.0.1';
  });
  if (runsClaim(localProfilePrivacyClaim) && unexpectedRequests.length) {
    throw new Error(`The local profile flow sent external requests: ${unexpectedRequests.join(', ')}`);
  }
  if (consoleErrors.length) throw new Error(`Article emitted console errors: ${consoleErrors.join('; ')}`);

  console.log(JSON.stringify({
    claims: requestedClaim ? [requestedClaim] : claimTags.filter((claim) => claim !== supporterFaceplatesClaim && claim !== licenseRestoreClaim),
    extensionId,
    untouched,
    applied,
    protectedPageUnchanged,
    livePagePreview,
    freeReadingControls,
    focusBandBehavior,
    unlicensedProfileTools,
    supporterFaceplates,
    restoredLicense,
    offlineUpdate,
    reload,
    externalRequests: unexpectedRequests,
    consoleErrors
  }, null, 2));
} finally {
  await context?.close();
  await new Promise((resolve) => server.close(resolve));
  await rm(profile, { recursive: true, force: true });
}
