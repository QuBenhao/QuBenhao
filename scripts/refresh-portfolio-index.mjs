#!/usr/bin/env node

import { execFile, spawn } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';

import { generatedPortfolioPaths, assertGeneratedOnlyRefresh, fingerprintRefresh } from './lib/portfolio-refresh.mjs';
import { fetchGitHubSnapshot, readJson } from './lib/portfolio-index.mjs';
import { updatePortfolioIndex } from './update-portfolio-index.mjs';

const execFileAsync = promisify(execFile);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const verifyExisting = process.argv.includes('--verify-existing');
const unsupported = process.argv.slice(2).filter((argument) => argument !== '--verify-existing');
if (unsupported.length > 0) {
  console.error('usage: node scripts/refresh-portfolio-index.mjs [--verify-existing]');
  process.exit(2);
}

async function git(args, options = {}) {
  const { stdout } = await execFileAsync('git', args, {
    cwd: repoRoot,
    encoding: options.encoding ?? 'utf8',
    maxBuffer: 16 * 1024 * 1024,
  });
  return stdout;
}

function nulPaths(value) {
  return value.toString('utf8').split('\0').filter(Boolean);
}

async function gitState() {
  const [cached, unstaged, untracked] = await Promise.all([
    git(['diff', '--cached', '--no-renames', '--name-only', '-z', 'HEAD', '--'], { encoding: 'buffer' }),
    git(['diff', '--no-renames', '--name-only', '-z', '--'], { encoding: 'buffer' }),
    git(['ls-files', '--others', '--exclude-standard', '-z'], { encoding: 'buffer' }),
  ]);
  const cachedPaths = nulPaths(cached);
  const unstagedPaths = nulPaths(unstaged);
  const untrackedPaths = nulPaths(untracked);
  return {
    cachedPaths,
    unstagedPaths,
    untrackedPaths,
    paths: [...new Set([...cachedPaths, ...unstagedPaths, ...untrackedPaths])].sort(),
  };
}

async function cachedPatch() {
  return git(['diff', '--cached', '--binary', '--full-index', '--no-ext-diff', 'HEAD', '--'], { encoding: 'buffer' });
}

function assertComputeState(state) {
  if (state.cachedPaths.length > 0) {
    throw new Error(`portfolio updater staged paths unexpectedly:\n${state.cachedPaths.map((path) => `- ${path}`).join('\n')}`);
  }
}

function assertDeliveryState(state) {
  const worktreeOnly = [...new Set([...state.unstagedPaths, ...state.untrackedPaths])].sort();
  if (worktreeOnly.length > 0) {
    throw new Error(`portfolio delivery candidate lacks index/worktree parity:\n${worktreeOnly.map((path) => `- ${path}`).join('\n')}`);
  }
  if (state.cachedPaths.length === 0) {
    throw new Error('portfolio delivery candidate has no staged refresh');
  }
}

async function runVerifier() {
  await new Promise((resolvePromise, reject) => {
    const child = spawn('bash', ['scripts/verify-profile.sh', 'all'], {
      cwd: repoRoot,
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`profile verifier failed with ${signal ? `signal ${signal}` : `exit ${code}`}`));
    });
  });
}

const manifest = await readJson(resolve(repoRoot, 'portfolio/projects.json'));
const beforeReadme = verifyExisting
  ? await git(['show', 'HEAD:README.md'])
  : await readFile(resolve(repoRoot, 'README.md'), 'utf8');
let guardedFingerprint;
let guardedPatch;

if (!verifyExisting) {
  const initialState = await gitState();
  if (initialState.paths.length > 0) {
    throw new Error(`portfolio refresh requires a clean checkout:\n${initialState.paths.map((path) => `- ${path}`).join('\n')}`);
  }

  const capturedSnapshot = await fetchGitHubSnapshot(manifest);
  await updatePortfolioIndex({ root: repoRoot, snapshot: capturedSnapshot });
  const firstState = await gitState();
  assertComputeState(firstState);
  const firstReadme = await readFile(resolve(repoRoot, 'README.md'), 'utf8');
  assertGeneratedOnlyRefresh({
    manifest,
    snapshot: capturedSnapshot,
    changedPaths: firstState.paths,
    beforeReadme,
    afterReadme: firstReadme,
  });
  const firstFingerprint = await fingerprintRefresh(repoRoot, firstState.paths);

  await updatePortfolioIndex({ root: repoRoot, snapshot: capturedSnapshot });
  const secondState = await gitState();
  assertComputeState(secondState);
  const secondReadme = await readFile(resolve(repoRoot, 'README.md'), 'utf8');
  assertGeneratedOnlyRefresh({
    manifest,
    snapshot: capturedSnapshot,
    changedPaths: secondState.paths,
    beforeReadme,
    afterReadme: secondReadme,
  });
  const secondFingerprint = await fingerprintRefresh(repoRoot, secondState.paths);
  if (firstFingerprint !== secondFingerprint) {
    throw new Error('portfolio updater is not stable for one captured source observation');
  }
  guardedFingerprint = secondFingerprint;
} else {
  const state = await gitState();
  assertDeliveryState(state);
  const currentSnapshot = await readJson(resolve(repoRoot, 'portfolio/github-metadata.json'));
  assertGeneratedOnlyRefresh({
    manifest,
    snapshot: currentSnapshot,
    changedPaths: state.paths,
    beforeReadme,
    afterReadme: await readFile(resolve(repoRoot, 'README.md'), 'utf8'),
  });
  guardedPatch = await cachedPatch();
}

await runVerifier();
const finalState = await gitState();
const finalSnapshot = await readJson(resolve(repoRoot, 'portfolio/github-metadata.json'));
assertGeneratedOnlyRefresh({
  manifest,
  snapshot: finalSnapshot,
  changedPaths: finalState.paths,
  beforeReadme,
  afterReadme: await readFile(resolve(repoRoot, 'README.md'), 'utf8'),
});
if (verifyExisting) {
  assertDeliveryState(finalState);
  if (!guardedPatch.equals(await cachedPatch())) {
    throw new Error('profile verifier mutated the staged refresh patch');
  }
} else {
  assertComputeState(finalState);
  if (await fingerprintRefresh(repoRoot, finalState.paths) !== guardedFingerprint) {
    throw new Error('profile verifier mutated the guarded refresh candidate');
  }
}
const allowedCount = generatedPortfolioPaths(manifest, finalSnapshot).size;
console.log(`portfolio refresh verified: ${finalState.paths.length} changed generated files, ${allowedCount} exact generated surfaces allowed`);
