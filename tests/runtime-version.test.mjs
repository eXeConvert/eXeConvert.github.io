// The version stamped into generated .elpx files must follow the runtime that
// npm run sync:exe brings in, or projects would claim to come from an
// eXeLearning release they were not built with.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

test('exe_version matches the vendored eXeLearning runtime', async () => {
  const source = JSON.parse(
    await readFile(resolve(root, 'app/public/exelearning/runtime-source.json'), 'utf8'),
  );
  const importer = await readFile(resolve(root, 'src/exe-runtime.ts'), 'utf8');
  const declared = importer.match(/const EXE_RUNTIME_VERSION = '([^']+)'/)?.[1];
  assert.equal(declared, source.sourceVersion);
});

test('only projects newer than the runtime are flagged', async () => {
  const { isNewerThanRuntime, EXE_RUNTIME_VERSION } = await import('../src/exe-runtime.ts');
  assert.equal(EXE_RUNTIME_VERSION, '4.0.3');
  for (const older of ['3.0', '4.0.0', '4.0.1', '4.0.3', 'v4.0.3', null, '', 'sin-sentido']) {
    assert.equal(isNewerThanRuntime(older), false, `${older} should not warn`);
  }
  for (const newer of ['4.0.4', '4.1.0', 'v4.1', '5.0.0']) {
    assert.equal(isNewerThanRuntime(newer), true, `${newer} should warn`);
  }
});
