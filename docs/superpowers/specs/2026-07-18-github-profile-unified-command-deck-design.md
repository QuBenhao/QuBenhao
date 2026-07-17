# GitHub Profile: Unified Command Deck Design

## Goal

Remove the visual break between the existing dark command-deck hero and the native GitHub tables below it. The full profile should read as one engineered interface while preserving ordinary repository links, readable public facts, and graceful behavior when optional remote metrics fail.

Primary audience: engineers, maintainers, and potential collaborators evaluating Benhao's work.

## Approved Decisions

- Use the full dark command-deck direction selected as option A.
- Remove native headings such as `01 / SYSTEM ID`, `02 / SELECTED SYSTEMS`, and `03 / SYSTEM MATRIX`.
- Remove display headings such as `CORE // BACKEND RUNTIME`.
- Remove the standalone `Operator profile` block because the hero already establishes identity.
- Replace it with a compact four-cell identity rail.
- Restore GitHub Rank, Stars, Commits, PRs, Issues, and Top Languages through the maintained GitHub Stats Extended service.
- Remove the manually maintained programming-language list from the hero.
- Keep each project's primary-language tag because it describes that specific project.
- Use the public hosted metrics service now. Self-hosting remains an optional future migration.

## GitHub Rendering Boundary

GitHub profile READMEs do not support repository-defined CSS or JavaScript. The browser mockup's continuous section backgrounds therefore cannot be reproduced as styled HTML containers.

The implementation uses a sequence of visually matched images instead:

1. repository-owned SVG hero and signal assets
2. repository-owned SVG header strips
3. repository-owned linked SVG project and capability cards
4. two remote SVG metric cards with matching colors

Cards use intrinsic dimensions that fit side by side on desktop and naturally wrap when the available width is too small. Essential identity, project, and capability content remains repository-owned; remote cards are optional evidence, not structural content.

## Information Architecture

### 1. Hero

Keep the existing hero headline:

> BUILDING INTELLIGENT SYSTEMS.

Use this label:

> BENHAO · SYSTEMS ENGINEER

Replace the hand-maintained language list with domain positioning:

> BACKEND · DISTRIBUTED SYSTEMS · AI TOOLING · DEVELOPER PRODUCTIVITY

Keep the collaboration status and location. Use middle dots for compact telemetry; do not use slash-delimited display headings.

### 2. Focus Signal

Keep the animated focus strip and its three statements. Change any visible `//` separator to a middle dot so it follows the new title system.

The first frame remains readable without animation. `prefers-reduced-motion` keeps the first statement visible and disables decorative motion.

### 3. Identity Rail

Replace `Operator profile`, the terminal identity block, and the `SINCE` label/value list with one compact rail:

| Label | Value |
|---|---|
| Status | Active |
| Base | Guangzhou, CN |
| Experience | 2014 — Present |
| Local time | UTC+08:00 |

Render it as one repository-owned SVG. `Experience · 2014 — Present` replaces the awkward standalone `SINCE 2014` treatment.

### 4. GitHub Signal

Use a repository-owned section header strip:

- kicker: `PUBLIC ACTIVITY`
- title: `GitHub signal`
- secondary telemetry: `RANK · OUTPUT · LANGUAGES`

Below it, embed two live cards from the actively maintained GitHub Stats Extended service:

1. GitHub Stats: Rank, Stars, Commits, PRs, Issues, and Contributions
2. Top Languages: compact layout with eight languages

Base endpoints:

```text
https://github-stats-extended.vercel.app/api
https://github-stats-extended.vercel.app/api/top-langs/
```

Use `username=QuBenhao`, `include_all_commits=true`, and `show_icons=true` for the stats card. Use `layout=compact`, `langs_count=8`, `size_weight=0.5`, and `count_weight=0.5` for the language card.

Match the command deck with these colors:

| Token | Value |
|---|---|
| Background | `07151d` |
| Title / rank ring | `57dfff` |
| Body text | `b9d6de` |
| Icons | `6cf2a8` |
| Border | `1b5364` |

Set `border_radius=10`. Link the stats card to the GitHub profile and the language card to the repository list.

The hosted cards are optional. Their alt text identifies missing content if the service is unavailable, and no profile fact or project link depends on them.

### 5. Selected Work

Use a repository-owned section header strip:

- kicker: `SELECTED WORK`
- title: `Systems built for hard problems`
- secondary telemetry: `06 PROJECTS`

Render six individual repository-owned SVG cards. Each card is wrapped in a normal `<a>` element so the full card opens its repository.

| Project | Purpose | Tags |
|---|---|---|
| `LeetCode` | Local problem-solving system with a custom runner, solution templates, and progress tracking. | Python · Automation · CLI |
| `distributed-system` | MIT 6.5840 labs covering Raft consensus, fault-tolerant key-value services, and sharded storage. | Go · Raft · Distributed Systems |
| `xv6-lab` | MIT 6.S081 kernel labs covering syscalls, virtual memory, storage, and scheduling. | C · Kernel · Operating Systems |
| `LeetCodeMCP` | MCP server exposing problem-solving workflows as tools for AI coding assistants. | Python · MCP · AI Tooling |
| `gopushdeer` | Lightweight PushDeer SDK for cross-platform push notifications from Go. | Go · SDK · Notifications |
| `triage` | Privacy-first LLM gateway for policy routing, redaction, and spend control across local and remote models. | Go · LLM Gateway · Privacy |

Each card uses a subtle `PROJECT · NN` coordinate, a cyan linked title, concise body copy, and muted project-specific tags. Do not repeat a manually maintained global language list elsewhere.

### 6. Capability Map

Use a repository-owned section header strip:

- kicker: `CAPABILITY MAP`
- title: `Engineering systems, end to end`
- secondary telemetry: `04 DOMAINS`

Use four repository-owned SVG cards. Group names use title case without codenames or slash separators:

| Group | Tools |
|---|---|
| Backend runtime | Kitex · gRPC · Nginx · Linux · JVM · Coroutines |
| Data & messaging | Redis · MySQL · PostgreSQL · MongoDB · Kafka |
| Infrastructure | Kubernetes · Docker · Docker Compose · Cloudflare · WireGuard |
| AI tooling | LLM Integration · MCP · Ollama · MLX · OpenClaw · Claude Code |

The small coordinate may use `DOMAIN · NN`; the visible group name remains direct and human-readable.

### 7. Footer

Use a narrow repository-owned SVG footer that matches the focus strip:

> “The best code solves the problem elegantly.”

Supporting line:

> GUANGZHOU, CN · UTC+08:00 · OPEN TO INTERESTING COLLABORATIONS

## Visual System

### Palette

| Role | Color |
|---|---|
| Deep background | `#05090e` |
| Raised panel | `#07151d` |
| Grid / border | `#1b5364` |
| Signal cyan | `#57dfff` |
| Active green | `#6cf2a8` |
| Primary text | `#edfaff` |
| Secondary text | `#b9d6de` |
| Muted telemetry | `#7796a3` |

### Typography and Hierarchy

- Use a system monospace stack inside SVG assets.
- Use small uppercase kickers only for telemetry categories.
- Use title case for human-facing section and capability names.
- Use `·` for compact telemetry separation.
- Avoid `/` and `//` in prominent headings.
- Avoid gray pill backgrounds behind headings and labels.
- Use cyan as an accent, not as the body-copy color.

### Shape and Density

- Use 10–18 px corner radii depending on asset height.
- Use thin cyan-blue borders and low-opacity grids.
- Keep card copy to one purpose sentence and one tag line.
- Alternate glow intensity, not light/dark card backgrounds.
- Preserve generous vertical gaps between major systems while keeping internal telemetry compact.

## Asset Plan

Modify:

- `assets/neural-command-deck.svg`
- `assets/focus-signal.svg`

Create:

- `assets/identity-signal.svg`
- `assets/section-github-signal.svg`
- `assets/section-selected-work.svg`
- `assets/section-capability-map.svg`
- `assets/profile-footer.svg`
- six project card SVGs under `assets/projects/`
- four capability card SVGs under `assets/capabilities/`

Project and capability cards share the same geometry and token values. They remain separate files because GitHub cannot provide independent click targets inside one embedded composite SVG.

## Responsive Behavior

- Every repository-owned SVG uses a responsive `viewBox` and no external font or asset.
- Hero and section strips scale to the README width.
- Project and capability cards use compact intrinsic dimensions and inline placement. They appear in pairs when space allows and wrap into one card per row when it does not.
- Live metric cards use equal rendered heights so they align on desktop and wrap on narrow screens.
- Validate text at the GitHub README desktop width and a 375 px viewport. If inline wrapping still makes a card illegible at 375 px, stack that card group unconditionally.

## Accessibility

- Every image has useful alt text.
- Every project remains an ordinary text-equivalent link through its wrapping anchor and alt text.
- Cyan, green, and body text meet WCAG AA contrast against the dark backgrounds.
- Essential information is not encoded by color alone.
- Motion is slow, decorative, and disabled by `prefers-reduced-motion`.
- Remote metrics do not contain the only copy of identity, projects, or capabilities.

## Failure Behavior

- If GitHub Stats Extended is unavailable, only the two optional metric images fail.
- If animation is unsupported, the first focus statement remains visible.
- If a repository is renamed or archived, update only its linked card.
- If the public metrics service becomes persistently unreliable, migrate the same URLs to a self-hosted GitHub Stats Extended Vercel deployment or repository-owned Action-generated SVGs without changing the page architecture.

## Validation

Before completion:

1. Validate every repository-owned SVG with `xmllint`.
2. Confirm assets contain no scripts, external fonts, or remote dependencies.
3. Request both GitHub Stats Extended URLs and require `HTTP 200` plus `image/svg+xml`.
4. Render all local SVGs and inspect text, alignment, border consistency, and clipping.
5. Preview the README at desktop width and 375 px.
6. Check all six repository links.
7. Confirm the hero contains no manually maintained programming-language list.
8. Confirm no prominent heading contains `/` or `//`.
9. Confirm Rank remains visible on the stats card.
10. Confirm essential content remains understandable with remote images unavailable.

## Out of Scope

- self-hosting GitHub Stats Extended in this revision
- private contribution statistics
- GitHub Actions for scheduled asset generation
- contribution snakes, trophy walls, view counters, or WakaTime cards
- standalone portfolio website
- custom JavaScript or analytics
