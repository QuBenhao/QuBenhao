# GitHub Profile: Connected Layout Correction

## Status

Approved corrective design for the unified command deck. This document narrows the earlier design where live GitHub rendering disproved the assumed desktop card width.

## Problem

The visual system is consistent, but the composition is not. The corrective desktop contract targets an 800 CSS pixel README content width, matching the observed GitHub layout. The current markup sizes paired cards by height:

- a 520 × 190 project card rendered at `height="154"` becomes 421.47 px wide
- the two live metric cards rendered at `height="183"` total 852.51 px before inline whitespace

Both pairs exceed the real container. GitHub wraps every intended pair into a centered single column. Separate rounded Hero, Focus, identity, and section assets add white gutters, making the page read as many floating modules rather than one command deck.

## Goals

- Restore stable two-column rows around an 800 px GitHub desktop content width.
- Preserve automatic readable single-column wrapping on narrow screens.
- Preserve one independent link per project card.
- Reduce the number of top-level floating panels.
- Keep GitHub Rank and language data live.
- Keep the approved palette, typography, copy, and project-specific tags.

## Non-goals

- Do not collapse the whole profile into one SVG; that would remove independent project links.
- Do not add repository-defined CSS or JavaScript, which GitHub README rendering does not support.
- Do not self-host the GitHub metric service in this correction.
- Do not change project selection, capability content, or identity facts.

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

Every card intended to form a desktop pair uses `width="390"` in `README.md`. Card sizing is width-driven; paired cards must not use fixed `height` attributes.

At the observed desktop boundary:

```text
390 + 390 = 780 <= 800
```

Adjacent anchors are concatenated with no whitespace text node, leaving 20 px of width headroom.

At a 375 px viewport, the content area is narrower than 390 px. GitHub's existing `max-width: 100%` image rule clamps each card to the content width, so the second card wraps to the next line. Project text remains legible because the source card scales from 520 px to the full mobile content width rather than to 49 percent.

### 4. Live GitHub Cards

Keep the hosted GitHub Stats Extended endpoints and current color parameters.

- both embedded images use `width="390"`
- the language endpoint uses `card_width=455`

The stats card's 467 × 195 ratio and the language card's 455 × 190 ratio are effectively equal. At 390 px display width, both render near 163 px high and align as a pair without distortion.

The cards retain their existing profile and repository-list links. Failure remains isolated to optional telemetry images.

### 5. Selected Work

Keep six separate 520 × 190 project SVGs and six wrapping anchors. Display them as three rows of two cards at `width="390"`.

Each row contains exactly two adjacent anchors followed by one line break. Whitespace remains bounded so the pair fits an 800 px content width. On mobile, each card wraps to its own line.

### 6. Capability Map

Keep four separate 520 × 190 capability SVGs. Display them as two rows of two cards at `width="390"`, using the same row markup and geometry as Selected Work.

### 7. Footer

Keep the full-width footer, but remove the preceding standalone `<br>`. Its visual treatment remains a narrow terminal status line.

## Asset and Code Changes

Modify:

- `README.md`
- `scripts/generate-profile-assets.mjs`
- `scripts/verify-profile.sh`
- `scripts/render-profile-preview.mjs`, setting the preview content box to exactly 800 px at desktop width

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
4. Exactly twelve paired images use `width="390"`: two metrics, six projects, and four capabilities.
5. Paired images have no fixed `height` attribute.
6. The language endpoint contains `card_width=455`.
7. No standalone `<br>` separates major sections; line breaks remain only between explicit card rows.
8. A deterministic geometry check proves paired desktop width is at most 800 px.
9. A 375 px preview shows one card per row with no horizontal overflow.
10. Both live metric URLs return valid SVGs; the activity card exposes Rank and the language card exposes its title and language data.
11. A localhost preview is inspected at desktop and 375 px widths. `file://` is not used because the in-app browser blocks it by policy.

## Acceptance Criteria

- The top of the profile reads as one overview panel, not three stacked cards.
- GitHub metrics appear in one row on desktop.
- Selected Work appears as a 2 × 3 grid on desktop.
- Capability Map appears as a 2 × 2 grid on desktop.
- The same card groups become single-column on narrow screens.
- White gutters are limited to small row and section spacing rather than large gaps between every module.
- Project cards remain independently clickable.
