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
const manifestPath = resolve(repoRoot, 'portfolio/projects.json');
const snapshotPath = resolve(repoRoot, 'portfolio/github-metadata.json');
const projectsPath = resolve(repoRoot, 'PROJECTS.md');
const readmePath = resolve(repoRoot, 'README.md');

const manifest = await readJson(manifestPath);
const snapshot = await fetchGitHubSnapshot(manifest);
await assertValidPortfolio({ manifest, snapshot, repoRoot, checkFiles: true });

const readme = await readFile(readmePath, 'utf8');
const projectsDocument = renderProjectsMarkdown(manifest, snapshot);
const nextReadme = replaceReadmeProjectBlock(readme, renderReadmeProjectBlock(manifest, snapshot));
assertPublicContent(projectsDocument, 'PROJECTS.md');
assertPublicContent(nextReadme, 'README.md');

await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
await writeFile(projectsPath, projectsDocument, 'utf8');
await writeFile(readmePath, nextReadme, 'utf8');
await generateProfileAssets({ manifest, snapshot, checkOnly: false });

console.log(`updated ${manifest.projects.length} projects from public GitHub metadata captured at ${snapshot.source.retrievedAt}`);
