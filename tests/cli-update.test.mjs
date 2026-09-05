import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const call = args => run(process.execPath, [
  // --import takes a module specifier: on Windows a bare absolute path is read
  // as the URL scheme "d:", so it has to be a file:// URL.
  '--import', pathToFileURL(resolve(root, 'tests/fixtures/update-fetch.mjs')).href,
  resolve(root, 'dist/cli/cli/execonvert.js'), ...args,
], { cwd: root, timeout: 20000 });

test('update --check reports stable version as clean JSON', async () => {
  const { stdout, stderr } = await call(['update', '--check', '--json']);
  const result = JSON.parse(stdout);
  assert.equal(result.latest, '999.0.0');
  assert.equal(result.available, true);
  assert.equal(result.action, 'checked');
  assert.equal(stderr.trim(), 'TEST_UPDATE_REQUEST');
});

test('update protects the development checkout and explains the manual route', async () => {
  const { stdout } = await call(['update', '--json']);
  const result = JSON.parse(stdout);
  assert.equal(result.installation, 'source');
  assert.equal(result.action, 'manual');
});

test('help, version and piped JSON inspection never request updates', async () => {
  for (const args of [['--help'], ['--version'], ['inspect', 'app/public/base.elpx', '--json'],
    ['inspect', 'app/public/base.elpx', '--no-update-check']]) {
    const { stdout, stderr } = await call(args);
    assert.doesNotMatch(stderr, /TEST_UPDATE_REQUEST/);
    if (args.includes('--json')) assert.ok(Array.isArray(JSON.parse(stdout).pages));
  }
});

test('update rejects positional arguments and unrelated conversion flags before connecting', async () => {
  for (const args of [['update', 'unexpected'], ['update', '--to', 'pdf'], ['--check', 'a', 'b']]) {
    await assert.rejects(call(args), error => {
      assert.equal(error.code, 1);
      assert.doesNotMatch(error.stderr, /TEST_UPDATE_REQUEST/);
      return true;
    });
  }
});

test('update messages honor Spanish and Catalan', async () => {
  const es = await call(['update', '--check', '--lang', 'es']);
  const ca = await call(['update', '--check', '--lang', 'ca']);
  assert.match(es.stdout, /Hay una actualización/);
  assert.match(ca.stdout, /Hi ha una actualització/);
});
