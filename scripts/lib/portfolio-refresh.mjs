import { createHash } from 'node:crypto';
import { lstat, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { generatedProfileOutputPaths } from '../generate-profile-assets.mjs';
import { readmeEndMarker, readmeStartMarker } from './portfolio-index.mjs';

const fullyGeneratedPaths = [
  'PROJECTS.md',
  'portfolio/github-metadata.json',
];

function readmeShell(value) {
  const start = value.indexOf(readmeStartMarker);
  const end = value.indexOf(readmeEndMarker);
  if (start < 0 || end < start) {
    throw new Error('README portfolio markers are missing or out of order');
  }
  if (value.indexOf(readmeStartMarker, start + readmeStartMarker.length) >= 0
      || value.indexOf(readmeEndMarker, end + readmeEndMarker.length) >= 0) {
    throw new Error('README must contain exactly one portfolio marker pair');
  }
  return {
    before: value.slice(0, start),
    after: value.slice(end + readmeEndMarker.length),
  };
}

export function generatedPortfolioPaths(manifest, snapshot) {
  return new Set([
    ...fullyGeneratedPaths,
    'README.md',
    ...generatedProfileOutputPaths(manifest, snapshot),
  ]);
}

export function assertGeneratedOnlyRefresh({
  manifest,
  snapshot,
  changedPaths,
  beforeReadme,
  afterReadme,
}) {
  const allowed = generatedPortfolioPaths(manifest, snapshot);
  const unexpected = [...new Set(changedPaths)].filter((path) => !allowed.has(path)).sort();
  if (unexpected.length > 0) {
    throw new Error(`portfolio refresh changed unexpected authored paths:\n${unexpected.map((path) => `- ${path}`).join('\n')}`);
  }

  if (changedPaths.includes('README.md')) {
    const before = readmeShell(beforeReadme);
    const after = readmeShell(afterReadme);
    if (before.before !== after.before || before.after !== after.after) {
      throw new Error('portfolio refresh changed authored README bytes outside the generated marker pair');
    }
  }
}

export async function fingerprintRefresh(root, paths) {
  const hash = createHash('sha256');
  for (const path of [...new Set(paths)].sort()) {
    const absolutePath = resolve(root, path);
    const stats = await lstat(absolutePath);
    if (!stats.isFile()) throw new Error(`portfolio refresh output is not a regular file: ${path}`);
    hash.update(`${path}\0${stats.mode.toString(8)}\0`);
    hash.update(await readFile(absolutePath));
    hash.update('\0');
  }
  return hash.digest('hex');
}
