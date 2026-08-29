# Repository Guide

## Scope

This `master`-branch repository is the public GitHub profile and verified portfolio index for `QuBenhao`. Keep profile content public, evidence-backed, and free of private local paths or credentials.

`portfolio/projects.json` is the authored project manifest. `scripts/lib/portfolio-index.mjs` owns validation and rendering rules. `PROJECTS.md`, the managed portfolio section in `README.md`, `portfolio/github-metadata.json`, and profile/project SVGs are generated outputs; change their source and regenerate them rather than hand-editing drift.

## Workflow

* Run `node --test scripts/tests/portfolio-index.test.mjs` for manifest and renderer changes.
* Run `bash scripts/verify-profile.sh all` for the source candidate. It validates the manifest, generated profile, SVGs, and README without proving public links are live.
* Run `bash scripts/verify-profile.sh links` only when current network-backed link and GitHub metadata evidence is required.
* Use `node scripts/update-portfolio-index.mjs` after an intentional manifest change; review all generated changes before accepting them.

Preserve unrelated working-tree changes. Stage generated outputs only when they correspond to the authored source change in the same candidate.
