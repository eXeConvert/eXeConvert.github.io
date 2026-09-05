import test, { type TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
  RELEASE_REPO, autoCheckAllowed, automaticCheck, detectInstallation, downloadAsset,
  installNpm, isNewer, latestRelease, packageRoot, selectAsset, stableVersion, validateRelease,
  type Asset, type Release,
} from '../cli/updates.js';

const release = (tag = 'v0.5.0'): Release => ({ tag_name: tag, html_url: `https://github.com/${RELEASE_REPO}/releases/tag/${tag}`, draft: false, prerelease: false, assets: [] });
const fixtureAsset = (name: string, bytes = Buffer.from('installer')): Asset => ({ name,
  browser_download_url: `https://github.com/${RELEASE_REPO}/releases/download/v0.5.0/${name}`,
  digest: `sha256:${createHash('sha256').update(bytes).digest('hex')}`, size: bytes.length,
});
async function temporary(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), 'execonvert-update-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test('stable versions, numeric ordering, no downgrades or prereleases', () => {
  assert.equal(stableVersion('v4.0.3'), '4.0.3');
  assert.ok(isNewer('0.10.0', '0.9.9'));
  assert.ok(!isNewer('v0.4.2', '0.5.0'));
  assert.ok(!isNewer('v0.5.0', '0.5.0'));
  for (const tag of ['v1.0.0-rc1', 'latest', '1.2', '01.2.3', '1.2.3;echo bad']) assert.throws(() => stableVersion(tag));
  assert.throws(() => validateRelease({ ...release(), prerelease: true }));
  assert.throws(() => validateRelease({ ...release(), draft: true }));
  assert.throws(() => validateRelease({ ...release(), html_url: 'https://example.com' }));
});

test('correct repository and HTTP failures', async () => {
  let called = '';
  const result = await latestRelease(async url => { called = String(url); return Response.json(release()); });
  assert.equal(result.tag_name, 'v0.5.0');
  assert.equal(called, `https://api.github.com/repos/${RELEASE_REPO}/releases/latest`);
  for (const status of [404, 403, 500]) await assert.rejects(latestRelease(async () => new Response('', { status })), /GitHub HTTP/);
});

test('automatic checks never run for pipes, JSON, CI, help, version, or opt-out', () => {
  const options = { json: false, disabled: false, command: 'convert' };
  assert.ok(autoCheckAllowed(options, {}, true));
  assert.ok(!autoCheckAllowed(options, {}, false));
  assert.ok(!autoCheckAllowed({ ...options, json: true }, {}, true));
  assert.ok(!autoCheckAllowed({ ...options, disabled: true }, {}, true));
  assert.ok(!autoCheckAllowed(options, { CI: 'true' }, true));
  assert.ok(!autoCheckAllowed(options, { EXECONVERT_NO_UPDATE_CHECK: '1' }, true));
  for (const command of ['help', 'version', 'update']) assert.ok(!autoCheckAllowed({ ...options, command }, {}, true));
});

test('daily throttle, concurrent launches, notification goes to supplied stderr sink', async t => {
  const cacheDir = await temporary(t);
  const messages: string[] = [];
  let calls = 0;
  const options = { cacheDir, now: 100000000, notify: (m: string) => messages.push(m), fetcher: async () => { calls++; return Response.json(release()); } };
  const signal = new AbortController().signal;
  await Promise.all([automaticCheck('0.4.2', 'es', signal, options), automaticCheck('0.4.2', 'es', signal, options)]);
  assert.equal(calls, 1);
  assert.match(messages[0], /0.4.2 → 0.5.0/);
  await automaticCheck('0.4.2', 'es', signal, options);
  assert.equal(calls, 1);
  await automaticCheck('0.4.2', 'es', signal, { ...options, now: options.now + 86400000 });
  assert.equal(calls, 2);
});

test('offline, corrupt or unwritable cache and cancellation cannot break conversion', async t => {
  const cacheDir = await temporary(t);
  await writeFile(join(cacheDir, 'update-check.json'), '{invalid');
  let calls = 0;
  const options = { cacheDir, notify: () => assert.fail('must not notify'), fetcher: async () => { calls++; throw new Error('offline'); } };
  await automaticCheck('0.4.2', 'es', new AbortController().signal, options);
  await automaticCheck('0.4.2', 'es', new AbortController().signal, options);
  assert.equal(calls, 1);
  await automaticCheck('0.4.2', 'es', AbortSignal.abort(), options);
  assert.equal(calls, 1);
  await automaticCheck('0.4.2', 'es', new AbortController().signal, { ...options, cacheDir: join(cacheDir, 'update-check.json') });
});

test('an ongoing automatic HTTP check can be aborted immediately', async t => {
  const cacheDir = await temporary(t);
  const controller = new AbortController();
  let started!: () => void;
  const ready = new Promise<void>(resolve => { started = resolve; });
  const check = automaticCheck('0.4.2', 'en', controller.signal, { cacheDir, fetcher: async (_, init) => {
    started();
    return await new Promise<Response>((_, reject) => init!.signal!.addEventListener('abort', () => reject(new Error('aborted')), { once: true }));
  }, notify: () => assert.fail('aborted request cannot notify') });
  await ready;
  controller.abort();
  await check;
  assert.ok(!(await readdir(cacheDir)).includes('update-check.lock'));
});

test('asset selection preserves installation channel and CPU architecture', () => {
  const r = release();
  r.assets = ['execonvert-0.5.0.tgz', 'execonvert_0.5.0_amd64.deb', 'execonvert-0.5.0-x86_64.AppImage',
    'execonvert-0.5.0-arm64.pkg', 'execonvert-0.5.0-x64-setup.exe', 'execonvert-0.5.0.pkg'].map(name => fixtureAsset(name));
  const install = { root: '/example', kind: 'deb' as const, platform: 'linux', arch: 'x64' };
  assert.equal(selectAsset(r, install)?.name, 'execonvert_0.5.0_amd64.deb');
  assert.equal(selectAsset(r, { ...install, arch: 'arm64' }), undefined);
  assert.equal(selectAsset(r, { ...install, kind: 'appimage' })?.name, 'execonvert-0.5.0-x86_64.AppImage');
  assert.equal(selectAsset(r, { ...install, kind: 'pkg', platform: 'darwin', arch: 'arm64' })?.name, 'execonvert-0.5.0-arm64.pkg');
  assert.equal(selectAsset(r, { ...install, kind: 'pkg', platform: 'darwin' }), undefined);
  assert.equal(selectAsset(r, { ...install, kind: 'windows', platform: 'win32' })?.name, 'execonvert-0.5.0-x64-setup.exe');
  assert.equal(selectAsset(r, { ...install, kind: 'windows', platform: 'win32', arch: 'arm64' }), undefined);
});

test('download verifies contents, preserves existing file on failure and removes partial files', async t => {
  const directory = await temporary(t);
  const bytes = Buffer.from('trusted installer contents');
  const asset = fixtureAsset('execonvert_0.5.0_amd64.deb', bytes);
  const target = await downloadAsset(release(), asset, directory, async () => new Response(new ReadableStream({ start(controller) { controller.enqueue(bytes.subarray(0, 5)); controller.enqueue(bytes.subarray(5)); controller.close(); } })));
  assert.deepEqual(await readFile(target), bytes);
  for (const body of [Buffer.from('bad'), Buffer.alloc(bytes.length, 0), Buffer.alloc(bytes.length + 1)]) {
    await assert.rejects(downloadAsset(release(), asset, directory, async () => new Response(body)));
    assert.deepEqual(await readFile(target), bytes);
  }
  await assert.rejects(downloadAsset(release(), asset, directory, async () => new Response('', { status: 503 })));
  for (const invalid of [{ ...asset, name: '../bad' }, { ...asset, digest: undefined }, { ...asset, browser_download_url: 'https://example.com/file' }]) {
    await assert.rejects(downloadAsset(release(), invalid, directory, async () => assert.fail('invalid asset fetched')));
  }
  assert.deepEqual(await readdir(directory), [asset.name]);
});

test('detects development checkout, npm installation and native channel marker', async t => {
  assert.equal((await detectInstallation(packageRoot())).kind, 'source');
  const directory = await temporary(t);
  const root = join(directory, 'node_modules/execonvert');
  await mkdir(root, { recursive: true });
  assert.equal((await detectInstallation(root, {})).kind, 'npm');
  await writeFile(join(root, 'install-channel.json'), JSON.stringify({ kind: 'deb', platform: process.platform, arch: process.arch }));
  assert.equal((await detectInstallation(root, {})).kind, 'deb');
  assert.equal((await detectInstallation(directory, {})).kind, 'unknown');
});

test('npm updater uses the existing global or local scope and pins release version', async t => {
  const directory = await temporary(t);
  const root = join(directory, 'node_modules/execonvert');
  await mkdir(root, { recursive: true });
  const calls: unknown[] = [];
  const runner = async (args: string[], capture: boolean, cwd?: string) => { calls.push({ args, capture, cwd }); return dirname(root); };
  await installNpm('v0.5.0', root, runner);
  assert.deepEqual(calls[1], { args: ['install', '--global', 'execonvert@0.5.0'], capture: false, cwd: undefined });
  calls.length = 0;
  await writeFile(join(directory, 'package.json'), JSON.stringify({ dependencies: { execonvert: '0.4.2' } }));
  await installNpm('v0.5.0', root, async (args, capture, cwd) => { calls.push({ args, capture, cwd }); return join(directory, 'other/global'); });
  assert.deepEqual(calls[1], { args: ['install', 'execonvert@0.5.0'], capture: false, cwd: await realpath(directory) });
  await assert.rejects(installNpm('v0.5.0', root, async () => { throw new Error('npm failed'); }), /npm failed/);
});
