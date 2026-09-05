import { readFile, writeFile } from 'node:fs/promises';
const { sourceReleaseTag } = JSON.parse(await readFile('app/public/exelearning/runtime-source.json', 'utf8'));
if (!/^v\d+\.\d+\.\d+$/.test(sourceReleaseTag)) throw new Error('Invalid runtime release tag');
const log = await readFile('CHANGELOG.md', 'utf8');
const entry = `### Cambiado\n- Runtime embebido de eXeLearning actualizado a **${sourceReleaseTag}**;\n  comprobadas las conversiones de la CLI y la vista previa web.\n\n`;
if (!log.includes('## [Unreleased]\n')) throw new Error('Missing Unreleased section in CHANGELOG.md');
await writeFile('CHANGELOG.md', log.replace('## [Unreleased]\n', `## [Unreleased]\n\n${entry}`));
