#!/usr/bin/env bash
set -euo pipefail

# Usage: TAG=v0.0.1 ./scripts/verify-release-asset.sh
TAG=${TAG:-}
REPO=${REPO:-pargame/VisualCode}

if [ -z "$TAG" ]; then
  echo "Usage: TAG=vX.Y.Z $0"
  exit 2
fi

echo "Verifying release assets for $REPO@$TAG"

ZIP_NAME="VisualCode-dist-${TAG}.zip"
SHA_NAME="VisualCode-dist-${TAG}.sha256"

# download assets
TMPDIR=$(mktemp -d)
ZIP_PATH="$TMPDIR/$ZIP_NAME"
SHA_PATH="$TMPDIR/$SHA_NAME"

echo "Downloading $ZIP_NAME and $SHA_NAME from GitHub releases..."

gh release download "$TAG" --repo "$REPO" --pattern "$ZIP_NAME" --output "$TMPDIR" || (echo "Failed to download $ZIP_NAME" && exit 1)
gh release download "$TAG" --repo "$REPO" --pattern "$SHA_NAME" --output "$TMPDIR" || (echo "Failed to download $SHA_NAME" && exit 1)

if [ ! -f "$ZIP_PATH" ] || [ ! -f "$SHA_PATH" ]; then
  echo "Downloaded files not found"
  ls -la "$TMPDIR"
  exit 1
fi

# compute sha256 and compare
CALC_SHA=$(sha256sum "$ZIP_PATH" | awk '{print $1}')
EXPECTED_SHA=$(cat "$SHA_PATH" | tr -d '\n' | awk '{print $1}')

echo "Calculated: $CALC_SHA"
echo "Expected:   $EXPECTED_SHA"

if [ "$CALC_SHA" = "$EXPECTED_SHA" ]; then
  echo "OK: checksum matches"
  exit 0
else
  echo "FAIL: checksum mismatch"
  exit 3
fi
