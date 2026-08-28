import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const slug = 'eye-comfort-profiles';
const directory = 'dist/site';

if (!existsSync(`${directory}/index.html`)) {
  throw new Error('Build the release first: dist/site/index.html is missing.');
}
if (!existsSync(`${directory}/downloads/eye-comfort-profiles-chrome.zip`)) {
  throw new Error('Build the release first: the staged Chromium download is missing.');
}

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit' });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

// Deploy the site root, never an asset-only subdirectory: it includes the
// advertised extension archive under /downloads/.
run('/opt/fleet/lib/deploy-static.sh', [slug, directory]);
run(process.execPath, ['scripts/verify-live-release.mjs']);
