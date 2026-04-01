import { cp, mkdir, rm, chmod, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const rootDir = dirname(dirname(fileURLToPath(new URL('../package.json', import.meta.url))));

function parseArgs(argv) {
  const options = {
    output: '',
    nodeBinary: process.execPath,
    platform: process.platform,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (value === '--output') {
      options.output = argv[index + 1] || '';
      index += 1;
      continue;
    }
    if (value === '--node-binary') {
      options.nodeBinary = argv[index + 1] || options.nodeBinary;
      index += 1;
      continue;
    }
    if (value === '--platform') {
      options.platform = argv[index + 1] || options.platform;
      index += 1;
      continue;
    }
  }

  if (!options.output) {
    throw new Error('Usage: node prepare-bundle.mjs --output <dir> [--node-binary <path>] [--platform <name>]');
  }

  return options;
}

function run(command, args, cwd) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd,
      stdio: 'inherit',
      env: process.env,
      shell: process.platform === 'win32' && /\.cmd$/i.test(command),
    });
    child.on('error', rejectPromise);
    child.on('exit', code => {
      if (code === 0) {
        resolvePromise();
        return;
      }
      rejectPromise(new Error(`${command} ${args.join(' ')} exited with code ${code ?? 1}`));
    });
  });
}

function resolveNpmCommand() {
  return process.platform === 'win32' ? 'npm.cmd' : 'npm';
}

function shellWrapper() {
  return `#!/bin/sh
set -eu
SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
exec "$SELF_DIR/runtime/node/bin/node" "$SELF_DIR/bin/execonvert.js" "$@"
`;
}

function cmdWrapper() {
  return `@echo off
setlocal
set "SELF_DIR=%~dp0"
"%SELF_DIR%runtime\\node\\node.exe" "%SELF_DIR%bin\\execonvert.js" %*
`;
}

const options = parseArgs(process.argv.slice(2));
const outputDir = resolve(options.output);
const nodeBinaryPath = resolve(options.nodeBinary);
const isWindows = options.platform === 'win32';
const distCliDir = resolve(rootDir, 'dist/cli');

if (!existsSync(distCliDir)) {
  throw new Error('dist/cli does not exist. Run "npm run build:cli" first.');
}

await rm(outputDir, { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });

for (const relativePath of ['bin', 'dist/cli', 'README.md', 'THIRD_PARTY_NOTICES.md', 'package.json', 'package-lock.json']) {
  await cp(resolve(rootDir, relativePath), resolve(outputDir, relativePath), { recursive: true });
}

const nodeTargetDir = isWindows
  ? resolve(outputDir, 'runtime/node')
  : resolve(outputDir, 'runtime/node/bin');
await mkdir(nodeTargetDir, { recursive: true });
const nodeTargetPath = isWindows
  ? resolve(nodeTargetDir, 'node.exe')
  : resolve(nodeTargetDir, 'node');
await cp(nodeBinaryPath, nodeTargetPath);
if (!isWindows) {
  await chmod(nodeTargetPath, 0o755);
}

await run(resolveNpmCommand(), ['ci', '--omit=dev', '--ignore-scripts'], outputDir);

const shellScriptPath = resolve(outputDir, 'execonvert');
await cp(resolve(rootDir, 'bin/execonvert.js'), resolve(outputDir, 'bin/execonvert.js'));
await mkdir(dirname(shellScriptPath), { recursive: true });
await writeFile(shellScriptPath, shellWrapper(), 'utf8');
await chmod(shellScriptPath, 0o755);

const cmdScriptPath = resolve(outputDir, 'execonvert.cmd');
await writeFile(cmdScriptPath, cmdWrapper(), 'utf8');
