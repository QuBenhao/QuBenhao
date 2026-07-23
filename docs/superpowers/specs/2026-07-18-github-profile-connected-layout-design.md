# GitHub Profile: Connected Layout Correction

## Status

Approved corrective design for the unified command deck. This document narrows the earlier design where live GitHub rendering disproved the assumed desktop card width.

## Problem

The visual system is consistent, but the composition is not. The corrective desktop contract targets the observed 766 CSS pixel GitHub README content width. The current markup sizes paired cards by height:

- a 520 × 190 project card rendered at `height="154"` becomes 421.47 px wide
- the two live metric cards rendered at `height="183"` total 852.51 px before inline whitespace

Both pairs exceed the real container. GitHub wraps every intended pair into a centered single column. Separate rounded Hero, Focus, identity, and section assets add white gutters, making the page read as many floating modules rather than one command deck.

## Goals

- Restore stable two-column rows around a 766 px GitHub desktop content width.
- Preserve automatic readable single-column wrapping on narrow screens.
- Preserve one independent link per project card.
- Reduce the number of top-level floating panels.
- Keep GitHub Rank and language data live.
- Keep the approved palette, typography, copy, and project-specific tags.

## Non-goals

- Do not collapse the whole profile into one SVG; that would remove independent project links.
- Do not add repository-defined CSS or JavaScript, which GitHub README rendering does not support.
- Do not self-host the GitHub metric service in this correction.
- Do not change capability content or identity facts. Project selection changes only when needed to replace a dead public link.

## Approved Composition

### 1. Profile Overview

Replace the three independent Hero, Focus, and identity images in `README.md` with one repository-owned `assets/profile-overview.svg`.

The overview uses one 1200 × 440 outer frame:

- upper region: identity label, headline, domain positioning, collaboration signal, and decorative network
- middle region: the existing three-state animated focus signal
- lower region: Status, Base, Experience, and Local Time cells

Internal regions use thin divider lines. They do not use nested rounded frames. The first focus statement remains visible without animation, and `prefers-reduced-motion` disables decorative motion.

Keep the existing source assets in the repository for compatibility, but `README.md` no longer embeds them individually.

### 2. Compact Section Strips

The GitHub Signal, Selected Work, and Capability Map strips retain their approved labels and become exactly 84 px high. Each strip uses one compact title row and one low-contrast rule. Large empty panel space is removed.

Standalone `<br>` elements between major sections are removed. Natural block flow and the images' own geometry provide separation.

### 3. Stable Paired Geometry

Every card intended to form a desktop pair uses `width="380"` in `README.md`. Card sizing is width-driven; paired cards must not use fixed `height` attributes.

At the observed desktop boundary:

```text
380 + 380 = 760 <= 766
```

Adjacent anchors are concatenated with no whitespace text node, leaving 6 px of width headroom.

At a 375 px viewport, the content area is narrower than 380 px. GitHub's existing `max-width: 100%` image rule clamps each card to the content width, so the second card wraps to the next line. Project text remains legible because the source card scales from 520 px to the full mobile content width rather than to 49 percent.

### 4. Live GitHub Cards

Keep the hosted GitHub Stats Extended endpoints and current color parameters.

- both embedded images use `width="380"`
- the language endpoint uses `card_width=455`

The stats card's 467 × 195 ratio and the language card's 455 × 190 ratio are effectively equal. At 380 px display width, both render near 159 px high and align as a pair without distortion.

The cards retain their existing profile and repository-list links. Failure remains isolated to optional telemetry images.

### 5. Selected Work

Keep six separate 520 × 190 project SVGs and six wrapping anchors. Display them as three rows of two cards at `width="380"`.

Each row contains exactly two adjacent anchors followed by one line break. Whitespace remains bounded so the pair fits a 766 px content width. On mobile, each card wraps to its own line. Replace the unavailable `triage` target with this public profile repository's generated command-deck project.

### 6. Capability Map

Keep four separate 520 × 190 capability SVGs. Display them as two rows of two cards at `width="380"`, using the same row markup and geometry as Selected Work.

### 7. Footer

Keep the full-width footer, but remove the preceding standalone `<br>`. Its visual treatment remains a narrow terminal status line.

## Asset and Code Changes

Modify:

- `README.md`
- `scripts/generate-profile-assets.mjs`
- `scripts/verify-profile.sh`
- `scripts/render-profile-preview.mjs`, setting the preview article to 798 px so its 16 px side padding leaves exactly 766 px of desktop content

Generate or regenerate:

- `assets/profile-overview.svg`
- `assets/section-github-signal.svg`
- `assets/section-selected-work.svg`
- `assets/section-capability-map.svg`

Keep the project and capability card files separate to preserve click targets.

## Verification Contract

The correction is complete only when all of these hold:

1. `node scripts/generate-profile-assets.mjs --check` reports no drift.
2. Every repository-owned SVG passes `xmllint` and contains no executable or remote dependency.
3. `README.md` embeds `assets/profile-overview.svg` exactly once and no longer embeds the three old top assets.
4. Exactly twelve paired images use `width="380"`: two metrics, six projects, and four capabilities.
5. Paired images have no fixed `height` attribute.
6. The language endpoint contains `card_width=455`.
7. No standalone `<br>` separates major sections; line breaks remain only between explicit card rows.
8. A deterministic geometry check proves paired desktop width is at most 766 px.
9. A 375 px preview shows one card per row with no horizontal overflow.
10. A separate opt-in live-link check verifies the profile, repository-list, and six project HTTPS targets; offline verification does not depend on the network.
11. A localhost preview is inspected at desktop and 375 px widths. `file://` is not used because the in-app browser blocks it by policy.

## Acceptance Criteria

- The top of the profile reads as one overview panel, not three stacked cards.
- GitHub metrics appear in one row on desktop.
- Selected Work appears as a 2 × 3 grid on desktop.
- Capability Map appears as a 2 × 2 grid on desktop.
- The same card groups become single-column on narrow screens.
- White gutters are limited to small row and section spacing rather than large gaps between every module.
- Project cards remain independently clickable.
