#!/usr/bin/env bash
# Blocks legacy Medusa/BFF imports in storefront source.
# Informational warnings for Algolia and Zustand (Phase 1/2 carry-forward gates).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SEARCH_ROOT="${1:-src}"

cd "$PROJECT_ROOT"

if [[ ! -d "$SEARCH_ROOT" ]]; then
  echo "ERROR: search root not found: $SEARCH_ROOT" >&2
  exit 1
fi

GLOB_ARGS=(-g '*.ts' -g '*.tsx' -g '*.js' -g '*.jsx' -g '*.mjs')

search() {
  if command -v rg >/dev/null 2>&1; then
    rg -n "$@" "${GLOB_ARGS[@]}" "$SEARCH_ROOT" 2>/dev/null || true
  else
    local pattern="$1"
    shift
    grep -rniE "$pattern" "$SEARCH_ROOT" \
      --include='*.ts' --include='*.tsx' --include='*.js' --include='*.jsx' --include='*.mjs' \
      "$@" 2>/dev/null || true
  fi
}

FAILED=0
WARN=0

report_error() {
  local label="$1"
  local pattern="$2"
  local matches

  matches="$(search "$pattern")"
  if [[ -n "$matches" ]]; then
    echo "ERROR: $label" >&2
    echo "$matches" >&2
    FAILED=1
  fi
}

report_warn() {
  local label="$1"
  local pattern="$2"
  local matches

  matches="$(search "$pattern")"
  if [[ -n "$matches" ]]; then
    echo "WARN: $label" >&2
    echo "$matches" >&2
    WARN=1
  fi
}

run_self_test() {
  local tmp_dir
  tmp_dir="$(mktemp -d "${TMPDIR:-/tmp}/forbidden-imports-selftest.XXXXXX")"
  local violation_file="$tmp_dir/ViolationProbe.tsx"

  cat > "$violation_file" <<'PROBE'
import { product } from '@/lib/data/products';
import medusa from '@medusajs/medusa-js';
PROBE

  if SEARCH_ROOT="$tmp_dir" bash "$SCRIPT_DIR/check-forbidden-imports.sh" >/dev/null 2>&1; then
    echo "ERROR: self-test expected non-zero exit for injected violations" >&2
    rm -rf "$tmp_dir"
    exit 1
  fi

  rm -rf "$tmp_dir"
  echo "Self-test passed: violations detected as expected."
}

if [[ "${CHECK_FORBIDDEN_SELF_TEST:-}" == "1" ]]; then
  run_self_test
  exit 0
fi

# Blocking — Medusa SDK and legacy BFF data layer
report_error 'Medusa SDK import (@medusajs)' '@medusajs'
report_error 'Legacy BFF path (src/lib/data/)' 'src/lib/data/'
report_error 'Legacy BFF import (lib/data/)' "from ['\"].*lib/data"
report_error 'Medusa package import' "from ['\"][^'\"]*medusa"
report_error 'Medusa require()' "require\\(['\"][^'\"]*medusa"

# Informational — Phase 1/2 carry-forward gates
report_warn 'Algolia import' "from ['\"][^'\"]*algolia|require\\(['\"][^'\"]*algolia"
report_warn 'Zustand import' "from ['\"][^'\"]*zustand|require\\(['\"][^'\"]*zustand"

if [[ "$FAILED" -ne 0 ]]; then
  echo "Forbidden import check failed." >&2
  exit 1
fi

if [[ "$WARN" -ne 0 ]]; then
  echo "Forbidden import check passed with informational warnings." >&2
else
  echo "Forbidden import check passed."
fi

exit 0
