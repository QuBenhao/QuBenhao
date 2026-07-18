# GitHub Profile Connected Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fragmented, single-column GitHub rendering with one connected overview and stable desktop card pairs that wrap readably on mobile.

**Architecture:** Generate one repository-owned overview SVG that combines Hero, Focus, and identity. Keep independently linked project SVGs, but size every paired README image by an exact 390 px width so two cards fit an 800 px desktop content box and each card clamps to one mobile row. Extend the deterministic verifier to enforce asset, copy, link, and geometry contracts.

**Tech Stack:** GitHub README HTML, dependency-free Node.js ESM, Bash, generated SVG, `xmllint`, GitHub Stats Extended, local HTTP preview.

## Global Constraints

- Work directly on `master`, as explicitly approved by the user.
- Preserve one independent link per project card.
- Keep GitHub Rank and language data live through `github-stats-extended.vercel.app`.
- Use `assets/profile-overview.svg` as the only top overview image embedded by `README.md`.
- Use exactly 84 px source height for each section strip.
- Use `width="390"` for exactly twelve paired images: two metrics, six projects, and four capabilities.
- Paired README images must not have fixed `height` attributes.
- Adjacent desktop pair elements must have no whitespace text node between them.
- Use `card_width=455` for the live language card.
- Keep the approved dark palette, monospace typography, copy, and project-specific tags.
- Add no production dependency, remote font, executable SVG content, or repository-defined README CSS.

---

### Task 1: Generate the Connected Overview and Compact Section Strips

**Files:**
- Modify: `scripts/generate-profile-assets.mjs`
- Modify: `scripts/verify-profile.sh`
- Create: `assets/profile-overview.svg` through the generator
- Regenerate: `assets/section-github-signal.svg`
- Regenerate: `assets/section-selected-work.svg`
- Regenerate: `assets/section-capability-map.svg`

**Interfaces:**
- Consumes: existing `colors`, `font`, `escapeXml()`, `svgFrame()`, project data, and capability data in `scripts/generate-profile-assets.mjs`.
- Produces: deterministic `profileOverviewSvg(): string`, 84 px section strips, and `node scripts/generate-profile-assets.mjs --check` drift detection.

- [ ] **Step 1: Extend the asset contract before generating the new asset**

Add `assets/profile-overview.svg` to the `assets` array in `scripts/verify-profile.sh`. Replace the identity-only copy assertion with:

```bash
rg -q 'BUILDING' assets/profile-overview.svg
rg -q 'FOCUS · LIVE' assets/profile-overview.svg
rg -q '2014 — PRESENT' assets/profile-overview.svg

for section in \
  assets/section-github-signal.svg \
  assets/section-selected-work.svg \
  assets/section-capability-map.svg; do
  rg -q 'height="84"' "$section"
done
```

- [ ] **Step 2: Run the asset verifier and confirm the expected failure**

Run:

```bash
rtk bash scripts/verify-profile.sh assets
```

Expected: exit 1 because `assets/profile-overview.svg` does not exist and the existing section strips have `height="120"`.

- [ ] **Step 3: Add the complete overview renderer**

Insert this function before `identitySvg()` in `scripts/generate-profile-assets.mjs`:

```javascript
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
```

- [ ] **Step 4: Replace the section renderer with exact 84 px geometry**

Replace `sectionSvg()` with:

```javascript
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
```

- [ ] **Step 5: Register and generate the overview**

Add this first entry to `outputs`:

```javascript
['assets/profile-overview.svg', profileOverviewSvg()],
```

Run:

```bash
rtk node scripts/generate-profile-assets.mjs
```

Expected: exit 0; `assets/profile-overview.svg` is created and three section assets are regenerated.

- [ ] **Step 6: Verify the generated asset slice**

Run:

```bash
rtk bash scripts/verify-profile.sh assets
rtk git diff --check
```

Expected: both exit 0 with no XML, dependency, drift, copy, or whitespace errors.

- [ ] **Step 7: Commit the generated overview slice**

```bash
rtk git add scripts/generate-profile-assets.mjs scripts/verify-profile.sh assets/profile-overview.svg assets/section-github-signal.svg assets/section-selected-work.svg assets/section-capability-map.svg
rtk git commit -m "Connect profile overview"
```

---

### Task 2: Compose Stable Desktop Pairs and Mobile Rows

**Files:**
- Modify: `README.md`
- Modify: `scripts/verify-profile.sh`
- Modify: `scripts/render-profile-preview.mjs`

**Interfaces:**
- Consumes: `assets/profile-overview.svg`, three 84 px section strips, six project cards, four capability cards, and two GitHub Stats Extended endpoints.
- Produces: a README with 800 px desktop pair geometry, 390 px card widths, independent project links, and an 800 px local preview content box.

- [ ] **Step 1: Replace `verify_readme()` with the corrected layout contract**

Use this complete function:

```bash
verify_readme() {
  local asset_refs=(
    assets/profile-overview.svg
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

  test "$(rg -o 'github-stats-extended\.vercel\.app' README.md | wc -l | tr -d ' ')" -eq 2
  test "$(rg -o 'width="390"' README.md | wc -l | tr -d ' ')" -eq 12
  test "$(rg -o '</a><a ' README.md | wc -l | tr -d ' ')" -eq 4
  test "$(rg -o '/><img ' README.md | wc -l | tr -d ' ')" -eq 2

  rg -q 'include_all_commits=true' README.md
  rg -q 'layout=compact' README.md
  rg -q 'card_width=455' README.md

  if rg -n 'height="[0-9]+"|assets/neural-command-deck\.svg|assets/focus-signal\.svg|assets/identity-signal\.svg|^[[:space:]]*<br>[[:space:]]*$' README.md; then
    echo "README contains fixed heights, retired top assets, or a standalone break" >&2
    exit 1
  fi

  local desktop_width=800
  local card_width=390
  local mobile_content_width=343
  if (( card_width * 2 > desktop_width )); then
    echo "paired cards exceed the desktop contract" >&2
    exit 1
  fi
  if (( card_width <= mobile_content_width )); then
    echo "paired cards will not wrap at the mobile contract" >&2
    exit 1
  fi

  if rg -n 'github-readme-stats\.vercel\.app|01 / SYSTEM ID|02 / SELECTED SYSTEMS|03 / SYSTEM MATRIX|CORE //|STATE //|EDGE //|INTEL //|GO · C\+\+ · PYTHON' README.md; then
    echo "README contains a retired service, heading, or global language list" >&2
    exit 1
  fi
}
```

- [ ] **Step 2: Run the README contract and confirm the expected failure**

Run:

```bash
rtk bash scripts/verify-profile.sh readme
```

Expected: exit 1 because the current README embeds the three retired top assets and uses fixed heights instead of twelve 390 px widths.

- [ ] **Step 3: Replace `README.md` with the approved composition**

Use this exact content:

```html
<div align="center">
  <img src="./assets/profile-overview.svg" alt="Benhao Qu — systems engineer in Guangzhou building backend, distributed, and AI tooling systems since 2014" width="100%" />
</div>
<div align="center">
  <img src="./assets/section-github-signal.svg" alt="GitHub signal: rank, output, and languages" width="100%" />
</div>
<p align="center">
  <a href="https://github.com/QuBenhao"><img src="https://github-stats-extended.vercel.app/api?username=QuBenhao&amp;show_icons=true&amp;include_all_commits=true&amp;bg_color=07151d&amp;title_color=57dfff&amp;text_color=b9d6de&amp;icon_color=6cf2a8&amp;ring_color=57dfff&amp;border_color=1b5364&amp;border_radius=10&amp;custom_title=Activity%20Summary" alt="GitHub activity summary with rank, stars, commits, pull requests, issues, and contributions" width="390" /></a><a href="https://github.com/QuBenhao?tab=repositories"><img src="https://github-stats-extended.vercel.app/api/top-langs/?username=QuBenhao&amp;layout=compact&amp;langs_count=8&amp;size_weight=0.5&amp;count_weight=0.5&amp;card_width=455&amp;bg_color=07151d&amp;title_color=57dfff&amp;text_color=b9d6de&amp;border_color=1b5364&amp;border_radius=10&amp;custom_title=Language%20Distribution" alt="Language distribution across public repositories" width="390" /></a>
</p>
<div align="center">
  <img src="./assets/section-selected-work.svg" alt="Selected work: systems built for hard problems" width="100%" />
</div>
<p align="center">
  <a href="https://github.com/QuBenhao/LeetCode"><img src="./assets/projects/leetcode.svg" alt="LeetCode — Python automation and CLI problem-solving system" width="390" /></a><a href="https://github.com/QuBenhao/distributed-system"><img src="./assets/projects/distributed-system.svg" alt="distributed-system — Go, Raft, and distributed systems labs" width="390" /></a><br>
  <a href="https://github.com/QuBenhao/xv6-lab"><img src="./assets/projects/xv6-lab.svg" alt="xv6-lab — C kernel and operating systems labs" width="390" /></a><a href="https://github.com/QuBenhao/LeetCodeMCP"><img src="./assets/projects/leetcode-mcp.svg" alt="LeetCodeMCP — Python MCP tools for coding assistants" width="390" /></a><br>
  <a href="https://github.com/QuBenhao/gopushdeer"><img src="./assets/projects/gopushdeer.svg" alt="gopushdeer — Go SDK for push notifications" width="390" /></a><a href="https://github.com/QuBenhao/triage"><img src="./assets/projects/triage.svg" alt="triage — Go privacy-first LLM gateway" width="390" /></a>
</p>
<div align="center">
  <img src="./assets/section-capability-map.svg" alt="Capability map: engineering systems end to end" width="100%" />
</div>
<p align="center">
  <img src="./assets/capabilities/backend-runtime.svg" alt="Backend runtime: Kitex, gRPC, Nginx, Linux, JVM, and Coroutines" width="390" /><img src="./assets/capabilities/data-messaging.svg" alt="Data and messaging: Redis, MySQL, PostgreSQL, MongoDB, and Kafka" width="390" /><br>
  <img src="./assets/capabilities/infrastructure.svg" alt="Infrastructure: Kubernetes, Docker, Docker Compose, Cloudflare, and WireGuard" width="390" /><img src="./assets/capabilities/ai-tooling.svg" alt="AI tooling: LLM Integration, MCP, Ollama, MLX, OpenClaw, and Claude Code" width="390" />
</p>
<div align="center">
  <img src="./assets/profile-footer.svg" alt="The best code solves the problem elegantly. Guangzhou, China, UTC plus eight; open to interesting collaborations." width="100%" />
</div>
```

- [ ] **Step 4: Set the local desktop content box to exactly 800 px**

In `scripts/render-profile-preview.mjs`, replace the `.markdown-body` rule with:

```css
.markdown-body { box-sizing: border-box; width: min(832px, 100%); margin: 0 auto; padding: 24px 16px; }
```

This produces an 800 px content box at desktop width and a 343 px content box at a 375 px viewport.

- [ ] **Step 5: Run README and deterministic preview verification**

Run:

```bash
rtk bash scripts/verify-profile.sh readme
rtk node scripts/render-profile-preview.mjs
rtk bash scripts/verify-profile.sh all
rtk git diff --check
```

Expected: all commands exit 0; the preview command prints the absolute `.superpowers/profile-preview.html` path.

- [ ] **Step 6: Commit the composition slice**

```bash
rtk git add README.md scripts/verify-profile.sh scripts/render-profile-preview.mjs
rtk git commit -m "Stabilize profile card grid"
```

---

### Task 3: Verify Live GitHub Rendering and Responsive Layout

**Files:**
- Verify: `README.md`
- Verify: `assets/profile-overview.svg`
- Verify: three section strip SVGs
- Verify: six project card SVGs
- Verify: four capability card SVGs
- Verify: `scripts/generate-profile-assets.mjs`
- Verify: `scripts/verify-profile.sh`

**Interfaces:**
- Consumes: committed Tasks 1–2 and live public GitHub Stats Extended responses.
- Produces: fresh evidence for deterministic assets, 800 px desktop pairing, 375 px mobile wrapping, live Rank/language cards, and clean repository state.

- [ ] **Step 1: Run structural verification from the committed tree**

```bash
rtk node scripts/generate-profile-assets.mjs --check
rtk bash scripts/verify-profile.sh all
rtk git diff --check HEAD~2..HEAD
```

Expected: all commands exit 0.

- [ ] **Step 2: Fetch and validate both live metric cards**

```bash
rtk mkdir -p /tmp/qubenhao-connected-profile
rtk curl -fsS -o /tmp/qubenhao-connected-profile/stats.svg 'https://github-stats-extended.vercel.app/api?username=QuBenhao&show_icons=true&include_all_commits=true&bg_color=07151d&title_color=57dfff&text_color=b9d6de&icon_color=6cf2a8&ring_color=57dfff&border_color=1b5364&border_radius=10&custom_title=Activity%20Summary'
rtk curl -fsS -o /tmp/qubenhao-connected-profile/languages.svg 'https://github-stats-extended.vercel.app/api/top-langs/?username=QuBenhao&layout=compact&langs_count=8&size_weight=0.5&count_weight=0.5&card_width=455&bg_color=07151d&title_color=57dfff&text_color=b9d6de&border_color=1b5364&border_radius=10&custom_title=Language%20Distribution'
rtk xmllint --noout /tmp/qubenhao-connected-profile/stats.svg /tmp/qubenhao-connected-profile/languages.svg
rtk rg -n 'Activity Summary, Rank:|Language Distribution|Python' /tmp/qubenhao-connected-profile/stats.svg /tmp/qubenhao-connected-profile/languages.svg
```

Expected: both SVGs parse; the stats title includes a Rank and the language response includes its title plus language data.

- [ ] **Step 3: Generate and serve the local preview**

```bash
rtk node scripts/render-profile-preview.mjs
rtk python3 -m http.server 61316 --directory /Users/benhao/Projects/QuBenhao
```

Keep the HTTP server session running only during browser verification.

- [ ] **Step 4: Inspect desktop and mobile browser geometry**

Open:

```text
http://localhost:61316/.superpowers/profile-preview.html
```

At the normal desktop viewport, verify by DOM geometry and screenshot:

- the overview is one outer panel
- both live metric cards share one row
- project cards form three rows of two
- capability cards form two rows of two
- no card extends beyond the 800 px content box

Set the browser viewport to 375 px wide, reload, and verify:

- each paired card occupies one row
- no horizontal overflow exists
- project title, body, and tag text remain readable

Reset the viewport override and stop the temporary HTTP server.

- [ ] **Step 5: Run final repository checks**

```bash
rtk node scripts/generate-profile-assets.mjs --check
rtk bash scripts/verify-profile.sh all
rtk git status --short
rtk git log -3 --oneline
```

Expected: deterministic and profile contracts exit 0; status is clean; log contains the design, overview, and grid commits.
