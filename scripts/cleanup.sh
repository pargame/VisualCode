#!/usr/bin/env bash
set -euo pipefail

# scripts/cleanup.sh
# 백업 디렉터리로 재생성 가능한 산출물을 이동하고 git에 커밋할 수 있는 간단 스크립트

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

ts=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="docs/archive/cleanup-backup-$ts"
mkdir -p "$BACKUP_DIR"

echo "Backup dir: $BACKUP_DIR"

# Move candidates
[ -d dist ] && mv dist "$BACKUP_DIR/" && echo "moved dist -> $BACKUP_DIR/" || true
[ -d archive/artifacts ] && mv archive/artifacts "$BACKUP_DIR/" && echo "moved archive/artifacts -> $BACKUP_DIR/" || true

# Move common artifact files
shopt -s nullglob
for f in *.zip *.sha256 audit_report*.json; do
  if [ -e "$f" ]; then
    mkdir -p "$BACKUP_DIR/files"
    mv "$f" "$BACKUP_DIR/files/"
    echo "moved $f -> $BACKUP_DIR/files/"
  fi
done
shopt -u nullglob

# Remove macOS system files
find . -name '.DS_Store' -maxdepth 6 -print -exec rm -f {} + || true

# Stage and commit
git add -A
if git diff --cached --quiet; then
  echo "No changes to commit"
else
  git commit -m "chore: cleanup and backup generated artifacts"
  echo "Committed cleanup changes"
fi

echo "Done. Backup stored in $BACKUP_DIR" 
