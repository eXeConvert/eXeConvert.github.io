// A mistyped option used to be taken as a filename and dropped in silence,
// while the conversion wrote to its default destination -- overwriting a file
// the caller believed they had redirected away from.
import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { resolve } from 'node:path';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const cli = resolve(root, 'dist/cli/cli/execonvert.js');
const call = args => run(process.execPath, [cli, ...args], { cwd: root, timeout: 60000 });

test('a single-dash option is rejected instead of taken as a file', async () => {
  const error = await call(['input.docx', '--to', 'elpx', '-o', 'out.elpx']).then(
    () => null,
    failure => failure,
  );
  assert.ok(error, 'the command should fail');
  assert.match(error.stderr + error.stdout, /-o/);
  assert.equal(error.code, 1);
});

test('skipped inputs are reported, not dropped in silence', async () => {
  // A .elpx cannot be converted to .elpx: it is skipped, and that must be said.
  const { stderr } = await call([
    resolve(root, 'app/public/base.elpx'), '--to', 'elpx',
  ]).catch(failure => failure);
  assert.match(stderr, /base\.elpx/);
});
