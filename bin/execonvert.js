#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const distCliPath = fileURLToPath(new URL('../dist/cli/cli/execonvert.js', import.meta.url));
const cliPath = fileURLToPath(new URL('../cli/execonvert.ts', import.meta.url));
const tsxCliPath = fileURLToPath(new URL('../node_modules/tsx/dist/cli.mjs', import.meta.url));

const args = existsSync(distCliPath)
  ? [distCliPath, ...process.argv.slice(2)]
  : [tsxCliPath, cliPath, ...process.argv.slice(2)];

const result = spawnSync(process.execPath, args, { stdio: 'inherit' });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
