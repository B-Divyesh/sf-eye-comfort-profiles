import { captureLicenseFromUrl, cachedVerdict, checkoutUrl, verifyLicense } from '../shared/license';

const size = document.querySelector<HTMLInputElement>('#demo-size');
const spacing = document.querySelector<HTMLInputElement>('#demo-space');
const width = document.querySelector<HTMLInputElement>('#demo-width');
const preview = document.querySelector<HTMLElement>('#reading-preview');
const surfaceControls = [...document.querySelectorAll<HTMLInputElement>('input[name="surface"]')];
const demoMode = new URL(location.href).searchParams.get('demo') === '1';

const SAMPLE = { size: '24', spacing: '1.8', width: '52', surface: 'slate' } as const;

function updatePreview(): void {
  if (!size || !spacing || !width || !preview) return;
  preview.style.setProperty('--preview-size', `${size.value}px`);
  preview.style.setProperty('--preview-leading', spacing.value);
  preview.style.setProperty('--preview-width', `${width.value}ch`);
  document.querySelector<HTMLOutputElement>('#demo-size-value')!.value = `${size.value} px`;
  document.querySelector<HTMLOutputElement>('#demo-space-value')!.value = `${Number(spacing.value).toFixed(2)}×`;
  document.querySelector<HTMLOutputElement>('#demo-width-value')!.value = `${width.value} ch`;
}

for (const control of [size, spacing, width]) control?.addEventListener('input', updatePreview);
for (const radio of surfaceControls) {
  radio.addEventListener('change', () => { if (preview) preview.dataset.surface = radio.value; });
}
updatePreview();

function loadSample(): void {
  if (!size || !spacing || !width || !preview) return;
  size.value = SAMPLE.size;
  spacing.value = SAMPLE.spacing;
  width.value = SAMPLE.width;
  const surface = surfaceControls.find(({ value }) => value === SAMPLE.surface);
  if (surface) surface.checked = true;
  preview.dataset.surface = SAMPLE.surface;
  updatePreview();
}

if (demoMode) {
  document.title = 'Demo — Eye Comfort Profiles';
  document.querySelector<HTMLElement>('#demo-banner')!.hidden = false;
  document.querySelector<HTMLButtonElement>('#reset-demo')!.addEventListener('click', loadSample);
  loadSample();
}

const offlineBanner = document.querySelector<HTMLElement>('#offline-banner')!;
function updateOnlineState(): void { offlineBanner.hidden = navigator.onLine; }
addEventListener('online', updateOnlineState);
addEventListener('offline', updateOnlineState);
updateOnlineState();

document.querySelector<HTMLAnchorElement>('#checkout-link')?.setAttribute('href', checkoutUrl());
if (!demoMode) {
  const licenseMessage = document.querySelector<HTMLElement>('#license-message');
  const returned = captureLicenseFromUrl();
  if (returned && licenseMessage) licenseMessage.textContent = 'License received. Open the extension to activate your supporter faceplate.';
  const cached = cachedVerdict();
  if (cached?.valid && licenseMessage) licenseMessage.textContent = 'Supporter license active in this browser.';
  verifyLicense().then((verdict) => {
    if (!licenseMessage || !verdict) return;
    licenseMessage.textContent = verdict.valid ? 'Supporter license active in this browser.' : 'This license is no longer active. You can purchase a new unlock above.';
  }).catch(() => {
    if (licenseMessage && cached?.valid) licenseMessage.textContent = 'Offline — your last verified supporter unlock remains available.';
  });
}
