import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { setTimeout as delay } from 'node:timers/promises';

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

const verifyDeadline = Date.now() + Number(process.env.DEPLOY_VERIFY_TIMEOUT_MS ?? 600_000);
for (;;) {
  const verification = spawnSync(process.execPath, ['scripts/verify-live-release.mjs'], { stdio: 'inherit' });
  if (verification.status === 0) break;
  if (Date.now() >= verifyDeadline) process.exit(verification.status ?? 1);
  console.error('Public release has not converged yet; retrying in 5 seconds.');
  await delay(5_000);
}
