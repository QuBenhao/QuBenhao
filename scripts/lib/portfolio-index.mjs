import { readFile, realpath } from 'node:fs/promises';
import { isAbsolute, posix, resolve, sep, win32 } from 'node:path';

export const readmeStartMarker = '<!-- portfolio-projects:start -->';
export const readmeEndMarker = '<!-- portfolio-projects:end -->';

const githubApiVersion = '2022-11-28';
const snapshotRepositoryKeys = [
  'name',
  'fullName',
  'owner',
  'htmlUrl',
  'description',
  'language',
  'topics',
  'archived',
  'disabled',
  'visibility',
  'fork',
  'defaultBranch',
  'updatedAt',
  'pushedAt',
  'status',
];

const privateMaterialPatterns = [
  { label: 'macOS home path', pattern: /(?:^|[\s('"`])\/Users\/[A-Za-z0-9._-]+\// },
  { label: 'Linux home path', pattern: /(?:^|[\s('"`])\/home\/[A-Za-z0-9._-]+\// },
  { label: 'Windows home path', pattern: /[A-Za-z]:\\Users\\[^\\\s]+\\/i },
  { label: 'local file URL', pattern: /file:\/\//i },
  { label: 'private key', pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
  { label: 'GitHub token', pattern: /(?:gh[pousr]_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,})/ },
  { label: 'credential query parameter', pattern: /(?:token|password|secret|api[_-]?key)=[^&\s]+/i },
];

export class PortfolioValidationError extends Error {
  constructor(issues) {
    super(`portfolio validation failed:\n${issues.map((issue) => `- ${issue}`).join('\n')}`);
    this.name = 'PortfolioValidationError';
    this.issues = issues;
  }
}

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function loadPortfolioFiles(repoRoot) {
  const [manifest, snapshot] = await Promise.all([
    readJson(resolve(repoRoot, 'portfolio/projects.json')),
    readJson(resolve(repoRoot, 'portfolio/github-metadata.json')),
  ]);
  return { manifest, snapshot };
}

export function canonicalRepositoryUrl(repository) {
  return `https://github.com/${repository}`;
}

export function repositoryStatus(repository) {
  if (repository.disabled) return 'disabled';
  if (repository.archived) return 'archived';
  return 'active';
}

function isRecord(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function checkExactKeys(value, expected, label, issue) {
  if (!isRecord(value)) {
    issue('schema', `${label} must be an object`);
    return false;
  }

  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  const unknown = actual.filter((key) => !wanted.includes(key));
  const missing = wanted.filter((key) => !actual.includes(key));
  if (unknown.length > 0) issue('schema', `${label} has unknown keys: ${unknown.join(', ')}`);
  if (missing.length > 0) issue('schema', `${label} is missing keys: ${missing.join(', ')}`);
  return unknown.length === 0 && missing.length === 0;
}

function findPrivateMaterial(value) {
  for (const { label, pattern } of privateMaterialPatterns) {
    if (pattern.test(value)) return label;
  }
  return null;
}

export function assertPublicContent(value, label) {
  const match = findPrivateMaterial(value);
  if (match) throw new Error(`${label} contains ${match}`);
}

function safeAssetPath(asset) {
  if (typeof asset !== 'string' || asset.length === 0) return false;
  if (asset.includes('\\') || asset.includes('\0')) return false;
  if (isAbsolute(asset) || win32.isAbsolute(asset)) return false;
  if (posix.normalize(asset) !== asset) return false;
  return asset.startsWith('assets/projects/') && asset.endsWith('.svg');
}

function parseTimestamp(value) {
  if (typeof value !== 'string') return Number.NaN;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? timestamp : Number.NaN;
}

export async function collectPortfolioIssues({
  manifest,
  snapshot,
  repoRoot,
  now = new Date(),
  checkFiles = true,
}) {
  const issues = [];
  const issue = (code, message) => issues.push(`[${code}] ${message}`);

  checkExactKeys(manifest, ['schemaVersion', 'owner', 'source', 'projects'], 'manifest', issue);
  if (!isRecord(manifest)) return issues;
  checkExactKeys(manifest.source, ['apiBaseUrl', 'maxAgeDays'], 'manifest.source', issue);

  if (manifest.schemaVersion !== 1) issue('schema', 'manifest.schemaVersion must be 1');
  if (typeof manifest.owner !== 'string' || !/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$/.test(manifest.owner)) {
    issue('repository-owner', 'manifest.owner is not a valid GitHub owner');
  }
  if (manifest.source?.apiBaseUrl !== 'https://api.github.com') {
    issue('source', 'manifest.source.apiBaseUrl must be https://api.github.com');
  }
  if (!Number.isInteger(manifest.source?.maxAgeDays) || manifest.source.maxAgeDays < 1 || manifest.source.maxAgeDays > 30) {
    issue('source-freshness', 'manifest.source.maxAgeDays must be an integer from 1 through 30');
  }
  if (!Array.isArray(manifest.projects) || manifest.projects.length === 0) {
    issue('schema', 'manifest.projects must be a non-empty array');
  }

  checkExactKeys(snapshot, ['schemaVersion', 'source', 'repositories'], 'snapshot', issue);
  if (!isRecord(snapshot)) return issues;
  checkExactKeys(snapshot.source, ['provider', 'apiVersion', 'retrievedAt'], 'snapshot.source', issue);
  if (snapshot.schemaVersion !== 1) issue('schema', 'snapshot.schemaVersion must be 1');
  if (snapshot.source?.provider !== 'github-rest') issue('source', 'snapshot source provider must be github-rest');
  if (snapshot.source?.apiVersion !== githubApiVersion) {
    issue('source', `snapshot API version must be ${githubApiVersion}`);
  }
  if (!Array.isArray(snapshot.repositories)) issue('schema', 'snapshot.repositories must be an array');

  const nowMs = now instanceof Date ? now.getTime() : Date.parse(now);
  const retrievedAtMs = parseTimestamp(snapshot.source?.retrievedAt);
  if (!Number.isFinite(retrievedAtMs)) {
    issue('source-freshness', 'snapshot.source.retrievedAt must be an ISO timestamp');
  } else if (!Number.isFinite(nowMs)) {
    issue('source-freshness', 'validation time is invalid');
  } else {
    const futureToleranceMs = 5 * 60 * 1000;
    if (retrievedAtMs > nowMs + futureToleranceMs) {
      issue('source-freshness', 'snapshot source timestamp is in the future');
    }
    const maxAgeMs = Number(manifest.source?.maxAgeDays) * 24 * 60 * 60 * 1000;
    if (Number.isFinite(maxAgeMs) && nowMs - retrievedAtMs > maxAgeMs) {
      issue('source-freshness', `snapshot is older than ${manifest.source.maxAgeDays} days`);
    }
  }

  const projects = Array.isArray(manifest.projects) ? manifest.projects : [];
  const repositories = Array.isArray(snapshot.repositories) ? snapshot.repositories : [];
  const repositoryByName = new Map();
  const projectNames = new Set();
  const assetPaths = new Set();

  for (const [index, repository] of repositories.entries()) {
    const label = `snapshot.repositories[${index}]`;
    checkExactKeys(repository, snapshotRepositoryKeys, label, issue);
    if (!isRecord(repository)) continue;
    if (typeof repository.fullName === 'string') {
      if (repositoryByName.has(repository.fullName)) issue('repository-owner', `duplicate repository ${repository.fullName}`);
      repositoryByName.set(repository.fullName, repository);
    }
  }

  let rootRealPath;
  if (checkFiles) {
    try {
      rootRealPath = await realpath(repoRoot);
    } catch (error) {
      issue('path-owner', `cannot resolve repository root: ${error.message}`);
    }
  }

  for (const [index, project] of projects.entries()) {
    const label = `manifest.projects[${index}]`;
    checkExactKeys(project, ['repository', 'asset'], label, issue);
    if (!isRecord(project)) continue;

    const repositoryName = project.repository;
    if (typeof repositoryName !== 'string' || !repositoryName.startsWith(`${manifest.owner}/`)) {
      issue('repository-owner', `${label}.repository must be owned by ${manifest.owner}`);
    } else if (!/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repositoryName)) {
      issue('repository-owner', `${label}.repository is not owner/name`);
    }
    if (projectNames.has(repositoryName)) issue('repository-owner', `duplicate project ${repositoryName}`);
    projectNames.add(repositoryName);

    if (!safeAssetPath(project.asset)) {
      issue('path-owner', `${label}.asset must be a normalized path below assets/projects`);
    } else {
      if (assetPaths.has(project.asset)) issue('path-owner', `duplicate project asset ${project.asset}`);
      assetPaths.add(project.asset);
      if (checkFiles && rootRealPath) {
        try {
          const assetRealPath = await realpath(resolve(rootRealPath, project.asset));
          if (assetRealPath !== rootRealPath && !assetRealPath.startsWith(`${rootRealPath}${sep}`)) {
            issue('path-owner', `${project.asset} resolves outside the repository`);
          }
        } catch (error) {
          issue('path-owner', `${project.asset} cannot be resolved: ${error.message}`);
        }
      }
    }

    const repository = repositoryByName.get(repositoryName);
    if (!repository) {
      issue('source', `snapshot is missing ${repositoryName}`);
      continue;
    }
    const expectedName = repositoryName.split('/')[1];
    const expectedUrl = canonicalRepositoryUrl(repositoryName);
    if (repository.owner !== manifest.owner) issue('repository-owner', `${repositoryName} reports owner ${repository.owner}`);
    if (repository.name !== expectedName || repository.fullName !== repositoryName) {
      issue('repository-owner', `${repositoryName} identity does not match its snapshot record`);
    }
    if (repository.htmlUrl !== expectedUrl) issue('repository-link', `${repositoryName} must link to ${expectedUrl}`);
    if (repository.visibility !== 'public') issue('repository-owner', `${repositoryName} is not public`);
    if (repository.fork !== false) issue('repository-owner', `${repositoryName} must not be a fork`);
    if (typeof repository.archived !== 'boolean' || typeof repository.disabled !== 'boolean') {
      issue('project-status', `${repositoryName} archive and disabled flags must be booleans`);
    } else if (repository.status !== repositoryStatus(repository)) {
      issue('project-status', `${repositoryName} status ${repository.status} disagrees with GitHub state`);
    }
    if (!['active', 'archived', 'disabled'].includes(repository.status)) {
      issue('project-status', `${repositoryName} has unsupported status ${repository.status}`);
    }
    if (typeof repository.defaultBranch !== 'string' || repository.defaultBranch.length === 0) {
      issue('source', `${repositoryName} has no default branch`);
    }
    for (const [field, value] of [['updatedAt', repository.updatedAt], ['pushedAt', repository.pushedAt]]) {
      const timestamp = parseTimestamp(value);
      if (!Number.isFinite(timestamp)) issue('source', `${repositoryName}.${field} must be an ISO timestamp`);
      if (Number.isFinite(timestamp) && Number.isFinite(retrievedAtMs) && timestamp > retrievedAtMs + 5 * 60 * 1000) {
        issue('source-freshness', `${repositoryName}.${field} is later than the source capture`);
      }
    }
    if (repository.description !== null && typeof repository.description !== 'string') {
      issue('schema', `${repositoryName}.description must be a string or null`);
    }
    if (repository.language !== null && typeof repository.language !== 'string') {
      issue('schema', `${repositoryName}.language must be a string or null`);
    }
    if (!Array.isArray(repository.topics) || repository.topics.some((topic) => typeof topic !== 'string')) {
      issue('schema', `${repositoryName}.topics must contain strings`);
    }
  }

  for (const repositoryName of repositoryByName.keys()) {
    if (!projectNames.has(repositoryName)) issue('source', `snapshot contains unselected repository ${repositoryName}`);
  }
  if (repositories.length !== projects.length) {
    issue('source', `snapshot has ${repositories.length} repositories for ${projects.length} projects`);
  }

  const privateMaterial = findPrivateMaterial(JSON.stringify({ manifest, snapshot }));
  if (privateMaterial) issue('public-content', `portfolio source contains ${privateMaterial}`);

  return issues;
}

export async function assertValidPortfolio(options) {
  const issues = await collectPortfolioIssues(options);
  if (issues.length > 0) throw new PortfolioValidationError(issues);
}

function repositoryMap(snapshot) {
  return new Map(snapshot.repositories.map((repository) => [repository.fullName, repository]));
}

export function selectedRepositories(manifest, snapshot) {
  const byName = repositoryMap(snapshot);
  return manifest.projects.map((project) => ({ project, repository: byName.get(project.repository) }));
}

function escapeMarkdownCell(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('|', '\\|')
    .replaceAll('\r', ' ')
    .replaceAll('\n', ' ');
}

function escapeHtmlAttribute(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

export function renderProjectsMarkdown(manifest, snapshot) {
  const captured = new Date(snapshot.source.retrievedAt).toISOString();
  const rows = selectedRepositories(manifest, snapshot).map(({ repository }) => {
    const description = repository.description || 'No public description.';
    const language = repository.language || '—';
    const pushed = repository.pushedAt.slice(0, 10);
    return `| [${escapeMarkdownCell(repository.name)}](${repository.htmlUrl}) | \`${repository.status}\` | ${escapeMarkdownCell(description)} | ${escapeMarkdownCell(language)} | ${pushed} |`;
  });

  return `<!-- Generated by scripts/update-portfolio-index.mjs; do not edit by hand. -->
# Verified project index

This index is generated from public [GitHub repository metadata](https://docs.github.com/en/rest/repos/repos#get-a-repository) captured at **${captured}**. A status of \`active\` means GitHub marks the repository as neither archived nor disabled; it is not a maintenance promise. Validation rejects non-public or forked sources, owner/link mismatches, unsafe asset paths, status drift, and snapshots older than ${manifest.source.maxAgeDays} days.

| Project | Status | Public description | Primary language | Last source push |
| --- | --- | --- | --- | --- |
${rows.join('\n')}
`;
}

export function renderReadmeProjectBlock(manifest, snapshot) {
  const cards = selectedRepositories(manifest, snapshot).map(({ project, repository }) => {
    const description = repository.description || `${repository.name} public repository`;
    const alt = escapeHtmlAttribute(`${repository.name} — ${description}`);
    return `<a href="${repository.htmlUrl}"><img src="./${project.asset}" alt="${alt}" width="380" /></a>`;
  });
  const rows = [];
  for (let index = 0; index < cards.length; index += 2) {
    rows.push(`  ${cards.slice(index, index + 2).join('')}<br>`);
  }

  return `${readmeStartMarker}
<p align="center">
${rows.join('\n')}
</p>
<p align="center">
  <a href="./PROJECTS.md">Verified project index</a> · public source ownership, status, and freshness checked in CI
</p>
${readmeEndMarker}`;
}

export function replaceReadmeProjectBlock(readme, generatedBlock) {
  const start = readme.indexOf(readmeStartMarker);
  const end = readme.indexOf(readmeEndMarker);
  if (start < 0 || end < 0 || end < start) {
    throw new Error('README portfolio markers are missing or out of order');
  }
  if (readme.indexOf(readmeStartMarker, start + readmeStartMarker.length) >= 0
      || readme.indexOf(readmeEndMarker, end + readmeEndMarker.length) >= 0) {
    throw new Error('README must contain exactly one portfolio marker pair');
  }
  return `${readme.slice(0, start)}${generatedBlock}${readme.slice(end + readmeEndMarker.length)}`;
}

function wrapText(value, width = 54, maxLines = 2) {
  const words = String(value).trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return ['No public description.'];
  const lines = [];
  let current = '';
  while (words.length > 0 && lines.length < maxLines) {
    const word = words.shift();
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= width || current.length === 0) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = word;
  }
  if (current && lines.length < maxLines) lines.push(current);
  if (words.length > 0) {
    const last = lines.length - 1;
    lines[last] = `${lines[last].slice(0, Math.max(1, width - 1)).trimEnd()}…`;
  }
  return lines;
}

export function projectCardData(manifest, snapshot) {
  return selectedRepositories(manifest, snapshot).map(({ project, repository }) => {
    const tagValues = [repository.language, ...repository.topics]
      .filter(Boolean)
      .filter((value, index, values) => values.findIndex((candidate) => candidate.toLowerCase() === value.toLowerCase()) === index)
      .slice(0, 3)
      .map((value) => value.replaceAll('-', ' ').toUpperCase());
    return {
      file: project.asset,
      title: repository.name,
      lines: wrapText(repository.description || 'No public description.'),
      tags: tagValues.length > 0 ? tagValues.join(' · ') : 'PUBLIC SOURCE · GITHUB',
      status: repository.status,
    };
  });
}

function normalizeApiRepository(value) {
  const normalized = {
    name: value.name,
    fullName: value.full_name,
    owner: value.owner?.login,
    htmlUrl: value.html_url,
    description: value.description,
    language: value.language,
    topics: Array.isArray(value.topics) ? value.topics : [],
    archived: value.archived,
    disabled: value.disabled,
    visibility: value.visibility,
    fork: value.fork,
    defaultBranch: value.default_branch,
    updatedAt: value.updated_at,
    pushedAt: value.pushed_at,
  };
  return { ...normalized, status: repositoryStatus(normalized) };
}

export async function fetchGitHubSnapshot(manifest, { fetchImpl = fetch, retrievedAt = new Date().toISOString() } = {}) {
  const repositories = await Promise.all(manifest.projects.map(async ({ repository }) => {
    const endpoint = `${manifest.source.apiBaseUrl}/repos/${repository}`;
    let response;
    try {
      response = await fetchImpl(endpoint, {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'QuBenhao-profile-index',
          'X-GitHub-Api-Version': githubApiVersion,
        },
        signal: AbortSignal.timeout(20_000),
      });
    } catch (error) {
      throw new Error(`GitHub metadata request failed for ${repository}: ${error.message}`);
    }
    if (!response.ok) {
      throw new Error(`GitHub metadata request failed for ${repository}: HTTP ${response.status}`);
    }
    return normalizeApiRepository(await response.json());
  }));

  return {
    schemaVersion: 1,
    source: {
      provider: 'github-rest',
      apiVersion: githubApiVersion,
      retrievedAt,
    },
    repositories,
  };
}

export function diffRepositorySnapshots(expected, actual) {
  const issues = [];
  const actualByName = repositoryMap(actual);
  for (const repository of expected.repositories) {
    const current = actualByName.get(repository.fullName);
    if (!current) {
      issues.push(`${repository.fullName} is missing from the live source`);
      continue;
    }
    for (const key of snapshotRepositoryKeys) {
      if (JSON.stringify(repository[key]) !== JSON.stringify(current[key])) {
        issues.push(`${repository.fullName}.${key} differs from the live source`);
      }
    }
  }
  for (const repository of actual.repositories) {
    if (!expected.repositories.some((candidate) => candidate.fullName === repository.fullName)) {
      issues.push(`${repository.fullName} is unexpected in the live source`);
    }
  }
  return issues;
}
