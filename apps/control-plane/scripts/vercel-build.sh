#!/usr/bin/env bash
set -euo pipefail

bunx farm build
bunx farm auth migrate
