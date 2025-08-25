#!/usr/bin/env bash
set -euo pipefail

# Simple helper to force-push local dist/ to the gh-pages branch.
# Use with caution: this overwrites remote gh-pages.

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DIST_DIR="$REPO_ROOT/dist"
TMP_DIR="$(mktemp -d -t visualcode-deploy-XXXXXXXX)"

if [ ! -d "$DIST_DIR" ]; then
  echo "dist/ not found — run: npm run build" >&2
  exit 1
fi

REPO_NAME="$(basename "$REPO_ROOT")"
echo "Preparing deploy from $DIST_DIR -> $TMP_DIR (repo subdir: $REPO_NAME)"
# Place build outputs under a repo-named subdirectory so absolute base paths like
# /$REPO_NAME/assets/... resolve correctly when served from GitHub Pages.
mkdir -p "$TMP_DIR/$REPO_NAME"
cp -R "$DIST_DIR"/* "$TMP_DIR/$REPO_NAME/"
# Also copy the index.html to the site root so the site root serves the app HTML
if [ -f "$TMP_DIR/$REPO_NAME/index.html" ]; then
  cp "$TMP_DIR/$REPO_NAME/index.html" "$TMP_DIR/index.html" || true
fi

# Prevent GitHub Pages (Jekyll) from filtering/ignoring files. Ensure the
# site is served verbatim by creating a .nojekyll marker in the site root.
touch "$TMP_DIR/.nojekyll"

cd "$TMP_DIR"
git init -q
git checkout -b gh-pages
git add -A
GIT_AUTHOR_NAME="automation" GIT_AUTHOR_EMAIL="ci@example.com" \
  GIT_COMMITTER_NAME="automation" GIT_COMMITTER_EMAIL="ci@example.com" \
  git commit -m "deploy: gh-pages from local build" -q || true

# determine remote
REMOTE_URL="$(git -C "$REPO_ROOT" remote get-url origin 2>/dev/null || true)"
if [ -z "$REMOTE_URL" ]; then
  echo "Unable to determine origin remote URL. Set origin in the parent repo." >&2
  exit 1
fi

echo "Pushing to $REMOTE_URL gh-pages (force)..."
git remote add origin "$REMOTE_URL"
git push -f origin gh-pages:gh-pages

echo "Deployed. Cleaning up."
cd - >/dev/null
rm -rf "$TMP_DIR"

echo "Done. Give GitHub Pages a moment to update (browsers may cache old HTML)."
