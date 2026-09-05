// The eXeLearning release whose runtime is vendored in this repository, kept in
// step with app/public/exelearning/runtime-source.json by
// tests/runtime-version.test.mjs, which npm run sync:exe updates.
export const EXE_RUNTIME_VERSION = '4.0.3';

/**
 * Compares two eXeLearning versions. Returns true when `version` is newer than
 * the vendored runtime, which is the only case worth warning about: a project
 * from an older release converts fine, one from a newer release may carry
 * elements this code does not know about and would drop without saying so.
 */
export function isNewerThanRuntime(version: string | null | undefined): boolean {
  if (!version) {
    return false;
  }

  const parse = (value: string): number[] =>
    value.trim().replace(/^v/, '').split('.').map(part => Number.parseInt(part, 10));

  const candidate = parse(version);
  const runtime = parse(EXE_RUNTIME_VERSION);
  if (candidate.some(Number.isNaN)) {
    return false;
  }

  for (let index = 0; index < Math.max(candidate.length, runtime.length); index += 1) {
    const left = candidate[index] ?? 0;
    const right = runtime[index] ?? 0;
    if (left !== right) {
      return left > right;
    }
  }

  return false;
}
