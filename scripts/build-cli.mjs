import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const distDir = resolve(rootDir, 'dist/cli');
const publicSourceDir = resolve(rootDir, 'app/public');
const publicTargetDir = resolve(distDir, 'app/public');
const tscPath = fileURLToPath(new URL('../node_modules/typescript/bin/tsc', import.meta.url));

function run(command, args) {
  return new Promise((resolvePromise, rejectPromise) => {
    const child = spawn(command, args, {
      cwd: rootDir,
      stdio: 'inherit',
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

await rm(distDir, { recursive: true, force: true });
await run(process.execPath, [tscPath, '-p', 'tsconfig.cli.build.json']);
await mkdir(publicTargetDir, { recursive: true });
await cp(publicSourceDir, publicTargetDir, { recursive: true });
await writeFile(
  resolve(distDir, 'package.json'),
  JSON.stringify(
    {
      type: 'module',
    },
    null,
    2,
  ) + '\n',
  'utf8',
);
