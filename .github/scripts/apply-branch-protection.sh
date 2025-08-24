#!/usr/bin/env bash
set -euo pipefail

# Usage: ./apply-branch-protection.sh <owner/repo> <branch>
# Example: ./apply-branch-protection.sh pargame/VisualCode main
# Requires: gh CLI authenticated and the running user must have admin rights on the repo.

REPO=${1:-}
BRANCH=${2:-main}

if [ -z "$REPO" ]; then
  echo "Usage: $0 <owner/repo> [branch]
Example: $0 pargame/VisualCode main"
  exit 1
fi

echo "Applying recommended branch protection to $REPO:$BRANCH"

gh api --method PUT "/repos/$REPO/branches/$BRANCH/protection" -F 'required_status_checks.strict=true' \
  -F 'required_status_checks.contexts[]=CI' \
  -F 'required_status_checks.contexts[]=lint' \
  -F 'required_pull_request_reviews.dismiss_stale_reviews=true' \
  -F 'required_pull_request_reviews.required_approving_review_count=1' \
  -F 'enforce_admins=true' \
  -F 'restrictions.users=' \
  -F 'restrictions.teams='

echo "Branch protection applied (check repository settings to verify)."
