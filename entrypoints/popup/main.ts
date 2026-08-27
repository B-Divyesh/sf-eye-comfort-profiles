import { browser } from 'wxt/browser';
import { FONT_OPTIONS, THEME_OPTIONS, createProfile, importState, isSupportedUrl, stateForExport, type ComfortProfile, type ComfortState, type ProfileSettings } from '../../shared/model';
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
  byId<HTMLButtonElement>('assign').textContent = isSelected ? 'Saved to this site' : 'Save to this site';
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
  await writeState(state);
  renderReadouts(profile.settings);
  byId<HTMLElement>('band-height-wrap').hidden = !profile.settings.focusBand;
  if (activeTabId !== undefined) {
    try { await browser.tabs.sendMessage(activeTabId, { type: 'ECP_PREVIEW', settings: profile.settings }); }
    catch { showNotice('This page stopped responding. Reload it and try again.', 'warning'); }
  }
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
  if (cached?.valid) document.body.dataset.faceplate = 'supporter';
  if (cached && !cached.valid) output.textContent = 'License no longer active.';
  try {
    const verdict = await verifyLicense();
    if (verdict?.valid) {
      document.body.dataset.faceplate = 'supporter';
      output.textContent = 'Supporter faceplates unlocked. Thank you.';
    } else if (verdict) output.textContent = 'License no longer active. You can purchase a new unlock above.';
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
  void browser.tabs.sendMessage(activeTabId!, { type: 'ECP_PREVIEW', settings: currentProfile().settings }).catch(() => undefined);
});

profileName.addEventListener('change', async () => {
  const value = profileName.value.trim();
  if (!value) { profileName.value = currentProfile().name; showNotice('Profile name cannot be empty.', 'error'); return; }
  currentProfile().name = value.slice(0, 48);
  currentProfile().updatedAt = Date.now();
  await writeState(state);
  renderProfileList();
  showNotice('Profile renamed.');
});

byId<HTMLButtonElement>('new-profile').addEventListener('click', async () => {
  const profile = createProfile(`Reading profile ${state.profiles.length + 1}`);
  profile.settings = { ...currentProfile().settings };
  state.profiles.push(profile);
  selectedId = profile.id;
  await writeState(state);
  renderProfileList(); renderForm();
  profileName.focus(); profileName.select();
  showNotice('New profile ready. Name it, then tune the controls.');
});

byId<HTMLButtonElement>('delete-profile').addEventListener('click', () => {
  byId<HTMLElement>('delete-copy').textContent = `“${currentProfile().name}” and its site assignments will be removed.`;
  dialog.showModal();
});
byId<HTMLButtonElement>('cancel-delete').addEventListener('click', () => dialog.close());
byId<HTMLButtonElement>('confirm-delete').addEventListener('click', async () => {
  const deletedId = selectedId;
  state.profiles = state.profiles.filter(({ id }) => id !== deletedId);
  state.assignments = Object.fromEntries(Object.entries(state.assignments).filter(([, id]) => id !== deletedId));
  selectedId = state.profiles[0]!.id;
  await writeState(state);
  dialog.close(); renderProfileList(); renderForm();
  showNotice('Profile deleted.', 'warning');
});

byId<HTMLButtonElement>('assign').addEventListener('click', async () => {
  state.assignments[host] = selectedId;
  await writeState(state);
  paintAssignment();
  showNotice(`“${currentProfile().name}” will return on ${host}.`);
});

byId<HTMLButtonElement>('clear').addEventListener('click', async () => {
  delete state.assignments[host];
  await writeState(state);
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
    await writeState(state);
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
      document.body.dataset.faceplate = 'supporter';
      output.textContent = 'Supporter faceplates unlocked. Thank you.';
      input.value = '';
    } else output.textContent = 'That license is not active. Check the token and try again.';
  } catch { output.textContent = 'Could not check the license. Try again when you are online.'; }
});

void init().catch(() => {
  hostOutput.textContent = 'Storage unavailable';
  assignmentState.textContent = 'Error';
  unsupported.hidden = false;
  unsupported.querySelector('h2')!.textContent = 'Profiles could not be opened';
  unsupported.querySelector('p')!.textContent = 'Reload the extension. If this continues, export browser diagnostics before reinstalling.';
});
