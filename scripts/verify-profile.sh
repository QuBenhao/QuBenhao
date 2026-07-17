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
