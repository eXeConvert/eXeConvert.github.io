import { spawn } from 'node:child_process';
import { createHash, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { chmod, mkdir, open, readFile, realpath, rename, rm, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Locale } from '../src/i18n.js';

export const RELEASE_REPO = 'eXeConvert/eXeConvert.github.io';
const RELEASE_URL = `https://github.com/${RELEASE_REPO}/releases`;
const DAY = 24 * 60 * 60 * 1000;
const nativeFetch = globalThis.fetch.bind(globalThis);
type Fetch = typeof fetch;
export type InstallKind = 'source' | 'npm' | 'deb' | 'appimage' | 'pkg' | 'windows' | 'unknown';
export type Installation = { kind: InstallKind; root: string; platform: string; arch: string };
export type Asset = { name: string; browser_download_url: string; size: number; digest?: string | null };
export type Release = { tag_name: string; html_url: string; draft: boolean; prerelease: boolean; assets: Asset[] };

const messages = {
  es: {
    available: 'Hay una actualización de eXeConvert: {current} → {latest}. Ejecuta execonvert update.',
    current: 'eXeConvert {current} está actualizado (última versión estable: {latest}).',
    downloaded: 'Descargado y verificado: {path}',
    installed: 'eXeConvert {latest} instalado mediante npm.',
    source: 'Esta copia es un repositorio de desarrollo. Actualízala mediante Git y recompílala. Versiones publicadas: {url}',
    unknown: 'No se reconoce el tipo de instalación. Descarga el paquete adecuado desde {url}',
    apply: 'Instala el archivo descargado con el instalador del sistema. La instalación actual sigue disponible.',
    appimage: 'Da permiso de ejecución al archivo descargado y úsalo en lugar del AppImage anterior.',
    missing: 'La versión {latest} aún no tiene un paquete para {kind}/{platform}/{arch}. Consulta {url}',
    network: 'No se han podido comprobar las actualizaciones: {message}',
    help: 'Comprueba o descarga actualizaciones de eXeConvert',
    disable: 'Desactiva la comprobación automática de actualizaciones',
  },
  ca: {
    available: 'Hi ha una actualització d’eXeConvert: {current} → {latest}. Executa execonvert update.',
    current: 'eXeConvert {current} està actualitzat (darrera versió estable: {latest}).',
    downloaded: 'Descarregat i verificat: {path}',
    installed: 'eXeConvert {latest} instal·lat mitjançant npm.',
    source: 'Aquesta còpia és un repositori de desenvolupament. Actualitza-la amb Git i recompila-la. Versions publicades: {url}',
    unknown: 'No es reconeix el tipus d’instal·lació. Descarrega el paquet adequat des de {url}',
    apply: 'Instal·la el fitxer descarregat amb l’instal·lador del sistema. La instal·lació actual continua disponible.',
    appimage: 'Dona permís d’execució al fitxer descarregat i fes-lo servir en lloc de l’AppImage anterior.',
    missing: 'La versió {latest} encara no té cap paquet per a {kind}/{platform}/{arch}. Consulta {url}',
    network: 'No s’han pogut comprovar les actualitzacions: {message}',
    help: 'Comprova o descarrega actualitzacions d’eXeConvert',
    disable: 'Desactiva la comprovació automàtica d’actualitzacions',
  },
  en: {
    available: 'eXeConvert update available: {current} → {latest}. Run execonvert update.',
    current: 'eXeConvert {current} is up to date (latest stable: {latest}).',
    downloaded: 'Downloaded and verified: {path}',
    installed: 'eXeConvert {latest} installed using npm.',
    source: 'This is a development checkout. Update it using Git and rebuild. Published releases: {url}',
    unknown: 'Unrecognized installation type. Download the appropriate package from {url}',
    apply: 'Install the downloaded file using the system installer. Your current installation remains available.',
    appimage: 'Make the downloaded file executable and use it in place of the previous AppImage.',
    missing: 'Release {latest} does not have a package for {kind}/{platform}/{arch} yet. See {url}',
    network: 'Could not check for updates: {message}',
    help: 'Check for or download eXeConvert updates',
    disable: 'Disable automatic update checks',
  },
};
export function updateText(locale: Locale, key: keyof typeof messages.en, vars: Record<string, string> = {}): string {
  return messages[locale][key].replace(/\{(\w+)\}/g, (_, name: string) => vars[name] ?? `{${name}}`);
}

// Release tags must be stable SemVer; never install prereleases or compare lexically.
export function stableVersion(value: string): string {
  const match = /^v?((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*))(?:\+[\w.-]+)?$/.exec(value);
  if (!match) throw new Error(`Invalid stable version: ${value}`);
  return match[1];
}
export function isNewer(latest: string, current: string): boolean {
  const a = stableVersion(latest).split('.').map(BigInt);
  const b = stableVersion(current).split('.').map(BigInt);
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i];
  return false;
}

export function packageRoot(): string {
  const dir = dirname(fileURLToPath(import.meta.url));
  return basename(dirname(dir)) === 'cli' && basename(dirname(dirname(dir))) === 'dist'
    ? resolve(dir, '../../..') : resolve(dir, '..');
}
export async function detectInstallation(root = packageRoot(), env = process.env): Promise<Installation> {
  const base = { root, platform: process.platform, arch: process.arch };
  if (existsSync(join(root, 'scripts/build-cli.mjs'))) return { ...base, kind: 'source' };
  try {
    const marker = JSON.parse(await readFile(join(root, 'install-channel.json'), 'utf8'));
    if (['deb', 'appimage', 'pkg', 'windows'].includes(marker.kind) &&
        marker.platform === process.platform && marker.arch === process.arch) return { ...base, kind: marker.kind };
  } catch { /* Older packages did not include a marker. */ }
  if (env.EXECONVERT_RUNTIME_ROOT) {
    if (env.APPIMAGE && process.platform === 'linux') return { ...base, kind: 'appimage' };
    if (process.platform === 'linux' && root === '/opt/execonvert') return { ...base, kind: 'deb' };
    if (process.platform === 'darwin' && root === '/usr/local/lib/execonvert') return { ...base, kind: 'pkg' };
    if (process.platform === 'win32') return { ...base, kind: 'windows' };
  }
  if (basename(dirname(root)) === 'node_modules') return { ...base, kind: 'npm' };
  return { ...base, kind: 'unknown' };
}

export function validateRelease(data: Release): Release {
  if (!data || data.draft || data.prerelease || !Array.isArray(data.assets)) throw new Error('Invalid stable release response');
  stableVersion(data.tag_name);
  if (data.html_url !== `${RELEASE_URL}/tag/${data.tag_name}`) throw new Error('Unexpected release URL');
  return data;
}
export async function latestRelease(fetcher: Fetch = nativeFetch, signal?: AbortSignal): Promise<Release> {
  const response = await fetcher(`https://api.github.com/repos/${RELEASE_REPO}/releases/latest`, {
    headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'execonvert-update', 'X-GitHub-Api-Version': '2022-11-28' },
    signal: signal ?? AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`);
  return validateRelease(await response.json() as Release);
}

export function selectAsset(release: Release, install: Installation): Asset | undefined {
  const version = stableVersion(release.tag_name);
  const { kind, platform, arch } = install;
  let name: string | undefined;
  if (kind === 'npm') name = `execonvert-${version}.tgz`;
  if (kind === 'deb' && platform === 'linux' && arch === 'x64') name = `execonvert_${version}_amd64.deb`;
  if (kind === 'appimage' && platform === 'linux' && arch === 'x64') name = `execonvert-${version}-x86_64.AppImage`;
  if (kind === 'pkg' && platform === 'darwin') name = `execonvert-${version}-${arch}.pkg`;
  if (kind === 'windows' && platform === 'win32') name = `execonvert-${version}-${arch}-setup.exe`;
  // Old Windows releases were built on x64. Old macOS assets do not identify
  // their architecture, so do not guess which processor they support.
  if (kind === 'windows' && arch === 'x64' && !release.assets.some(a => a.name === name)) name = `execonvert-${version}-setup.exe`;
  return release.assets.find(asset => asset.name === name);
}

export function updateCacheDir(env = process.env, platform: string = process.platform): string {
  const base = platform === 'win32' ? (env.LOCALAPPDATA || join(homedir(), 'AppData/Local'))
    : platform === 'darwin' ? join(homedir(), 'Library/Caches') : (env.XDG_CACHE_HOME || join(homedir(), '.cache'));
  return join(base, 'execonvert');
}
export function autoCheckAllowed(options: { json: boolean; disabled: boolean; command: string }, env = process.env,
  interactive = Boolean(process.stdout.isTTY && process.stderr.isTTY)): boolean {
  return interactive && !options.json && !options.disabled && !env.CI && env.EXECONVERT_NO_UPDATE_CHECK !== '1' &&
    !['help', 'version', 'update'].includes(options.command);
}

// The caller aborts on completion: checking cannot hold up a conversion's exit.
// A lock serializes concurrent CLI launches. Failed requests are throttled too.
export async function automaticCheck(current: string, locale: Locale, signal: AbortSignal, options: {
  cacheDir?: string; fetcher?: Fetch; notify?: (message: string) => void; now?: number;
} = {}): Promise<void> {
  const cacheDir = options.cacheDir ?? updateCacheDir();
  const lock = join(cacheDir, 'update-check.lock');
  let ownsLock = false;
  try {
    if (signal.aborted) return;
    const now = options.now ?? Date.now();
    await mkdir(cacheDir, { recursive: true });
    // An expired lock can only belong to a crashed process: requests last <= 3s.
    try { if (Date.now() - (await stat(lock)).mtimeMs > DAY) await rm(lock, { force: true }); } catch { /* No lock. */ }
    const handle = await open(lock, 'wx');
    ownsLock = true;
    try { await handle.writeFile(String(now)); } finally { await handle.close(); }
    const statePath = join(cacheDir, 'update-check.json');
    try {
      const state = JSON.parse(await readFile(statePath, 'utf8'));
      if (Number.isFinite(state.checkedAt) && now >= state.checkedAt && now - state.checkedAt < DAY) return;
    } catch { /* Missing or corrupt cache. */ }
    if (signal.aborted) return;
    await writeFile(statePath, JSON.stringify({ checkedAt: now }));
    const release = await latestRelease(options.fetcher, AbortSignal.any([signal, AbortSignal.timeout(3000)]));
    if (!signal.aborted && isNewer(release.tag_name, current)) {
      (options.notify ?? (message => process.stderr.write(`${message}\n`)))(
        updateText(locale, 'available', { current, latest: stableVersion(release.tag_name) }));
    }
  } catch { /* Update availability must never make a conversion fail. */ }
  finally { if (ownsLock) await rm(lock, { force: true }).catch(() => {}); }
}

export async function downloadAsset(release: Release, asset: Asset, directory: string,
  fetcher: Fetch = nativeFetch): Promise<string> {
  const expected = `https://github.com/${RELEASE_REPO}/releases/download/${release.tag_name}/${asset.name}`;
  if (!/^[\w.-]+$/.test(asset.name) || asset.browser_download_url !== expected) throw new Error('Unexpected asset URL or filename');
  if (!Number.isSafeInteger(asset.size) || asset.size <= 0 || asset.size > 2_000_000_000) throw new Error('Invalid download size');
  if (!/^sha256:[a-f0-9]{64}$/i.test(asset.digest ?? '')) throw new Error('Release asset is missing its SHA-256 digest');
  await mkdir(directory, { recursive: true });
  const target = join(directory, asset.name);
  const temporary = join(directory, `.${asset.name}.${randomUUID()}.part`);
  const file = await open(temporary, 'wx', 0o600);
  try {
    const response = await fetcher(expected, { signal: AbortSignal.timeout(10 * 60 * 1000) });
    if (!response.ok || !response.body) throw new Error(`Download HTTP ${response.status}`);
    const hash = createHash('sha256');
    let size = 0;
    for await (const chunk of response.body as unknown as AsyncIterable<Uint8Array>) {
      size += chunk.byteLength;
      if (size > asset.size) throw new Error('Download exceeds expected size');
      hash.update(chunk);
      await file.writeFile(chunk);
    }
    if (size !== asset.size || `sha256:${hash.digest('hex')}` !== asset.digest?.toLowerCase()) throw new Error('Download checksum or size mismatch');
    await file.close();
    await rename(temporary, target);
    if (asset.name.endsWith('.AppImage')) await chmod(target, 0o700);
    return target;
  } catch (error) {
    await file.close().catch(() => {});
    await rm(temporary, { force: true });
    throw error;
  }
}

export function runNpm(args: string[], capture: boolean, cwd?: string): Promise<string> {
  return new Promise((done, fail) => {
    // Windows npm.cmd requires cmd.exe; only fixed arguments and validated
    // versions are passed to it. Paths are supplied via cwd or npm config env.
    const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', args, {
      cwd, shell: process.platform === 'win32', stdio: capture ? ['ignore', 'pipe', 'pipe'] : ['inherit', 'pipe', 'pipe'],
    });
    let output = '';
    child.stdout?.on('data', chunk => { if (capture) output += chunk; else process.stderr.write(chunk); });
    child.stderr?.on('data', chunk => { if (!capture) process.stderr.write(chunk); });
    child.on('error', fail);
    child.on('exit', code => code === 0 ? done(output.trim()) : fail(new Error(`npm exited with code ${code}`)));
  });
}

export async function installNpm(version: string, root: string, runner = runNpm): Promise<void> {
  // Use the same npm scope/prefix that owns this installation. Never silently
  // install a second global copy when this one belongs to a local project.
  const globalRoot = await runner(['root', '--global'], true);
  const owner = await realpath(dirname(root));
  if (!globalRoot) throw new Error('npm did not report its global installation directory');
  const globalOwner = await realpath(globalRoot).catch(() => resolve(globalRoot));
  if (owner === globalOwner) {
    await runner(['install', '--global', `execonvert@${stableVersion(version)}`], false);
  } else {
    const project = dirname(owner);
    // A different npm prefix must not be mistaken for a local project.
    try { await readFile(join(project, 'package.json'), 'utf8'); }
    catch { throw new Error(`Cannot locate the npm installation scope for ${root}. Use the npm/prefix that installed this copy.`); }
    await runner(['install', `execonvert@${stableVersion(version)}`], false, project);
  }
}

export async function runUpdate(options: { current: string; locale: Locale; check: boolean; json: boolean; outDir?: string }): Promise<void> {
  const { current, locale, check, json } = options;
  let release: Release;
  try { release = await latestRelease(); }
  catch (error) { throw new Error(updateText(locale, 'network', { message: String(error instanceof Error ? error.message : error) })); }
  const latest = stableVersion(release.tag_name);
  const installation = await detectInstallation();
  const available = isNewer(latest, current);
  const result: Record<string, unknown> = { current, latest, available, installation: installation.kind, url: release.html_url, action: 'checked' };
  const emit = (text: string) => { if (!json) process.stdout.write(`${text}\n`); };
  if (check || !available) emit(updateText(locale, available ? 'available' : 'current', { current, latest }));
  else if (installation.kind === 'source' || installation.kind === 'unknown') {
    result.action = 'manual';
    emit(updateText(locale, installation.kind, { url: release.html_url }));
  } else if (installation.kind === 'npm') {
    await installNpm(latest, installation.root);
    result.action = 'installed';
    emit(updateText(locale, 'installed', { latest }));
  } else {
    const asset = selectAsset(release, installation);
    if (!asset) throw new Error(updateText(locale, 'missing', { latest, ...installation, url: release.html_url }));
    const path = await downloadAsset(release, asset, resolve(options.outDir ?? join(updateCacheDir(), 'downloads', latest)));
    result.action = 'downloaded'; result.path = path;
    result.installationRequired = true;
    emit(updateText(locale, 'downloaded', { path }));
    emit(updateText(locale, installation.kind === 'appimage' ? 'appimage' : 'apply'));
  }
  if (json) process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}
