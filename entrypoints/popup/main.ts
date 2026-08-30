import { browser } from 'wxt/browser';
import { FONT_OPTIONS, THEME_OPTIONS, createProfile, importState, isSupportedUrl, normalizeSettings, normalizeState, stateForExport, type ComfortProfile, type ComfortState, type ProfileSettings } from '../../shared/model';
import { LICENSE_KEY, checkoutUrl, cachedVerdict, saveLicense, verifyLicense } from '../../shared/license';
import { readState, writeState } from '../../shared/storage';

const byId = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const app = byId<HTMLDivElement>('app');
const unsupported = byId<HTMLElement>('unsupported');
const notice = byId<HTMLDivElement>('notice');
const hostOutput = byId<HTMLElement>('host');
const assignmentState = byId<HTMLElement>('assignment-state');
const profileSelect = byId<HTMLSelectElement>('profile-select');
const profileName = byId<HTMLInputElement>('profile-name');
const dialog = byId<HTMLDialogElement>('delete-dialog');
const form = {
  fontFamily: byId<HTMLSelectElement>('font-family'),
  fontSize: byId<HTMLInputElement>('font-size'),
  lineHeight: byId<HTMLInputElement>('line-height'),
  letterSpacing: byId<HTMLInputElement>('letter-spacing'),
  lineWidth: byId<HTMLInputElement>('line-width'),
  theme: byId<HTMLSelectElement>('theme'),
  focusBand: byId<HTMLInputElement>('focus-band'),
  focusHeight: byId<HTMLInputElement>('focus-height')
};

let state: ComfortState;
let activeTabId: number | undefined;
let host = '';
let selectedId = '';
let writeQueue: Promise<void> = Promise.resolve();
let previewQueue: Promise<void> = Promise.resolve();

/**
 * Extension storage writes are asynchronous. Serialising snapshots prevents an
 * earlier control event from overwriting a newer keyboard adjustment.
 */
function queueStateWrite(): Promise<void> {
  const snapshot = normalizeState(structuredClone(state));
  writeQueue = writeQueue.catch(() => undefined).then(() => writeState(snapshot));
  return writeQueue;
}

async function saveState(): Promise<void> {
  try {
    await queueStateWrite();
  } catch {
    showNotice('Profiles could not be saved. Try again or export a backup.', 'error');
  }
}

async function sendPreview(settings: ProfileSettings): Promise<void> {
  if (activeTabId === undefined) return;
  try {
    await browser.tabs.sendMessage(activeTabId, { type: 'ECP_PREVIEW', settings });
  } catch {
    showNotice('This page stopped responding. Reload it and try again.', 'warning');
  }
}

function queuePreview(settings: ProfileSettings): Promise<void> {
  const snapshot = normalizeSettings(settings);
  previewQueue = previewQueue.catch(() => undefined).then(() => sendPreview(snapshot));
  return previewQueue;
}

function unlockSupporter(): void {
  const faceplate = localStorage.getItem('ecp_faceplate') ?? 'brass';
  document.body.dataset.faceplate = faceplate;
  byId<HTMLElement>('faceplate-options').hidden = false;
  byId<HTMLSelectElement>('faceplate').value = faceplate;
}

function lockSupporter(): void {
  delete document.body.dataset.faceplate;
  byId<HTMLElement>('faceplate-options').hidden = true;
}

function showNotice(message: string, kind: 'success' | 'error' | 'warning' = 'success'): void {
  notice.textContent = message;
  notice.dataset.kind = kind;
  notice.hidden = false;
  setTimeout(() => { notice.hidden = true; }, 4000);
}

function currentProfile(): ComfortProfile {
  return state.profiles.find(({ id }) => id === selectedId) ?? state.profiles[0]!;
}

function setOptions<T extends Record<string, string>>(select: HTMLSelectElement, options: T): void {
  select.replaceChildren(...Object.entries(options).map(([value, label]) => new Option(label, value)));
}

function paintAssignment(): void {
  const assigned = state.assignments[host];
  const isSelected = assigned === selectedId;
  assignmentState.textContent = assigned ? (isSelected ? 'Applied' : 'Another profile') : 'Not assigned';
  assignmentState.dataset.active = String(Boolean(assigned));
  byId<HTMLButtonElement>('assign').textContent = isSelected ? 'Saved to this website' : 'Save to this website';
  byId<HTMLButtonElement>('clear').hidden = !assigned;
  byId<HTMLElement>('status-lamp').dataset.active = String(Boolean(assigned));
}

function renderProfileList(): void {
  profileSelect.replaceChildren(...state.profiles.map((profile) => new Option(profile.name, profile.id)));
  if (!state.profiles.some(({ id }) => id === selectedId)) selectedId = state.profiles[0]!.id;
  profileSelect.value = selectedId;
  byId<HTMLButtonElement>('delete-profile').disabled = state.profiles.length === 1;
}

function renderForm(): void {
  const profile = currentProfile();
  profileName.value = profile.name;
  form.fontFamily.value = profile.settings.fontFamily;
  form.fontSize.value = String(profile.settings.fontSize);
  form.lineHeight.value = String(profile.settings.lineHeight);
  form.letterSpacing.value = String(profile.settings.letterSpacing);
  form.lineWidth.value = String(profile.settings.lineWidth);
  form.theme.value = profile.settings.theme;
  form.focusBand.checked = profile.settings.focusBand;
  form.focusHeight.value = String(profile.settings.focusHeight);
  byId<HTMLElement>('band-height-wrap').hidden = !profile.settings.focusBand;
  renderReadouts(profile.settings);
  paintAssignment();
}

function renderReadouts(settings: ProfileSettings): void {
  byId<HTMLOutputElement>('font-size-value').value = `${settings.fontSize} px`;
  byId<HTMLOutputElement>('line-height-value').value = `${settings.lineHeight.toFixed(2)}×`;
  byId<HTMLOutputElement>('letter-spacing-value').value = `${settings.letterSpacing.toFixed(2)} em`;
  byId<HTMLOutputElement>('line-width-value').value = `${settings.lineWidth} ch`;
  byId<HTMLOutputElement>('focus-height-value').value = `${settings.focusHeight} px`;
}

function settingsFromForm(): ProfileSettings {
  return {
    fontFamily: form.fontFamily.value as ProfileSettings['fontFamily'],
    fontSize: Number(form.fontSize.value),
    lineHeight: Number(form.lineHeight.value),
    letterSpacing: Number(form.letterSpacing.value),
    lineWidth: Number(form.lineWidth.value),
    theme: form.theme.value as ProfileSettings['theme'],
    focusBand: form.focusBand.checked,
    focusHeight: Number(form.focusHeight.value)
  };
}

async function persistAndPreview(): Promise<void> {
  const profile = currentProfile();
  profile.settings = settingsFromForm();
  profile.updatedAt = Date.now();
  // Make a newly enabled focus-height rail usable in the same keyboard turn,
  // before slow extension storage resolves. The queued work below preserves
  // the event order for both page preview and persisted state.
  renderReadouts(profile.settings);
  byId<HTMLElement>('band-height-wrap').hidden = !profile.settings.focusBand;
  await Promise.all([saveState(), queuePreview(profile.settings)]);
}

async function initLicense(): Promise<void> {
  byId<HTMLAnchorElement>('buy-link').href = checkoutUrl();
  const output = byId<HTMLElement>('license-state');
  const transferred = (await browser.storage.local.get(LICENSE_KEY))[LICENSE_KEY];
  if (typeof transferred === 'string' && transferred) {
    saveLicense(transferred);
    await browser.storage.local.remove(LICENSE_KEY);
  }
  const cached = cachedVerdict();
  if (cached?.valid) unlockSupporter();
  if (cached && !cached.valid) output.textContent = 'License no longer active.';
  try {
    const verdict = await verifyLicense();
    if (verdict?.valid) {
      unlockSupporter();
      output.textContent = 'Supporter faceplates unlocked. Thank you.';
    } else if (verdict) {
      lockSupporter();
      output.textContent = 'License no longer active. You can purchase a new unlock above.';
    }
  } catch {
    output.textContent = cached?.valid ? 'Offline — using your last verified unlock.' : 'License check unavailable. Reading tools still work.';
  }
}

async function init(): Promise<void> {
  setOptions(form.fontFamily, FONT_OPTIONS);
  setOptions(form.theme, THEME_OPTIONS);
  state = await readState();
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  activeTabId = tab?.id;
  if (!isSupportedUrl(tab?.url)) {
    hostOutput.textContent = 'Browser page';
    assignmentState.textContent = 'Unavailable';
    unsupported.hidden = false;
    return;
  }
  host = new URL(tab.url).hostname;
  hostOutput.textContent = host;
  selectedId = state.assignments[host] ?? state.profiles[0]!.id;
  renderProfileList();
  renderForm();
  app.hidden = false;
  void initLicense();
}

for (const input of Object.values(form)) input.addEventListener('input', () => void persistAndPreview());

profileSelect.addEventListener('change', () => {
  selectedId = profileSelect.value;
  renderForm();
  void queuePreview(currentProfile().settings);
});

profileName.addEventListener('change', async () => {
  const value = profileName.value.trim();
  if (!value) { profileName.value = currentProfile().name; showNotice('Profile name cannot be empty.', 'error'); return; }
  currentProfile().name = value.slice(0, 48);
  currentProfile().updatedAt = Date.now();
  await saveState();
  renderProfileList();
  showNotice('Profile renamed.');
});

byId<HTMLButtonElement>('new-profile').addEventListener('click', async () => {
  const profile = createProfile(`Reading profile ${state.profiles.length + 1}`);
  profile.settings = { ...currentProfile().settings };
  state.profiles.push(profile);
  selectedId = profile.id;
  await saveState();
  renderProfileList(); renderForm();
  profileName.focus(); profileName.select();
  showNotice('New profile ready. Name it, then tune the controls.');
});

byId<HTMLButtonElement>('delete-profile').addEventListener('click', () => {
  byId<HTMLElement>('delete-copy').textContent = `“${currentProfile().name}” and its website selections will be removed.`;
  dialog.showModal();
});
byId<HTMLButtonElement>('cancel-delete').addEventListener('click', () => dialog.close());
byId<HTMLButtonElement>('confirm-delete').addEventListener('click', async () => {
  const deletedId = selectedId;
  state.profiles = state.profiles.filter(({ id }) => id !== deletedId);
  state.assignments = Object.fromEntries(Object.entries(state.assignments).filter(([, id]) => id !== deletedId));
  selectedId = state.profiles[0]!.id;
  await saveState();
  dialog.close(); renderProfileList(); renderForm();
  showNotice('Profile deleted.', 'warning');
});

byId<HTMLButtonElement>('assign').addEventListener('click', async () => {
  state.assignments[host] = selectedId;
  await saveState();
  paintAssignment();
  showNotice(`“${currentProfile().name}” will return on ${host}.`);
});

byId<HTMLButtonElement>('clear').addEventListener('click', async () => {
  delete state.assignments[host];
  await saveState();
  await browser.tabs.sendMessage(activeTabId!, { type: 'ECP_CLEAR' }).catch(() => undefined);
  paintAssignment();
  showNotice(`Profile removed from ${host}.`, 'warning');
});

byId<HTMLButtonElement>('export').addEventListener('click', () => {
  const blob = new Blob([stateForExport(state)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'eye-comfort-profiles-backup.json';
  link.click();
  URL.revokeObjectURL(link.href);
  showNotice('Backup exported.');
});

byId<HTMLInputElement>('import').addEventListener('change', async (event) => {
  const input = event.currentTarget as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  try {
    state = importState(await file.text());
    selectedId = state.profiles[0]!.id;
    await saveState();
    renderProfileList(); renderForm();
    showNotice('Backup imported. Existing profiles were replaced.');
  } catch (error) {
    showNotice(error instanceof Error ? error.message : 'Could not import that backup.', 'error');
  } finally { input.value = ''; }
});

byId<HTMLButtonElement>('restore').addEventListener('click', async () => {
  const input = byId<HTMLInputElement>('license');
  const output = byId<HTMLElement>('license-state');
  if (!input.value.trim()) { output.textContent = 'Paste the license token from your receipt.'; return; }
  saveLicense(input.value);
  output.textContent = 'Checking license…';
  try {
    const verdict = await verifyLicense(true);
    if (verdict?.valid) {
      unlockSupporter();
      output.textContent = 'Supporter faceplates unlocked. Thank you.';
      input.value = '';
    } else {
      lockSupporter();
      output.textContent = 'That license is not active. Check the token and try again.';
    }
  } catch { output.textContent = 'Could not check the license. Try again when you are online.'; }
});

byId<HTMLSelectElement>('faceplate').addEventListener('change', (event) => {
  const value = (event.currentTarget as HTMLSelectElement).value;
  localStorage.setItem('ecp_faceplate', value);
  document.body.dataset.faceplate = value;
});

void init().catch(() => {
  hostOutput.textContent = 'Storage unavailable';
  assignmentState.textContent = 'Error';
  unsupported.hidden = false;
  unsupported.querySelector('h2')!.textContent = 'Profiles could not be opened';
  unsupported.querySelector('p')!.textContent = 'Reload the extension. If this continues, export browser diagnostics before reinstalling.';
});
