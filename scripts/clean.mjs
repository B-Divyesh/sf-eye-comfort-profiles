import { rm } from 'node:fs/promises';

for (const path of ['dist', '.output']) {
  await rm(path, { recursive: true, force: true });
}
