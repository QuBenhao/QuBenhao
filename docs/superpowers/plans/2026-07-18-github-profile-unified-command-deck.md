# GitHub Profile Unified Command Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the visually disconnected native README sections with one GitHub-compatible dark command deck, including linked project cards, capability cards, a compact identity rail, and working live Rank and language metrics.

**Architecture:** Keep the animated hero and focus signal as repository-owned SVGs. Generate the repeated static SVG panels from one dependency-free Node script so every card shares the same geometry and visual tokens; compose them in `README.md` as ordinary images and linked images. Use the maintained public GitHub Stats Extended endpoints only for optional live metrics.

**Tech Stack:** GitHub Flavored Markdown, GitHub-supported HTML, SVG 1.1, Node.js 18+ standard library, Bash, `xmllint`, `curl`, macOS Quick Look.

## Global Constraints

- No native headings such as `01 / SYSTEM ID`, `02 / SELECTED SYSTEMS`, or `03 / SYSTEM MATRIX`.
- No display headings such as `CORE // BACKEND RUNTIME`.
- No standalone `Operator profile` section or terminal identity block.
- Identity rail values are exactly `ACTIVE`, `GUANGZHOU, CN`, `2014 — PRESENT`, and `UTC+08:00`.
- Hero domain line is exactly `BACKEND · DISTRIBUTED SYSTEMS · AI TOOLING · DEVELOPER PRODUCTIVITY`.
- The hero contains no manually maintained programming-language list.
- Project cards retain project-specific primary-language tags.
- Live cards use `github-stats-extended.vercel.app`, not the paused `github-readme-stats.vercel.app` deployment.
- Essential identity, project, and capability content remains repository-owned.
- No JavaScript in embedded SVGs, external fonts, remote SVG dependencies, scheduled workflows, self-hosting, or new production dependencies.
- Every animation has a readable static state and reduced-motion fallback.
- All shell commands are run through `rtk`.

## File Map

- Modify `assets/neural-command-deck.svg`: remove the global language list and slash-delimited visible labels.
- Modify `assets/focus-signal.svg`: adopt middle-dot telemetry punctuation.
- Create `scripts/generate-profile-assets.mjs`: deterministic generator for identity, section, footer, project, and capability SVGs.
- Create `scripts/verify-profile.sh`: repository-owned contract verifier for generated SVGs and `README.md`.
- Create `scripts/render-profile-preview.mjs`: dependency-free local HTML wrapper for responsive README inspection.
- Create `assets/identity-signal.svg`: four-cell identity rail.
- Create `assets/section-github-signal.svg`: live-metrics section header.
- Create `assets/section-selected-work.svg`: project section header.
- Create `assets/section-capability-map.svg`: capability section header.
- Create `assets/profile-footer.svg`: quote and location footer.
- Create six SVGs under `assets/projects/`: individually linked project cards.
- Create four SVGs under `assets/capabilities/`: responsive capability cards.
- Modify `README.md`: compose repository-owned and remote cards without native tables or headings.

---

### Task 1: Refine Existing Animated Assets

**Files:**
- Modify: `assets/neural-command-deck.svg`
- Modify: `assets/focus-signal.svg`

**Interfaces:**
- Consumes: existing animated hero and focus SVG structure.
- Produces: unchanged paths `./assets/neural-command-deck.svg` and `./assets/focus-signal.svg` with the approved visible copy.

- [ ] **Step 1: Run the new-copy contract and verify it fails**

Run:

```bash
rtk rg -q '>BENHAO · SYSTEMS ENGINEER<' assets/neural-command-deck.svg &&
rtk rg -q '>BACKEND · DISTRIBUTED SYSTEMS · AI TOOLING · DEVELOPER PRODUCTIVITY<' assets/neural-command-deck.svg &&
rtk rg -q '>FOCUS · LIVE<' assets/focus-signal.svg &&
rtk rg -q '>GUANGZHOU, CN · UTC\+08:00<' assets/neural-command-deck.svg
```

Expected: non-zero exit on the first assertion because `BENHAO · SYSTEMS ENGINEER` is not present yet.

- [ ] **Step 2: Apply the exact hero copy patch**

Use `apply_patch`:

```diff
*** Begin Patch
*** Update File: assets/neural-command-deck.svg
@@
-  <desc id="desc">Backend engineer working with Go, C++, Python, Java, Kotlin, and TypeScript on distributed systems and AI tooling.</desc>
+  <desc id="desc">Backend engineer building distributed systems, AI tooling, and developer productivity tools.</desc>
@@
-    <text x="66" y="70" fill="#68e8ff" font-size="16" font-weight="700" letter-spacing="4">BENHAO // SYSTEMS ENGINEER</text>
+    <text x="66" y="70" fill="#68e8ff" font-size="16" font-weight="700" letter-spacing="4">BENHAO · SYSTEMS ENGINEER</text>
@@
-    <text x="66" y="218" fill="#9bb1bb" font-size="10.5" letter-spacing="0.5">GO · C++ · PYTHON · JAVA · KOTLIN · TYPESCRIPT // BACKEND · DISTRIBUTED SYSTEMS · AI TOOLING</text>
-    <text x="66" y="260" fill="#7796a3" font-size="12" letter-spacing="2">GUANGZHOU, CN // UTC+08:00</text>
+    <text x="66" y="218" fill="#9bb1bb" font-size="11.5" letter-spacing="0.7">BACKEND · DISTRIBUTED SYSTEMS · AI TOOLING · DEVELOPER PRODUCTIVITY</text>
+    <text x="66" y="260" fill="#7796a3" font-size="12" letter-spacing="2">GUANGZHOU, CN · UTC+08:00</text>
*** End Patch
```

- [ ] **Step 3: Apply the exact focus-label patch**

Use `apply_patch`:

```diff
*** Begin Patch
*** Update File: assets/focus-signal.svg
@@
-    <text x="1168" y="49" fill="#7796a3" font-size="12" text-anchor="end" letter-spacing="2">FOCUS // LIVE</text>
+    <text x="1168" y="49" fill="#7796a3" font-size="12" text-anchor="end" letter-spacing="2">FOCUS · LIVE</text>
*** End Patch
```

- [ ] **Step 4: Validate the edited assets**

Run:

```bash
rtk xmllint --noout assets/neural-command-deck.svg assets/focus-signal.svg
rtk rg -q '>BENHAO · SYSTEMS ENGINEER<' assets/neural-command-deck.svg
rtk rg -q '>BACKEND · DISTRIBUTED SYSTEMS · AI TOOLING · DEVELOPER PRODUCTIVITY<' assets/neural-command-deck.svg
rtk rg -q '>FOCUS · LIVE<' assets/focus-signal.svg
rtk rg -q '>GUANGZHOU, CN · UTC\+08:00<' assets/neural-command-deck.svg
if rtk rg -n 'BENHAO //|GO · C\+\+|FOCUS //|GUANGZHOU, CN //' assets/neural-command-deck.svg assets/focus-signal.svg; then exit 1; fi
```

Expected: XML validation and all four approved-copy assertions succeed; the banned-copy guard returns no matches.

- [ ] **Step 5: Commit the animated-asset slice**

```bash
rtk git add assets/neural-command-deck.svg assets/focus-signal.svg
rtk git commit -m "Refine profile signal copy"
```

---

### Task 2: Generate the Unified Static Card System

**Files:**
- Create: `scripts/generate-profile-assets.mjs`
- Create: `scripts/verify-profile.sh`
- Create: `assets/identity-signal.svg`
- Create: `assets/section-github-signal.svg`
- Create: `assets/section-selected-work.svg`
- Create: `assets/section-capability-map.svg`
- Create: `assets/profile-footer.svg`
- Create: `assets/projects/leetcode.svg`
- Create: `assets/projects/distributed-system.svg`
- Create: `assets/projects/xv6-lab.svg`
- Create: `assets/projects/leetcode-mcp.svg`
- Create: `assets/projects/gopushdeer.svg`
- Create: `assets/projects/triage.svg`
- Create: `assets/capabilities/backend-runtime.svg`
- Create: `assets/capabilities/data-messaging.svg`
- Create: `assets/capabilities/infrastructure.svg`
- Create: `assets/capabilities/ai-tooling.svg`

**Interfaces:**
- Consumes: no dependencies beyond Node.js standard library.
- Produces: `node scripts/generate-profile-assets.mjs` to write all static cards; `node scripts/generate-profile-assets.mjs --check` to detect drift; `bash scripts/verify-profile.sh assets` to validate the asset contract.

- [ ] **Step 1: Create the failing asset verifier**

Create `scripts/verify-profile.sh` with `apply_patch`:

```bash
#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

assets=(
  assets/neural-command-deck.svg
  assets/focus-signal.svg
  assets/identity-signal.svg
  assets/section-github-signal.svg
  assets/section-selected-work.svg
  assets/section-capability-map.svg
  assets/profile-footer.svg
  assets/projects/leetcode.svg
  assets/projects/distributed-system.svg
  assets/projects/xv6-lab.svg
  assets/projects/leetcode-mcp.svg
  assets/projects/gopushdeer.svg
  assets/projects/triage.svg
  assets/capabilities/backend-runtime.svg
  assets/capabilities/data-messaging.svg
  assets/capabilities/infrastructure.svg
  assets/capabilities/ai-tooling.svg
)

verify_assets() {
  for asset in "${assets[@]}"; do
    test -f "$asset"
    xmllint --noout "$asset"
  done

  node scripts/generate-profile-assets.mjs --check

  if rg -n '<script|@import|@font-face|<image[^>]+href="https?://|url\(https?://' "${assets[@]}"; then
    echo "SVG assets contain a forbidden external or executable dependency" >&2
    exit 1
  fi

  rg -q '2014 — PRESENT' assets/identity-signal.svg
  rg -q 'Systems built for hard problems' assets/section-selected-work.svg
  rg -q 'Backend runtime' assets/capabilities/backend-runtime.svg

  if rg -n 'SYSTEM ID|SELECTED SYSTEMS|SYSTEM MATRIX|CORE //|STATE //|EDGE //|INTEL //' "${assets[@]}"; then
    echo "SVG assets contain a retired heading" >&2
    exit 1
  fi
}

case "${1:-assets}" in
  assets) verify_assets ;;
  *) echo "usage: $0 assets" >&2; exit 2 ;;
esac
```

- [ ] **Step 2: Run the verifier and confirm the expected failure**

Run:

```bash
rtk bash scripts/verify-profile.sh assets
```

Expected: FAIL at the first missing new asset, `assets/identity-signal.svg`.

- [ ] **Step 3: Create the deterministic SVG generator**

Create `scripts/generate-profile-assets.mjs` with `apply_patch`:

```javascript
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
```

- [ ] **Step 4: Generate all repository-owned static cards**

Run:

```bash
rtk node scripts/generate-profile-assets.mjs
```

Expected: exit 0; the identity, three section headers, footer, six project cards, and four capability cards are created.

- [ ] **Step 5: Run the complete asset verifier**

Run:

```bash
rtk bash scripts/verify-profile.sh assets
```

Expected: exit 0 with no XML, drift, dependency, copy, or retired-heading errors.

- [ ] **Step 6: Commit the generated-card slice**

```bash
rtk git add scripts/generate-profile-assets.mjs scripts/verify-profile.sh assets/identity-signal.svg assets/section-github-signal.svg assets/section-selected-work.svg assets/section-capability-map.svg assets/profile-footer.svg assets/projects assets/capabilities
rtk git commit -m "Add unified profile card system"
```

---

### Task 3: Compose the GitHub-Native README

**Files:**
- Modify: `README.md`
- Modify: `scripts/verify-profile.sh`
- Create: `scripts/render-profile-preview.mjs`

**Interfaces:**
- Consumes: all repository-owned SVG paths from Task 2 and the two GitHub Stats Extended endpoints.
- Produces: a README with no native section tables/headings and `bash scripts/verify-profile.sh all` as the complete local contract command.

- [ ] **Step 1: Extend the verifier with the README contract**

Insert this function before the `case` statement in `scripts/verify-profile.sh`:

```bash
verify_readme() {
  local asset_refs=(
    assets/neural-command-deck.svg
    assets/focus-signal.svg
    assets/identity-signal.svg
    assets/section-github-signal.svg
    assets/section-selected-work.svg
    assets/section-capability-map.svg
    assets/profile-footer.svg
    assets/projects/leetcode.svg
    assets/projects/distributed-system.svg
    assets/projects/xv6-lab.svg
    assets/projects/leetcode-mcp.svg
    assets/projects/gopushdeer.svg
    assets/projects/triage.svg
    assets/capabilities/backend-runtime.svg
    assets/capabilities/data-messaging.svg
    assets/capabilities/infrastructure.svg
    assets/capabilities/ai-tooling.svg
  )
  local project_links=(
    https://github.com/QuBenhao/LeetCode
    https://github.com/QuBenhao/distributed-system
    https://github.com/QuBenhao/xv6-lab
    https://github.com/QuBenhao/LeetCodeMCP
    https://github.com/QuBenhao/gopushdeer
    https://github.com/QuBenhao/triage
  )

  for asset in "${asset_refs[@]}"; do
    rg -q "$asset" README.md
  done
  for link in "${project_links[@]}"; do
    rg -q "$link" README.md
  done

  local metric_count
  metric_count="$(rg -o 'github-stats-extended\.vercel\.app' README.md | wc -l | tr -d ' ')"
  test "$metric_count" -eq 2
  rg -q 'include_all_commits=true' README.md
  rg -q 'layout=compact' README.md

  if rg -n 'github-readme-stats\.vercel\.app|01 / SYSTEM ID|02 / SELECTED SYSTEMS|03 / SYSTEM MATRIX|CORE //|STATE //|EDGE //|INTEL //|GO · C\+\+ · PYTHON' README.md; then
    echo "README contains a retired service, heading, or global language list" >&2
    exit 1
  fi
}
```

Replace the existing `case` statement with:

```bash
case "${1:-all}" in
  assets) verify_assets ;;
  readme) verify_readme ;;
  all) verify_assets; verify_readme ;;
  *) echo "usage: $0 [assets|readme|all]" >&2; exit 2 ;;
esac
```

- [ ] **Step 2: Run the README contract and verify it fails**

Run:

```bash
rtk bash scripts/verify-profile.sh readme
```

Expected: FAIL because the current README does not reference `assets/identity-signal.svg` and still contains retired native headings.

- [ ] **Step 3: Replace `README.md` with the exact approved composition**

Use `apply_patch` to replace the file with:

```html
<div align="center">
  <img src="./assets/neural-command-deck.svg" alt="Benhao Qu — systems engineer building intelligent backend, distributed, and AI tooling systems" width="100%" />
</div>

<div align="center">
  <img src="./assets/focus-signal.svg" alt="Current focus: distributed systems, practical AI tooling, and reliable engineering" width="100%" />
</div>

<div align="center">
  <img src="./assets/identity-signal.svg" alt="Active in Guangzhou, China; building software since 2014; local time UTC plus eight" width="100%" />
</div>

<br>

<div align="center">
  <img src="./assets/section-github-signal.svg" alt="GitHub signal: rank, output, and languages" width="100%" />
</div>

<p align="center">
  <a href="https://github.com/QuBenhao"><img src="https://github-stats-extended.vercel.app/api?username=QuBenhao&amp;show_icons=true&amp;include_all_commits=true&amp;bg_color=07151d&amp;title_color=57dfff&amp;text_color=b9d6de&amp;icon_color=6cf2a8&amp;ring_color=57dfff&amp;border_color=1b5364&amp;border_radius=10&amp;custom_title=Activity%20Summary" alt="GitHub activity summary with rank, stars, commits, pull requests, issues, and contributions" height="185" /></a>
  <a href="https://github.com/QuBenhao?tab=repositories"><img src="https://github-stats-extended.vercel.app/api/top-langs/?username=QuBenhao&amp;layout=compact&amp;langs_count=8&amp;size_weight=0.5&amp;count_weight=0.5&amp;card_width=430&amp;bg_color=07151d&amp;title_color=57dfff&amp;text_color=b9d6de&amp;border_color=1b5364&amp;border_radius=10&amp;custom_title=Language%20Distribution" alt="Language distribution across public repositories" height="185" /></a>
</p>

<br>

<div align="center">
  <img src="./assets/section-selected-work.svg" alt="Selected work: systems built for hard problems" width="100%" />
</div>

<p align="center">
  <a href="https://github.com/QuBenhao/LeetCode"><img src="./assets/projects/leetcode.svg" alt="LeetCode — Python automation and CLI problem-solving system" height="154" /></a>
  <a href="https://github.com/QuBenhao/distributed-system"><img src="./assets/projects/distributed-system.svg" alt="distributed-system — Go, Raft, and distributed systems labs" height="154" /></a>
  <br>
  <a href="https://github.com/QuBenhao/xv6-lab"><img src="./assets/projects/xv6-lab.svg" alt="xv6-lab — C kernel and operating systems labs" height="154" /></a>
  <a href="https://github.com/QuBenhao/LeetCodeMCP"><img src="./assets/projects/leetcode-mcp.svg" alt="LeetCodeMCP — Python MCP tools for coding assistants" height="154" /></a>
  <br>
  <a href="https://github.com/QuBenhao/gopushdeer"><img src="./assets/projects/gopushdeer.svg" alt="gopushdeer — Go SDK for push notifications" height="154" /></a>
  <a href="https://github.com/QuBenhao/triage"><img src="./assets/projects/triage.svg" alt="triage — Go privacy-first LLM gateway" height="154" /></a>
</p>

<br>

<div align="center">
  <img src="./assets/section-capability-map.svg" alt="Capability map: engineering systems end to end" width="100%" />
</div>

<p align="center">
  <img src="./assets/capabilities/backend-runtime.svg" alt="Backend runtime: Kitex, gRPC, Nginx, Linux, JVM, and Coroutines" height="154" />
  <img src="./assets/capabilities/data-messaging.svg" alt="Data and messaging: Redis, MySQL, PostgreSQL, MongoDB, and Kafka" height="154" />
  <br>
  <img src="./assets/capabilities/infrastructure.svg" alt="Infrastructure: Kubernetes, Docker, Docker Compose, Cloudflare, and WireGuard" height="154" />
  <img src="./assets/capabilities/ai-tooling.svg" alt="AI tooling: LLM Integration, MCP, Ollama, MLX, OpenClaw, and Claude Code" height="154" />
</p>

<br>

<div align="center">
  <img src="./assets/profile-footer.svg" alt="The best code solves the problem elegantly. Guangzhou, China, UTC plus eight; open to interesting collaborations." width="100%" />
</div>
```

- [ ] **Step 4: Create the deterministic local preview wrapper**

Create `scripts/render-profile-preview.mjs` with `apply_patch`:

```javascript
#!/usr/bin/env node

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const readme = await readFile(resolve(repoRoot, 'README.md'), 'utf8');
const outputDirectory = resolve(repoRoot, '.superpowers');
const outputPath = resolve(outputDirectory, 'profile-preview.html');
const document = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>QuBenhao GitHub Profile Preview</title>
  <style>
    :root { color-scheme: light dark; }
    body { margin: 0; background: Canvas; color: CanvasText; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .markdown-body { box-sizing: border-box; width: min(896px, 100%); margin: 0 auto; padding: 24px 16px; }
    img { max-width: 100%; box-sizing: content-box; }
    p { margin: 0 0 16px; }
  </style>
</head>
<body>
  <article class="markdown-body">
${readme}
  </article>
</body>
</html>
`;

await mkdir(outputDirectory, { recursive: true });
await writeFile(outputPath, document, 'utf8');
console.log(outputPath);
```

- [ ] **Step 5: Run the README, preview, and full contracts**

Run:

```bash
rtk bash scripts/verify-profile.sh readme
rtk node scripts/render-profile-preview.mjs
rtk bash scripts/verify-profile.sh all
```

Expected: both verification commands exit 0; the preview command prints the absolute path ending in `.superpowers/profile-preview.html`.

- [ ] **Step 6: Check whitespace and the exact changed-file set**

Run:

```bash
rtk git diff --check
rtk git status --short
```

Expected: no whitespace errors; only `README.md`, `scripts/verify-profile.sh`, and `scripts/render-profile-preview.mjs` are modified in this task. `.superpowers/profile-preview.html` remains ignored.

- [ ] **Step 7: Commit the README composition**

```bash
rtk git add README.md scripts/verify-profile.sh scripts/render-profile-preview.mjs
rtk git commit -m "Unify GitHub profile command deck"
```

---

### Task 4: Render and Verify the Complete Profile

**Files:**
- Verify: `README.md`
- Verify: `scripts/generate-profile-assets.mjs`
- Verify: `scripts/verify-profile.sh`
- Verify: all SVGs under `assets/`

**Interfaces:**
- Consumes: committed Tasks 1–3.
- Produces: fresh evidence that local assets, remote metrics, responsive geometry, and repository state satisfy the approved design.

- [ ] **Step 1: Run deterministic and structural verification**

Run:

```bash
rtk node scripts/generate-profile-assets.mjs --check
rtk bash scripts/verify-profile.sh all
rtk git diff --check HEAD~3..HEAD
```

Expected: all commands exit 0 with no output.

- [ ] **Step 2: Fetch and validate both live metric cards**

Run:

```bash
rtk mkdir -p /tmp/qubenhao-profile-verification
rtk curl -fsS -o /tmp/qubenhao-profile-verification/stats.svg 'https://github-stats-extended.vercel.app/api?username=QuBenhao&show_icons=true&include_all_commits=true&bg_color=07151d&title_color=57dfff&text_color=b9d6de&icon_color=6cf2a8&ring_color=57dfff&border_color=1b5364&border_radius=10&custom_title=Activity%20Summary'
rtk curl -fsS -o /tmp/qubenhao-profile-verification/languages.svg 'https://github-stats-extended.vercel.app/api/top-langs/?username=QuBenhao&layout=compact&langs_count=8&size_weight=0.5&count_weight=0.5&card_width=430&bg_color=07151d&title_color=57dfff&text_color=b9d6de&border_color=1b5364&border_radius=10&custom_title=Language%20Distribution'
rtk xmllint --noout /tmp/qubenhao-profile-verification/stats.svg /tmp/qubenhao-profile-verification/languages.svg
rtk rg -n 'rank-circle|rank-text|Total Stars|Activity Summary' /tmp/qubenhao-profile-verification/stats.svg
rtk rg -n 'Language Distribution' /tmp/qubenhao-profile-verification/languages.svg
```

Expected: both downloads and XML validations succeed; the stats card contains visible Rank and activity data; the language card contains its title.

- [ ] **Step 3: Render representative local and remote SVGs**

Run:

```bash
rtk qlmanage -t -s 1400 -o /tmp/qubenhao-profile-verification assets/neural-command-deck.svg assets/identity-signal.svg assets/section-selected-work.svg assets/projects/distributed-system.svg assets/capabilities/infrastructure.svg assets/profile-footer.svg /tmp/qubenhao-profile-verification/stats.svg /tmp/qubenhao-profile-verification/languages.svg
```

Expected: Quick Look exits 0 and creates PNG previews in `/tmp/qubenhao-profile-verification`.

- [ ] **Step 4: Inspect the rendered samples**

Use `view_image` on these exact files:

```text
/tmp/qubenhao-profile-verification/neural-command-deck.svg.png
/tmp/qubenhao-profile-verification/identity-signal.svg.png
/tmp/qubenhao-profile-verification/section-selected-work.svg.png
/tmp/qubenhao-profile-verification/distributed-system.svg.png
/tmp/qubenhao-profile-verification/infrastructure.svg.png
/tmp/qubenhao-profile-verification/profile-footer.svg.png
/tmp/qubenhao-profile-verification/stats.svg.png
/tmp/qubenhao-profile-verification/languages.svg.png
```

Confirm: no clipped text; matching borders and palette; readable titles and tags; Rank visible; no gray heading pills; no slash-delimited display titles.

- [ ] **Step 5: Preview desktop and 375 px wrapping behavior**

Run:

```bash
rtk node scripts/render-profile-preview.mjs
```

Using the Browser skill, open this exact URL:

```text
file:///Users/benhao/Projects/QuBenhao/.superpowers/profile-preview.html
```

Inspect once at the normal browser width. Then use the Browser viewport capability to set the viewport to 375 px wide, reload the same file, and inspect again. Reset the viewport override afterward.

Confirm:

- hero and section strips scale to the available width
- the two live cards wrap rather than overlap
- project and capability pairs wrap into one readable card per row when needed
- no horizontal clipping hides project titles or tool names
- alt text preserves meaning if either live metric URL is blocked

If a fixed-height pair remains too small at 375 px, remove the pairing `<br>` pattern for that group and place each card in its own centered paragraph before repeating Steps 1–5.

- [ ] **Step 6: Verify final repository state**

Run:

```bash
rtk git status --short
rtk git log --oneline -6
```

Expected: clean worktree; the three implementation commits appear above the approved design and plan commits.

If verification required a corrective edit, rerun all Task 4 checks and commit only that correction with:

```bash
rtk git add README.md assets scripts
rtk git commit -m "Fix profile rendering"
```
