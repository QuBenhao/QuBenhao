#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  assertPublicContent,
  assertValidPortfolio,
  diffRepositorySnapshots,
  fetchGitHubSnapshot,
  loadPortfolioFiles,
  renderProjectsMarkdown,
  renderReadmeProjectBlock,
  replaceReadmeProjectBlock,
} from './lib/portfolio-index.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const online = process.argv.includes('--online');
const unsupported = process.argv.slice(2).filter((argument) => argument !== '--online');
if (unsupported.length > 0) {
  console.error('usage: node scripts/validate-portfolio-index.mjs [--online]');
  process.exit(2);
}

const { manifest, snapshot } = await loadPortfolioFiles(repoRoot);
await assertValidPortfolio({ manifest, snapshot, repoRoot, checkFiles: true });

const [readme, projectsDocument] = await Promise.all([
  readFile(resolve(repoRoot, 'README.md'), 'utf8'),
  readFile(resolve(repoRoot, 'PROJECTS.md'), 'utf8'),
]);
const expectedProjectsDocument = renderProjectsMarkdown(manifest, snapshot);
const expectedReadme = replaceReadmeProjectBlock(readme, renderReadmeProjectBlock(manifest, snapshot));
if (projectsDocument !== expectedProjectsDocument) {
  throw new Error('PROJECTS.md is stale; run node scripts/update-portfolio-index.mjs');
}
if (readme !== expectedReadme) {
  throw new Error('README project block is stale; run node scripts/update-portfolio-index.mjs');
}
assertPublicContent(projectsDocument, 'PROJECTS.md');
assertPublicContent(readme, 'README.md');

if (online) {
  const liveSnapshot = await fetchGitHubSnapshot(manifest);
  await assertValidPortfolio({ manifest, snapshot: liveSnapshot, repoRoot, checkFiles: true });
  const differences = diffRepositorySnapshots(snapshot, liveSnapshot);
  if (differences.length > 0) {
    throw new Error(`portfolio snapshot differs from public GitHub metadata:\n${differences.map((difference) => `- ${difference}`).join('\n')}\nrun node scripts/update-portfolio-index.mjs`);
  }
}

console.log(`portfolio index valid: ${manifest.projects.length} projects, source ${snapshot.source.retrievedAt}${online ? ', live source matched' : ''}`);
