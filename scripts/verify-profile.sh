#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

assets=(
  assets/neural-command-deck.svg
  assets/focus-signal.svg
  assets/identity-signal.svg
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
  assets/projects/profile-command-deck.svg
  assets/capabilities/backend-runtime.svg
  assets/capabilities/data-messaging.svg
  assets/capabilities/infrastructure.svg
  assets/capabilities/ai-tooling.svg
)

live_links=(
  https://github.com/QuBenhao
  'https://github.com/QuBenhao?tab=repositories'
  https://github.com/QuBenhao/LeetCode
  https://github.com/QuBenhao/distributed-system
  https://github.com/QuBenhao/xv6-lab
  https://github.com/QuBenhao/LeetCodeMCP
  https://github.com/QuBenhao/gopushdeer
  https://github.com/QuBenhao/QuBenhao
)

require_literal() {
  local value="$1"
  local file="$2"
  local label="$3"
  if ! rg -Fq -- "$value" "$file"; then
    echo "$file is missing $label: $value" >&2
    exit 1
  fi
}

require_count() {
  local pattern="$1"
  local expected="$2"
  local label="$3"
  local actual
  actual="$({ rg -o -- "$pattern" README.md || true; } | wc -l | tr -d ' ')"
  if [[ "$actual" -ne "$expected" ]]; then
    echo "README expected $expected $label, found $actual" >&2
    exit 1
  fi
}

verify_assets() {
  for asset in "${assets[@]}"; do
    if [[ ! -f "$asset" ]]; then
      echo "missing SVG asset: $asset" >&2
      exit 1
    fi
    if ! xmllint --noout "$asset"; then
      echo "invalid SVG asset: $asset" >&2
      exit 1
    fi
  done

  node scripts/generate-profile-assets.mjs --check

  if rg -n '<script|@import|@font-face|<image[^>]+href="https?://|url\(https?://' "${assets[@]}"; then
    echo "SVG assets contain a forbidden external or executable dependency" >&2
    exit 1
  fi

  require_literal 'BUILDING' assets/profile-overview.svg 'headline'
  require_literal 'FOCUS · LIVE' assets/profile-overview.svg 'focus status'
  require_literal '2014 — PRESENT' assets/profile-overview.svg 'experience range'
  require_literal 'Systems built for hard problems' assets/section-selected-work.svg 'section title'
  require_literal 'Backend runtime' assets/capabilities/backend-runtime.svg 'capability title'

  for section in \
    assets/section-github-signal.svg \
    assets/section-selected-work.svg \
    assets/section-capability-map.svg; do
    require_literal 'height="84"' "$section" '84 px section height'
  done

  if rg -n 'SYSTEM ID|SELECTED SYSTEMS|SYSTEM MATRIX|CORE //|STATE //|EDGE //|INTEL //' "${assets[@]}"; then
    echo "SVG assets contain a retired heading" >&2
    exit 1
  fi
}

verify_readme() {
  require_literal '<base href="../">' scripts/render-profile-preview.mjs 'portable preview base'

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
    assets/projects/profile-command-deck.svg
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
    https://github.com/QuBenhao/QuBenhao
  )

  for asset in "${asset_refs[@]}"; do
    require_literal "$asset" README.md 'asset reference'
  done
  for link in "${project_links[@]}"; do
    require_literal "$link" README.md 'project link'
  done

  require_count 'github-stats-extended\.vercel\.app' 2 'GitHub metric cards'
  require_count 'width="380"' 12 'paired cards with width="380"'
  require_count '</a><a ' 4 'adjacent linked card pairs'
  require_count '/><img ' 2 'adjacent capability card pairs'

  require_literal 'include_all_commits=true' README.md 'activity-card query parameter'
  require_literal 'layout=compact' README.md 'language-card query parameter'
  require_literal 'card_width=455' README.md 'language-card width parameter'

  if rg -n 'height="[0-9]+"|assets/neural-command-deck\.svg|assets/focus-signal\.svg|assets/identity-signal\.svg|^[[:space:]]*<br>[[:space:]]*$' README.md; then
    echo "README contains fixed heights, retired top assets, or a standalone break" >&2
    exit 1
  fi

  local desktop_width=766
  local card_width=380
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

verify_links() {
  local link
  for link in "${live_links[@]}"; do
    if ! curl --max-time 20 --proto '=https' --proto-redir '=https' --tlsv1.2 -fsSL -o /dev/null "$link"; then
      echo "link check failed: $link" >&2
      exit 1
    fi
  done
}

case "${1:-all}" in
  assets) verify_assets ;;
  readme) verify_readme ;;
  links) verify_links ;;
  all) verify_assets; verify_readme ;;
  *) echo "usage: $0 [assets|readme|links|all]" >&2; exit 2 ;;
esac
