# GitHub Profile Neural Command Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current GitHub profile README with the approved Neural Command Deck V2 design and repository-owned animated SVG assets.

**Architecture:** Keep essential identity, project, stack, and location content in GitHub-native Markdown/HTML. Use two self-contained SVG images only for the responsive hero and decorative focus animation; both retain readable static first frames and contain no scripts, external fonts, or remote dependencies.

**Tech Stack:** GitHub Flavored Markdown, GitHub-supported HTML tables, SVG 1.1, CSS keyframe animation, `xmllint`, macOS Quick Look rendering.

## Global Constraints

- Hero headline is exactly `BUILDING INTELLIGENT SYSTEMS.` on one visual line.
- Hero metadata is `GO · C++ · PYTHON · JAVA · KOTLIN · TYPESCRIPT // BACKEND · DISTRIBUTED SYSTEMS · AI TOOLING`.
- Do not mention employment at big tech.
- State experience as `Writing code since 2014`.
- Remove Learning Trail and Learning Signal.
- Do not repeat programming languages in System Matrix.
- No JavaScript, remote fonts, AI-generated raster imagery, scheduled actions, or required external image services.
- Every animation has a readable static state and reduced-motion fallback.
- Essential project names and links remain native README content.

## File Structure

- Create `assets/neural-command-deck.svg`: responsive hero, grid, status, single-line headline, scan animation.
- Create `assets/focus-signal.svg`: three cycling focus statements and blinking cursor.
- Modify `README.md`: identity, dynamic signal, selected systems, grouped System Matrix, footer.

---

### Task 1: Animated Profile Assets

**Files:**
- Create: `assets/neural-command-deck.svg`
- Create: `assets/focus-signal.svg`

**Interfaces:**
- Consumes: copy and motion constraints from the approved design spec.
- Produces: two relative image paths consumed by `README.md`: `./assets/neural-command-deck.svg` and `./assets/focus-signal.svg`.

- [ ] **Step 1: Verify assets do not already exist**

Run:

```bash
rtk rg --files assets
```

Expected: non-zero exit because `assets/` does not exist.

- [ ] **Step 2: Create the hero SVG**

Create `assets/neural-command-deck.svg` as a `1200 × 300` responsive SVG with:

```xml
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="300" viewBox="0 0 1200 300" role="img" aria-labelledby="title desc">
  <title id="title">Benhao Qu — Building Intelligent Systems</title>
  <desc id="desc">Backend engineer working with Go, C++, Python, Java, Kotlin, and TypeScript on distributed systems and AI tooling.</desc>
  <defs>
    <linearGradient id="background" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#05090e"/>
      <stop offset="0.58" stop-color="#07151d"/>
      <stop offset="1" stop-color="#061016"/>
    </linearGradient>
    <radialGradient id="glow" cx="86%" cy="24%" r="38%">
      <stop offset="0" stop-color="#20dcff" stop-opacity="0.24"/>
      <stop offset="1" stop-color="#20dcff" stop-opacity="0"/>
    </radialGradient>
    <pattern id="grid" width="34" height="34" patternUnits="userSpaceOnUse">
      <path d="M34 0H0V34" fill="none" stroke="#4bdcf5" stroke-opacity="0.13"/>
    </pattern>
    <linearGradient id="scan" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#5ee4ff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#5ee4ff" stop-opacity="0.18"/>
      <stop offset="1" stop-color="#5ee4ff" stop-opacity="0"/>
    </linearGradient>
    <style>
      .scan { animation: scan 6s linear infinite; }
      .pulse { animation: pulse 2.4s ease-in-out infinite; }
      @keyframes scan { from { transform: translateX(-380px); } to { transform: translateX(1380px); } }
      @keyframes pulse { 0%, 100% { opacity: .55; } 50% { opacity: 1; } }
      @media (prefers-reduced-motion: reduce) { .scan, .pulse { animation: none; } }
    </style>
  </defs>
  <rect width="1200" height="300" rx="18" fill="url(#background)"/>
  <rect width="1200" height="300" rx="18" fill="url(#glow)"/>
  <rect width="1200" height="300" rx="18" fill="url(#grid)"/>
  <rect class="scan" x="0" width="310" height="300" fill="url(#scan)"/>
  <rect x="1" y="1" width="1198" height="298" rx="17" fill="none" stroke="#1b5364" stroke-width="2"/>
  <g font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace">
    <text x="66" y="70" fill="#68e8ff" font-size="16" font-weight="700" letter-spacing="4">BENHAO // SYSTEMS ENGINEER</text>
    <text x="1135" y="70" fill="#6cf2a8" font-size="13" text-anchor="end" letter-spacing="1.5"><tspan class="pulse">●</tspan> OPEN TO INTERESTING COLLABORATIONS</text>
    <text x="66" y="164" fill="#f0fbff" font-size="54" font-weight="800" letter-spacing="-3">BUILDING <tspan fill="#57dfff">INTELLIGENT</tspan> SYSTEMS.</text>
    <text x="66" y="218" fill="#9bb1bb" font-size="15" letter-spacing="1.2">GO · C++ · PYTHON · JAVA · KOTLIN · TYPESCRIPT // BACKEND · DISTRIBUTED SYSTEMS · AI TOOLING</text>
    <text x="66" y="260" fill="#54717d" font-size="12" letter-spacing="2">GUANGZHOU, CN // UTC+08:00</text>
  </g>
</svg>
```

- [ ] **Step 3: Create the focus signal SVG**

Create `assets/focus-signal.svg` as a `1200 × 80` responsive SVG. Use three text groups sharing the same coordinates with 12-second opacity cycles, plus a blinking cursor. Include this exact visible copy:

```text
> designing distributed systems that stay understandable_
> building AI tools for real developer workflows_
> turning difficult problems into reliable systems_
```

Use CSS classes `.line-1`, `.line-2`, `.line-3`, and `.cursor`, with `prefers-reduced-motion` leaving only `.line-1` visible.

- [ ] **Step 4: Validate SVG structure and dependency boundaries**

Run:

```bash
rtk xmllint --noout assets/neural-command-deck.svg
rtk xmllint --noout assets/focus-signal.svg
rtk rg -n '<script|https?://|@import|font-face' assets
```

Expected: both `xmllint` commands exit 0; `rg` returns no matches.

- [ ] **Step 5: Render static previews**

Run:

```bash
rtk qlmanage -t -s 1600 -o /tmp/qubenhao-profile-preview assets/neural-command-deck.svg
rtk qlmanage -t -s 1600 -o /tmp/qubenhao-profile-preview assets/focus-signal.svg
```

Expected: PNG previews exist under `/tmp/qubenhao-profile-preview/` with legible, unclipped text.

- [ ] **Step 6: Commit asset slice**

```bash
rtk git add assets/neural-command-deck.svg assets/focus-signal.svg
rtk git commit -m "Add animated profile signal assets"
```

---

### Task 2: GitHub Profile README

**Files:**
- Modify: `README.md`

**Interfaces:**
- Consumes: `./assets/neural-command-deck.svg` and `./assets/focus-signal.svg` from Task 1.
- Produces: GitHub-native profile content with six linked projects and four grouped tool categories.

- [ ] **Step 1: Confirm the current README still contains removed concepts**

Run:

```bash
rtk rg -n 'big tech|Learning Trail|Tech Stack|capsule-render' README.md
```

Expected: matches for the old hero, `Learning Trail`, and `Tech Stack` establish the replacement baseline.

- [ ] **Step 2: Replace the README content**

Write these sections in this exact order:

1. centered `assets/neural-command-deck.svg`
2. centered `assets/focus-signal.svg`
3. `SYSTEM ID` two-column table
4. `SELECTED SYSTEMS` two-column table containing `LeetCode`, `distributed-system`, `xv6-lab`, `LeetCodeMCP`, `gopushdeer`, and `DancingLink`
5. `SYSTEM MATRIX` two-column table containing Backend Runtime, Data & Messaging, Infrastructure, and AI Tooling
6. centered quote and location footer

Use this identity copy:

```text
$ whoami
Benhao Qu — Backend Engineer
Guangzhou, China · Writing code since 2014

$ focus --now
Distributed Systems / AI Tooling / Developer Productivity
```

Use these project links:

```text
https://github.com/QuBenhao/LeetCode
https://github.com/QuBenhao/distributed-system
https://github.com/QuBenhao/xv6-lab
https://github.com/QuBenhao/LeetCodeMCP
https://github.com/QuBenhao/gopushdeer
https://github.com/QuBenhao/DancingLink
```

Use these System Matrix groups without repeating languages:

```text
Backend Runtime: Kitex · gRPC · Nginx · Linux · JVM · Coroutines
Data & Messaging: Redis · MySQL · PostgreSQL · MongoDB · Kafka
Infrastructure: Kubernetes · Docker · Docker Compose · Cloudflare · WireGuard
AI Tooling: LLM Integration · MCP · Ollama · MLX · OpenClaw · Claude Code
```

- [ ] **Step 3: Verify approved copy and removed content**

Run:

```bash
rtk rg -n 'BUILDING INTELLIGENT SYSTEMS|Writing code since 2014|SELECTED SYSTEMS|SYSTEM MATRIX' README.md assets
rtk rg -n 'big tech|Learning Trail|Learning Signal|github-readme-stats|capsule-render' README.md
```

Expected: first command finds every approved concept; second command returns no matches.

- [ ] **Step 4: Verify project and asset links**

Run:

```bash
rtk rg -o 'https://github.com/QuBenhao/[A-Za-z0-9_-]+' README.md
rtk rg -n 'assets/neural-command-deck.svg|assets/focus-signal.svg' README.md
```

Expected: exactly six distinct repository URLs and both relative asset paths.

- [ ] **Step 5: Commit README slice**

```bash
rtk git add README.md
rtk git commit -m "Redesign GitHub profile command deck"
```

---

### Task 3: Final Profile Verification

**Files:**
- Verify: `README.md`
- Verify: `assets/neural-command-deck.svg`
- Verify: `assets/focus-signal.svg`

**Interfaces:**
- Consumes: completed Tasks 1 and 2.
- Produces: evidence that the committed profile satisfies the design contract.

- [ ] **Step 1: Validate clean XML and whitespace**

Run:

```bash
rtk xmllint --noout assets/neural-command-deck.svg assets/focus-signal.svg
rtk git diff --check HEAD~2..HEAD
```

Expected: both commands exit 0 with no output.

- [ ] **Step 2: Check headline geometry and static fallback**

Inspect the rendered hero preview. Confirm `BUILDING INTELLIGENT SYSTEMS.` appears on one line at 1200 px and remains legible when the SVG is scaled to 375 px. Inspect the focus preview and confirm its first frame shows the complete first statement.

- [ ] **Step 3: Check repository state**

Run:

```bash
rtk git status --short --branch
rtk git log --oneline -5
```

Expected: clean worktree, local branch ahead only by the design, plan, asset, and README commits created in this workflow.
