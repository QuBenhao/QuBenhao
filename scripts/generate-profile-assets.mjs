#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const checkOnly = process.argv.includes('--check');

const colors = {
  background: '#05090e',
  panel: '#07151d',
  border: '#1b5364',
  cyan: '#57dfff',
  green: '#6cf2a8',
  text: '#edfaff',
  body: '#b9d6de',
  muted: '#7796a3',
};

const font = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const sections = [
  ['assets/section-github-signal.svg', 'PUBLIC ACTIVITY', 'GitHub signal', 'RANK · OUTPUT · LANGUAGES'],
  ['assets/section-selected-work.svg', 'SELECTED WORK', 'Systems built for hard problems', '06 PROJECTS'],
  ['assets/section-capability-map.svg', 'CAPABILITY MAP', 'Engineering systems, end to end', '04 DOMAINS'],
];

const projects = [
  {
    file: 'assets/projects/leetcode.svg',
    title: 'LeetCode',
    lines: ['Local problem-solving system with a custom runner,', 'solution templates, and progress tracking.'],
    tags: 'PYTHON · AUTOMATION · CLI',
  },
  {
    file: 'assets/projects/distributed-system.svg',
    title: 'distributed-system',
    lines: ['Raft consensus, fault-tolerant key-value services,', 'and sharded storage.'],
    tags: 'GO · RAFT · DISTRIBUTED SYSTEMS',
  },
  {
    file: 'assets/projects/xv6-lab.svg',
    title: 'xv6-lab',
    lines: ['Kernel labs covering syscalls, virtual memory,', 'storage, and scheduling.'],
    tags: 'C · KERNEL · OPERATING SYSTEMS',
  },
  {
    file: 'assets/projects/leetcode-mcp.svg',
    title: 'LeetCodeMCP',
    lines: ['Problem-solving workflows exposed as tools', 'for AI coding assistants.'],
    tags: 'PYTHON · MCP · AI TOOLING',
  },
  {
    file: 'assets/projects/gopushdeer.svg',
    title: 'gopushdeer',
    lines: ['Lightweight PushDeer SDK for cross-platform', 'push notifications from Go.'],
    tags: 'GO · SDK · NOTIFICATIONS',
  },
  {
    file: 'assets/projects/triage.svg',
    title: 'triage',
    lines: ['Privacy-first LLM gateway for routing, redaction,', 'and spend control across local and remote models.'],
    tags: 'GO · LLM GATEWAY · PRIVACY',
  },
];

const capabilities = [
  {
    file: 'assets/capabilities/backend-runtime.svg',
    title: 'Backend runtime',
    lines: ['Kitex · gRPC · Nginx · Linux · JVM · Coroutines'],
  },
  {
    file: 'assets/capabilities/data-messaging.svg',
    title: 'Data & messaging',
    lines: ['Redis · MySQL · PostgreSQL · MongoDB · Kafka'],
  },
  {
    file: 'assets/capabilities/infrastructure.svg',
    title: 'Infrastructure',
    lines: ['Kubernetes · Docker · Docker Compose', 'Cloudflare · WireGuard'],
  },
  {
    file: 'assets/capabilities/ai-tooling.svg',
    title: 'AI tooling',
    lines: ['LLM Integration · MCP · Ollama · MLX', 'OpenClaw · Claude Code'],
  },
];

const escapeXml = (value) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;');

function svgFrame({ width, height, title, description, body, radius = 14 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
  <title id="title">${escapeXml(title)}</title>
  <desc id="desc">${escapeXml(description)}</desc>
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.background}"/>
      <stop offset="1" stop-color="${colors.panel}"/>
    </linearGradient>
    <radialGradient id="glow" cx="92%" cy="4%" r="75%">
      <stop offset="0" stop-color="${colors.cyan}" stop-opacity="0.14"/>
      <stop offset="1" stop-color="${colors.cyan}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="${colors.cyan}" stroke-opacity="0.07"/>
    </pattern>
  </defs>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#background)"/>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#glow)"/>
  <rect width="${width}" height="${height}" rx="${radius}" fill="url(#grid)"/>
  <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${radius - 1}" fill="none" stroke="${colors.border}" stroke-width="2"/>
  <g font-family="${font}">
${body}
  </g>
</svg>`;
}

function identitySvg() {
  const cells = [
    ['STATUS', '● ACTIVE', colors.green],
    ['BASE', 'GUANGZHOU, CN', colors.text],
    ['EXPERIENCE', '2014 — PRESENT', colors.text],
    ['LOCAL TIME', 'UTC+08:00', colors.text],
  ];
  const body = cells.map(([label, value, color], index) => {
    const x = index * 300;
    const divider = index === 0 ? '' : `    <path d="M${x} 18V87" stroke="${colors.border}"/>\n`;
    return `${divider}    <text x="${x + 28}" y="37" fill="${colors.muted}" font-size="11" font-weight="700" letter-spacing="2">${label}</text>
    <text x="${x + 28}" y="70" fill="${color}" font-size="17" font-weight="700">${value}</text>`;
  }).join('\n');
  return svgFrame({
    width: 1200,
    height: 105,
    title: 'Profile identity signal',
    description: 'Active status, Guangzhou location, experience since 2014, and UTC plus eight local time.',
    body,
    radius: 12,
  });
}

function sectionSvg(kicker, title, meta) {
  return svgFrame({
    width: 1200,
    height: 120,
    title,
    description: `${kicker}: ${title}. ${meta}.`,
    body: `    <text x="42" y="40" fill="${colors.cyan}" font-size="12" font-weight="700" letter-spacing="3">${kicker}</text>
    <text x="42" y="82" fill="${colors.text}" font-size="28" font-weight="800">${escapeXml(title)}</text>
    <text x="1158" y="75" fill="${colors.muted}" font-size="12" text-anchor="end" letter-spacing="2">${meta}</text>
    <path d="M42 98H1158" stroke="${colors.cyan}" stroke-opacity="0.3"/>`,
    radius: 12,
  });
}

function cardSvg(item, index, kind) {
  const coordinate = kind === 'project' ? `PROJECT · ${String(index + 1).padStart(2, '0')}` : `DOMAIN · ${String(index + 1).padStart(2, '0')}`;
  const description = kind === 'project' ? item.lines.join(' ') : `${item.title}: ${item.lines.join(' ')}`;
  const lineMarkup = item.lines.map((line, lineIndex) => (
    `    <text x="28" y="${112 + lineIndex * 23}" fill="${colors.body}" font-size="14">${escapeXml(line)}</text>`
  )).join('\n');
  const tags = kind === 'project'
    ? `\n    <text x="28" y="166" fill="${colors.muted}" font-size="11" font-weight="700" letter-spacing="1.2">${item.tags}</text>`
    : '';
  return svgFrame({
    width: 520,
    height: 190,
    title: item.title,
    description,
    body: `    <text x="28" y="32" fill="${colors.muted}" font-size="10" font-weight="700" letter-spacing="2">${coordinate}</text>
    <text x="28" y="76" fill="${colors.cyan}" font-size="22" font-weight="800">${escapeXml(item.title)}${kind === 'project' ? ' ↗' : ''}</text>
${lineMarkup}${tags}`,
    radius: 12,
  });
}

function footerSvg() {
  return svgFrame({
    width: 1200,
    height: 104,
    title: 'Profile footer',
    description: 'The best code solves the problem elegantly. Guangzhou, China, UTC plus eight, open to interesting collaborations.',
    body: `    <text x="600" y="43" fill="${colors.body}" font-size="17" text-anchor="middle">“The best code solves the problem elegantly.”</text>
    <text x="600" y="76" fill="${colors.muted}" font-size="11" text-anchor="middle" letter-spacing="2">GUANGZHOU, CN · UTC+08:00 · OPEN TO INTERESTING COLLABORATIONS</text>`,
    radius: 12,
  });
}

const outputs = new Map([
  ['assets/identity-signal.svg', identitySvg()],
  ...sections.map(([file, kicker, title, meta]) => [file, sectionSvg(kicker, title, meta)]),
  ...projects.map((project, index) => [project.file, cardSvg(project, index, 'project')]),
  ...capabilities.map((capability, index) => [capability.file, cardSvg(capability, index, 'capability')]),
  ['assets/profile-footer.svg', footerSvg()],
]);

async function main() {
  let failed = false;
  for (const [relativePath, expected] of outputs) {
    const absolutePath = resolve(repoRoot, relativePath);
    if (checkOnly) {
      try {
        const actual = await readFile(absolutePath, 'utf8');
        if (actual !== `${expected}\n`) {
          console.error(`generated asset is stale: ${relativePath}`);
          failed = true;
        }
      } catch {
        console.error(`generated asset is missing: ${relativePath}`);
        failed = true;
      }
      continue;
    }

    await mkdir(dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, `${expected}\n`, 'utf8');
  }

  if (failed) process.exitCode = 1;
}

await main();
