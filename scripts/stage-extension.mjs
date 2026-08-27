import { cp, mkdir, readdir, copyFile } from 'node:fs/promises';
import { join } from 'node:path';

const output = '.output';
const files = await readdir(output);
const zip = files.find((name) => name.endsWith('.zip') && name.includes('chrome'));
if (!zip) throw new Error('WXT did not produce a Chrome extension zip.');

await mkdir('dist/site/downloads', { recursive: true });
await mkdir('dist/extension', { recursive: true });
await copyFile(join(output, zip), 'dist/site/downloads/eye-comfort-profiles-chrome.zip');
await cp(join(output, 'chrome-mv3'), 'dist/extension/chrome-mv3', { recursive: true });
