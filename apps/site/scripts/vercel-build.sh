#!/usr/bin/env bash
set -euo pipefail

if [ -n "${CONVEX_DEPLOY_KEY:-}" ]; then
  bunx convex deploy -y --cmd 'bunx farm build' --cmd-url-env-var-name VITE_CONVEX_URL
else
  bunx farm build
fi
