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
    file: 'assets/projects/profile-command-deck.svg',
    title: 'profile-command-deck',
    lines: ['Generated SVG command deck with deterministic checks', 'and responsive GitHub profile previews.'],
    tags: 'NODE.JS · SVG · GITHUB PROFILE',
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

function profileOverviewSvg() {
  const cells = [
    ['STATUS', '● ACTIVE', colors.green],
    ['BASE', 'GUANGZHOU, CN', colors.text],
    ['EXPERIENCE', '2014 — PRESENT', colors.text],
    ['LOCAL TIME', 'UTC+08:00', colors.text],
  ];
  const identity = cells.map(([label, value, color], index) => {
    const x = index * 300;
    const divider = index === 0 ? '' : `    <path d="M${x} 358V426" stroke="${colors.border}"/>\n`;
    return `${divider}    <text x="${x + 32}" y="379" fill="${colors.muted}" font-size="10" font-weight="700" letter-spacing="2">${label}</text>
    <text x="${x + 32}" y="414" fill="${color}" font-size="17" font-weight="700">${value}</text>`;
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="440" viewBox="0 0 1200 440" role="img" aria-labelledby="title desc">
  <title id="title">Benhao Qu — systems engineer building intelligent systems</title>
  <desc id="desc">Systems engineer in Guangzhou focused on backend runtime, distributed systems, AI tooling, and developer productivity. Active since 2014 in UTC plus eight.</desc>
  <defs>
    <linearGradient id="overview-background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${colors.background}"/>
      <stop offset="1" stop-color="${colors.panel}"/>
    </linearGradient>
    <radialGradient id="overview-glow" cx="90%" cy="12%" r="54%">
      <stop offset="0" stop-color="${colors.cyan}" stop-opacity="0.22"/>
      <stop offset="1" stop-color="${colors.cyan}" stop-opacity="0"/>
    </radialGradient>
    <pattern id="overview-grid" width="32" height="32" patternUnits="userSpaceOnUse">
      <path d="M32 0H0V32" fill="none" stroke="${colors.cyan}" stroke-opacity="0.07"/>
    </pattern>
    <filter id="overview-cyan-glow" x="-30%" y="-60%" width="160%" height="220%">
      <feGaussianBlur stdDeviation="5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      .focus-1 { animation: focus-one 12s infinite; }
      .focus-2 { opacity: 0; animation: focus-two 12s infinite; }
      .focus-3 { opacity: 0; animation: focus-three 12s infinite; }
      .cursor { animation: cursor-blink 1s steps(2, end) infinite; }
      @keyframes focus-one { 0%, 28%, 100% { opacity: 1; } 33%, 94% { opacity: 0; } }
      @keyframes focus-two { 0%, 28%, 66%, 100% { opacity: 0; } 33%, 61% { opacity: 1; } }
      @keyframes focus-three { 0%, 61%, 100% { opacity: 0; } 66%, 94% { opacity: 1; } }
      @keyframes cursor-blink { 50% { opacity: 0; } }
      @media (prefers-reduced-motion: reduce) {
        .focus-1 { animation: none; opacity: 1; }
        .focus-2, .focus-3, .cursor { animation: none; opacity: 0; }
      }
    </style>
  </defs>
  <rect width="1200" height="440" rx="14" fill="url(#overview-background)"/>
  <rect width="1200" height="440" rx="14" fill="url(#overview-glow)"/>
  <rect width="1200" height="440" rx="14" fill="url(#overview-grid)"/>
  <rect x="1" y="1" width="1198" height="438" rx="13" fill="none" stroke="${colors.border}" stroke-width="2"/>
  <path d="M1 276H1199M1 342H1199" stroke="${colors.border}"/>
  <g font-family="${font}">
    <text x="52" y="55" fill="${colors.cyan}" font-size="14" font-weight="700" letter-spacing="4">BENHAO · SYSTEMS ENGINEER</text>
    <circle cx="930" cy="50" r="4" fill="${colors.green}"/>
    <text x="943" y="55" fill="${colors.green}" font-size="10" letter-spacing="1">OPEN TO COLLABORATE</text>
    <text x="52" y="145" fill="${colors.text}" font-size="36" font-weight="800" letter-spacing="-1.5">
      <tspan>BUILDING </tspan><tspan fill="${colors.cyan}" filter="url(#overview-cyan-glow)">INTELLIGENT</tspan><tspan> SYSTEMS.</tspan>
    </text>
    <text x="52" y="199" fill="${colors.body}" font-size="11" letter-spacing="0.6">BACKEND · DISTRIBUTED SYSTEMS · AI TOOLING · DEVELOPER PRODUCTIVITY</text>
    <text x="52" y="244" fill="${colors.muted}" font-size="12" letter-spacing="2">GUANGZHOU, CN · UTC+08:00</text>
    <g fill="none" stroke="${colors.cyan}" stroke-opacity="0.34">
      <path d="M920 92H1030L1060 122H1140"/><path d="M965 160H1080L1110 132H1150"/><path d="M995 224H1085L1118 196H1150"/>
    </g>
    <g fill="${colors.cyan}"><circle cx="920" cy="92" r="4"/><circle cx="1140" cy="122" r="4"/><circle cx="965" cy="160" r="4"/><circle cx="1150" cy="132" r="4"/><circle cx="995" cy="224" r="4"/><circle cx="1150" cy="196" r="4"/></g>
    <text x="52" y="318" fill="${colors.green}" font-size="18" font-weight="700">&gt;</text>
    <text class="focus-1" x="78" y="318" fill="${colors.body}" font-size="16">designing distributed systems that stay understandable<tspan class="cursor" fill="${colors.green}">_</tspan></text>
    <text class="focus-2" x="78" y="318" fill="${colors.body}" font-size="16">building AI tools for real developer workflows<tspan class="cursor" fill="${colors.green}">_</tspan></text>
    <text class="focus-3" x="78" y="318" fill="${colors.body}" font-size="16">turning difficult problems into reliable systems<tspan class="cursor" fill="${colors.green}">_</tspan></text>
    <text x="1148" y="318" fill="${colors.muted}" font-size="11" text-anchor="end" letter-spacing="2">FOCUS · LIVE</text>
${identity}
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
    height: 84,
    title,
    description: `${kicker}: ${title}. ${meta}.`,
    body: `    <text x="32" y="27" fill="${colors.cyan}" font-size="10" font-weight="700" letter-spacing="3">${kicker}</text>
    <text x="32" y="60" fill="${colors.text}" font-size="24" font-weight="800">${escapeXml(title)}</text>
    <text x="1168" y="57" fill="${colors.muted}" font-size="10" text-anchor="end" letter-spacing="2">${meta}</text>
    <path d="M32 72H1168" stroke="${colors.cyan}" stroke-opacity="0.3"/>`,
    radius: 10,
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
  ['assets/profile-overview.svg', profileOverviewSvg()],
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
