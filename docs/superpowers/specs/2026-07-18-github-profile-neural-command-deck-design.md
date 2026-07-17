# GitHub Profile: Neural Command Deck Design

## Goal

Redesign `README.md` as a high-tech GitHub profile that communicates backend and systems depth quickly. The profile should feel engineered and alive, not like a generic cyberpunk template.

Primary audience: engineers, maintainers, and potential collaborators evaluating Benhao's work. The design prioritizes technical credibility, scanability, and project discovery.

## Approved Direction

Use the **Neural Command Deck V2** visual direction:

- deep GitHub-compatible navy background
- cyan signal color with restrained green status accents
- monospace typography and command-line language
- thin grids, system labels, telemetry, and subtle animated signals
- compact copy grounded in real projects and tools

Do not mention employment at "big tech." State experience as `Writing code since 2014`.

## Content Architecture

### 1. Hero

The hero presents one uninterrupted headline:

> BUILDING INTELLIGENT SYSTEMS.

`SYSTEMS` must not wrap intentionally. The supporting line includes languages before specialties:

> GO · C++ · PYTHON · JAVA · KOTLIN · TYPESCRIPT // BACKEND · DISTRIBUTED SYSTEMS · AI TOOLING

Include the label `BENHAO // SYSTEMS ENGINEER` and a restrained `OPEN TO INTERESTING COLLABORATIONS` status.

### 2. Dynamic Signal

Place one animated command line directly below the hero. It cycles through short, credible focus statements such as:

- `designing distributed systems that stay understandable`
- `building AI tools for real developer workflows`
- `turning difficult problems into reliable systems`

Animation must use a repository-owned SVG embedded as an image. No JavaScript, GIF video, or runtime API is required. The first SVG frame must remain readable when motion is disabled or paused.

### 3. Identity and Telemetry

Use a two-column HTML table supported by GitHub Markdown.

Left column: terminal-style identity block:

```text
$ whoami
Benhao Qu — Backend Engineer
Guangzhou, China · Writing code since 2014

$ focus --now
Distributed Systems / AI Tooling / Developer Productivity
```

Right column: compact telemetry for public, verifiable profile data only:

- repositories
- stars
- coding since 2014
- active status

Avoid hard-coded values that are likely to become stale unless they come from a reliable dynamic image. If live totals cannot be made reliable, omit them rather than showing outdated numbers.

### 4. Selected Systems

Use a two-column project grid. Each card includes repository name, one-sentence purpose, primary language, and two or three domain tags. Link the whole project title.

Initial projects:

1. `LeetCode`
2. `distributed-system`
3. `xv6-lab`
4. `LeetCodeMCP`
5. `gopushdeer`
6. `DancingLink`

Project copy must stay specific and factual. Do not display star counts unless sourced dynamically or verified during implementation.

### 5. System Matrix

Replace the flat Toolchain list with four visually distinct groups. Languages do not repeat here because the hero already carries them.

| Group | Tools |
|---|---|
| Backend Runtime | Kitex, gRPC, Nginx, Linux, JVM, Coroutines |
| Data & Messaging | Redis, MySQL, PostgreSQL, MongoDB, Kafka |
| Infrastructure | Kubernetes, Docker, Docker Compose, Cloudflare, WireGuard |
| AI Tooling | LLM Integration, MCP, Ollama, MLX, OpenClaw, Claude Code |

Render groups as a two-column HTML table with compact headings and consistent badges or inline labels. Avoid a long undifferentiated badge wall.

### 6. Footer

End with:

- `“The best code solves the problem elegantly.”`
- `GUANGZHOU, CN // UTC+08:00`

Remove the previous Learning Trail / Learning Signal section.

## Visual Assets

Use repository-owned deterministic SVG assets under `assets/`:

- `assets/neural-command-deck.svg` — hero banner with grid, cyan signal, single-line headline, and static fallback state
- `assets/focus-signal.svg` — animated command-line focus loop with a blinking cursor

Keep visible text in the SVG source editable and sharp. Do not use AI-generated raster imagery for this version; it would reduce text precision and make future copy changes harder.

Animation should be subtle:

- hero scan pass: about 6 seconds, linear, low opacity
- focus line cycle: about 9–12 seconds total
- cursor blink: about 800 milliseconds
- respect `prefers-reduced-motion` when supported; preserve a readable static state otherwise

## GitHub Constraints

`README.md` may use Markdown, GitHub-supported HTML tables, linked images, code blocks, and badges. It must not depend on custom page CSS or JavaScript.

Essential content stays native Markdown/HTML. Animated SVGs enhance the presentation but do not contain the only copy of project names, links, or contact information.

External image services are optional, not structural. A service outage must not erase identity, projects, or stack information.

## Responsive Behavior

- SVGs use a responsive `viewBox` and scale to available width.
- Hero headline remains one line inside the SVG at desktop width and scales with the image on narrow screens.
- GitHub does not provide custom responsive CSS for README tables. Keep every two-column cell concise and verify GitHub's narrow-width horizontal scrolling; switch the affected section to one column if it is not legible at 375 px.
- Keep all text legible at GitHub's common README width and at 375 px viewport width.

## Accessibility

- Every image has useful alt text.
- Cyan-on-navy and green-on-navy text meet WCAG AA contrast for normal text.
- Motion is decorative and slow; no rapid flashes.
- All repository links remain ordinary text links outside the SVG assets.
- Emoji are optional decoration, never the only section labels.

## Failure Handling

- If an SVG animation is unsupported, its first frame communicates the same information.
- If an optional dynamic metric fails, omit that metric asset without leaving a broken-image gap.
- If a project is renamed or archived, update only its card; layout does not depend on repository API responses.

## Validation

Before completion:

1. Render both SVG assets locally and inspect their first frame.
2. Validate SVG XML and confirm no external fonts, scripts, or remote assets.
3. Preview `README.md` at desktop and narrow widths.
4. Check every repository link.
5. Check visible profile facts against the current public GitHub profile.
6. Confirm the hero headline stays on one line.
7. Confirm meaningful content remains when animated images are unavailable.

## Out of Scope

- standalone portfolio website
- GitHub Actions for contribution snakes or scheduled asset generation
- private employment history
- contact forms, analytics, or tracking
- AI-generated raster artwork
