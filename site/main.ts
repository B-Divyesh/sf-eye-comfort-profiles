import { captureLicenseFromUrl, cachedVerdict, checkoutUrl, verifyLicense } from '../shared/license';

const size = document.querySelector<HTMLInputElement>('#demo-size');
const spacing = document.querySelector<HTMLInputElement>('#demo-space');
const width = document.querySelector<HTMLInputElement>('#demo-width');
const preview = document.querySelector<HTMLElement>('#reading-preview');

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
for (const radio of document.querySelectorAll<HTMLInputElement>('input[name="surface"]')) {
  radio.addEventListener('change', () => { if (preview) preview.dataset.surface = radio.value; });
}
updatePreview();

const offlineBanner = document.querySelector<HTMLElement>('#offline-banner')!;
function updateOnlineState(): void { offlineBanner.hidden = navigator.onLine; }
addEventListener('online', updateOnlineState);
addEventListener('offline', updateOnlineState);
updateOnlineState();

document.querySelector<HTMLAnchorElement>('#checkout-link')?.setAttribute('href', checkoutUrl());
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
