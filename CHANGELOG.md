# Changelog

All notable changes to this project will be documented in this file.

Format (Keep it short):

## [Unreleased]

- 2025-08-25: feat: Add "Delete all nodes" functionality with unit test (vitest).
- 2025-08-25: chore: UI cleanup — removed import/export/migrate/reset buttons; editor now shows node info and textarea only.
- 2025-08-25: fix: snap behavior changed to grid intersections only (rectangular GRID alignment).
- 2025-08-25: fix: safer index-latest handling in `src/main.jsx` — validate payload and reload with cache-buster instead of document.write.
- 2025-08-25: ci: validate `index-latest.html` in deploy workflow before publishing to avoid deploying truncated HTML.

- YYYY-MM-DD: Fix node placement when clicking while board is scrolled — click coordinates now include board scroll offsets so nodes snap to grid correctly.
- 2025-08-24: Upgrade dependencies to latest stable where safe (React 19, ESLint 9 flat config, Husky 9). See PR #11.
- - Release asset: VisualCode-dist-v0.0.1-deps-20250824.zip

Follow Keep a Changelog principles where practical.
