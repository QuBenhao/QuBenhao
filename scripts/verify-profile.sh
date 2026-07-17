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
  local metric_height_count
  metric_height_count="$(rg -o 'height="183"' README.md | wc -l | tr -d ' ')"
  test "$metric_height_count" -eq 2
  rg -q 'include_all_commits=true' README.md
  rg -q 'layout=compact' README.md

  if rg -n 'github-readme-stats\.vercel\.app|01 / SYSTEM ID|02 / SELECTED SYSTEMS|03 / SYSTEM MATRIX|CORE //|STATE //|EDGE //|INTEL //|GO · C\+\+ · PYTHON' README.md; then
    echo "README contains a retired service, heading, or global language list" >&2
    exit 1
  fi
}

case "${1:-all}" in
  assets) verify_assets ;;
  readme) verify_readme ;;
  all) verify_assets; verify_readme ;;
  *) echo "usage: $0 [assets|readme|all]" >&2; exit 2 ;;
esac
