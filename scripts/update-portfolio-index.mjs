#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { generateProfileAssets } from './generate-profile-assets.mjs';
import {
  assertPublicContent,
  assertValidPortfolio,
  fetchGitHubSnapshot,
  readJson,
  renderProjectsMarkdown,
  renderReadmeProjectBlock,
  replaceReadmeProjectBlock,
} from './lib/portfolio-index.mjs';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export async function updatePortfolioIndex({ root = repoRoot, snapshot } = {}) {
  const manifestPath = resolve(root, 'portfolio/projects.json');
  const snapshotPath = resolve(root, 'portfolio/github-metadata.json');
  const projectsPath = resolve(root, 'PROJECTS.md');
  const readmePath = resolve(root, 'README.md');

  const manifest = await readJson(manifestPath);
  const nextSnapshot = snapshot ?? await fetchGitHubSnapshot(manifest);
  await assertValidPortfolio({ manifest, snapshot: nextSnapshot, repoRoot: root, checkFiles: true });

  const readme = await readFile(readmePath, 'utf8');
  const projectsDocument = renderProjectsMarkdown(manifest, nextSnapshot);
  const nextReadme = replaceReadmeProjectBlock(readme, renderReadmeProjectBlock(manifest, nextSnapshot));
  assertPublicContent(projectsDocument, 'PROJECTS.md');
  assertPublicContent(nextReadme, 'README.md');

  await writeFile(snapshotPath, `${JSON.stringify(nextSnapshot, null, 2)}\n`, 'utf8');
  await writeFile(projectsPath, projectsDocument, 'utf8');
  await writeFile(readmePath, nextReadme, 'utf8');
  await generateProfileAssets({ manifest, snapshot: nextSnapshot, checkOnly: false, root });

  console.log(`updated ${manifest.projects.length} projects from public GitHub metadata captured at ${nextSnapshot.source.retrievedAt}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await updatePortfolioIndex();
}
