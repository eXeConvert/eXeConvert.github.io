#!/usr/bin/env node
// Rebuild the eXeLearning runtime bundles (*.zip) from a static release.
//
// Up to v4.0.3 the static release shipped bundles/*.zip ready to use. From
// v4.0.5 on it only ships bundles/manifest.json, which maps every file of the
// release (`s`, relative to static/) to the path it must take inside the
// exported site (`t`). eXeLearning itself zips them on the fly; this script
// does the same so the bundles keep the exact layout our runtime expects.
//
// Usage: node build-bundles-from-manifest.mjs <static-root> <dest-bundles-dir>

import { cp, mkdir, mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);

const [staticRoot, destDir] = process.argv.slice(2).map((value) => (value ? resolve(value) : value));
if (!staticRoot || !destDir) {
  console.error('Usage: build-bundles-from-manifest.mjs <static-root> <dest-bundles-dir>');
  process.exit(2);
}

const manifestPath = join(staticRoot, 'bundles', 'manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const staticFiles = manifest.staticFiles;
if (!staticFiles) {
  console.error(`No staticFiles section in ${manifestPath}; nothing to rebuild.`);
  process.exit(1);
}

// bundle name -> list of {s, t}. Themes go to one zip each; idevices share a
// single zip where every entry is prefixed with its iDevice name, exactly as
// the 4.0.3 bundles did.
const plan = new Map();
const add = (bundle, entries, prefix = '') => {
  const list = plan.get(bundle) ?? [];
  for (const { s, t } of entries) list.push({ s, t: prefix ? `${prefix}/${t}` : t });
  plan.set(bundle, list);
};

for (const [theme, entries] of Object.entries(staticFiles.themes ?? {})) add(`themes/${theme}`, entries);
for (const [idevice, entries] of Object.entries(staticFiles.idevices ?? {})) add('idevices', entries, idevice);
for (const [, entries] of Object.entries(staticFiles.common ?? {})) add('common', entries);
add('libs', staticFiles.libs ?? []);
add('content-css', staticFiles.contentCss ?? []);

const expected = {
  idevices: manifest.idevicesBundle?.files,
  libs: manifest.libs?.files,
  common: manifest.common?.files,
  'content-css': manifest.contentCss?.files,
  ...Object.fromEntries(Object.entries(manifest.themes ?? {}).map(([name, info]) => [`themes/${name}`, info.files])),
};

const work = await mkdtemp(join(tmpdir(), 'exe-bundles-'));
try {
  await rm(destDir, { recursive: true, force: true });
  await mkdir(join(destDir, 'themes'), { recursive: true });

  for (const [bundle, entries] of plan) {
    const stage = join(work, bundle);
    for (const { s, t } of entries) {
      const source = join(staticRoot, s);
      if (!(await stat(source).catch(() => null))) throw new Error(`Missing file in release: ${s} (bundle ${bundle})`);
      const target = join(stage, t);
      await mkdir(dirname(target), { recursive: true });
      await cp(source, target);
    }
    const out = join(destDir, `${bundle}.zip`);
    await run('zip', ['-q', '-r', '-X', '-D', out, '.'], { cwd: stage, maxBuffer: 64 * 1024 * 1024 });

    const want = expected[bundle];
    if (want !== undefined && want !== entries.length) {
      throw new Error(`Bundle ${bundle}: ${entries.length} files rebuilt, manifest declares ${want}`);
    }
    console.log(`  ${bundle}.zip (${entries.length} files)`);
  }

  await writeFile(join(destDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
} finally {
  await rm(work, { recursive: true, force: true });
}
