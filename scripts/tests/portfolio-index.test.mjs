import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  assertValidPortfolio,
  renderProjectsMarkdown,
  renderReadmeProjectBlock,
} from '../lib/portfolio-index.mjs';

const fixtureRoot = resolve(dirname(fileURLToPath(import.meta.url)), 'fixtures/portfolio');

async function fixture(name) {
  return JSON.parse(await readFile(resolve(fixtureRoot, name), 'utf8'));
}

function setPath(value, path, replacement) {
  const keys = path.split('.');
  let target = value;
  for (const key of keys.slice(0, -1)) target = target[key];
  target[keys.at(-1)] = replacement;
}

const valid = await fixture('valid.json');

test('valid portfolio data renders deterministic public documents', async () => {
  await assertValidPortfolio({
    manifest: valid.manifest,
    snapshot: valid.snapshot,
    repoRoot: fixtureRoot,
    now: valid.now,
    checkFiles: false,
  });
  const index = renderProjectsMarkdown(valid.manifest, valid.snapshot);
  const readmeBlock = renderReadmeProjectBlock(valid.manifest, valid.snapshot);
  assert.match(index, /\[example\]\(https:\/\/github\.com\/QuBenhao\/example\)/);
  assert.match(index, /\| `active` \|/);
  assert.match(readmeBlock, /src="\.\/assets\/projects\/example\.svg"/);
  assert.doesNotMatch(`${index}\n${readmeBlock}`, /\/Users\/|\/home\/|file:\/\//);
});

test('rejects a project asset symlink that escapes the repository', async () => {
  const sandbox = await mkdtemp(join(tmpdir(), 'portfolio-index-'));
  const repoRoot = resolve(sandbox, 'repo');
  const assetDirectory = resolve(repoRoot, 'assets/projects');
  const outsideAsset = resolve(sandbox, 'outside.svg');
  try {
    await mkdir(assetDirectory, { recursive: true });
    await writeFile(outsideAsset, '<svg/>\n', 'utf8');
    await symlink(outsideAsset, resolve(assetDirectory, 'example.svg'));
    await assert.rejects(
      assertValidPortfolio({
        manifest: valid.manifest,
        snapshot: valid.snapshot,
        repoRoot,
        now: valid.now,
        checkFiles: true,
      }),
      /\[path-owner\] assets\/projects\/example\.svg resolves outside the repository/,
    );
  } finally {
    await rm(sandbox, { recursive: true, force: true });
  }
});

for (const [name, label] of [
  ['wrong-owner.json', 'rejects repository owner spoofing'],
  ['wrong-link.json', 'rejects non-canonical repository links'],
  ['path-escape.json', 'rejects project asset path escape'],
  ['status-drift.json', 'rejects stated status drift'],
  ['stale-source.json', 'rejects stale source metadata'],
]) {
  test(label, async () => {
    const invalid = structuredClone(valid);
    const mutation = await fixture(name);
    setPath(invalid, mutation.path, mutation.value);
    await assert.rejects(
      assertValidPortfolio({
        manifest: invalid.manifest,
        snapshot: invalid.snapshot,
        repoRoot: fixtureRoot,
        now: invalid.now,
        checkFiles: false,
      }),
      (error) => {
        assert.match(error.message, new RegExp(mutation.expected.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
        return true;
      },
    );
  });
}
