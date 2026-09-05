import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [bundleDir, kind] = process.argv.slice(2);
if (!bundleDir || !['deb', 'appimage', 'pkg', 'windows'].includes(kind)) {
  throw new Error('Usage: write-install-channel.mjs <bundle-dir> <deb|appimage|pkg|windows>');
}
await writeFile(resolve(bundleDir, 'install-channel.json'), JSON.stringify({
  kind, platform: process.platform, arch: process.arch,
}, null, 2) + '\n');
