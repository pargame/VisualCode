## Operational checklist (minimal, 1-person / Vibecoding)

Follow these quick checks before pushing to `main`. They keep the CI/CD flow simple and reliable without introducing extra infra.

- Secrets (required):
  - `GITHUB_TOKEN` (provided automatically in Actions)
  - Optional: `DEPLOY_ISSUE_TOKEN` (PAT) only if you need cross-repo issue creation or elevated scopes.
  - Optional for AI features: `OPENAI_API_KEY` or equivalent; store in repo `Settings → Secrets` and rotate if exposed.

- Branch protection (recommended):
  - Require status checks: set `ci` / `build` / `smoke-check` to pass before merging to `main`.
  - Require at least 1 approving review for PRs (even for trivial changes) to prevent accidental auto-merge.

- Local quick-run (sanity):
  - Start dev: `npm run dev` and visit the URL from Vite (e.g. `http://localhost:5173/VisualCode/`).
  - Production preview: `npm ci && npm run build && npm run preview`.

- Emergency rollback (fast):
  - If Pages shows stale or broken content, use the helper script: `sh ./scripts/deploy-gh-pages.sh` after building locally.
  - If gh-pages itself needs rollback: `git fetch origin gh-pages-backup && git push --force origin origin/gh-pages-backup:gh-pages` (use with care).

- CI sanity checks (inspect quickly in Actions):
  - Build logs: ensure `npm run build` ran and `dist/` was detected.
  - Smoke check: confirm `smoke-check` job returned HTTP 200 for root and assets.

These steps are intentionally minimal — they keep you safe without adding automation complexity. If you want, I can auto-generate a `docs/DEVELOPMENT.md` with the same checklist in a compact form.

# Deployment (GitHub Pages)

이 문서는 GitHub Actions를 사용해 `main` 브랜치에서 자동으로 Pages에 배포하는 과정을 설명합니다.

## Quick Token Guide (요약)

- 기본 동작: 워크플로우는 `GITHUB_TOKEN`을 사용하여 레포지토리 내 작업(빌드 업로드, gh-pages 푸시, 이슈 생성 등)을 수행합니다.
- 권장 안내: 대부분의 배포/자동화 작업은 `GITHUB_TOKEN`으로 충분합니다. 교차-레포지토리 이슈 생성이나 추가 권한이 정말로 필요한 경우에만 PAT(예: `DEPLOY_ISSUE_TOKEN`) 사용을 고려하세요. PAT이 필요하면 저장소 `Settings → Secrets`에 안전하게 추가하고 사용 전에 담당자 승인을 받으세요.
- (선택) PAT 안전 사용: `secrets.*`를 워크플로 표현식의 `if:`에서 직접 참조하지 말고, `run:` 셸 스텝에서 선택하여 `GITHUB_OUTPUT`에 `token=` 형태로 내보낸 뒤 다른 스텝에서 `steps.<id>.outputs.token`을 참조하는 패턴을 사용하면 런타임 컨텍스트 경고를 피할 수 있습니다. 아래 문서에 예시가 있습니다.

## 워크플로우 개요

- 파일: `.github/workflows/deploy-pages.yml`
- 트리거: `push` 이벤트의 `main` 브랜치
- 주요 단계 요약:
  1. 체크아웃 (`actions/checkout@v4`)
  2. Node 설치 및 npm 캐시 (`actions/setup-node@v4` + `cache: 'npm'`)
  3. 의존성 설치 (lockfile이 있으면 `npm ci` 사용)
  4. 빌드 (`npm run build`)
  5. 빌드 결과 압축 및 artifact로 업로드
  6. `actions/deploy-pages@v4`로 Pages에 배포

## 캐시 최적화

- 현재 설정은 `setup-node`의 내장 npm 캐시를 사용합니다. 이는 의존성 복원 속도를 개선합니다.
- 추가로 검토 가능한 항목:
  - Vite/esbuild 빌드 캐시 디렉터리 (생성 시) 캐싱 고려
  - CI 병렬화 (테스트가 추가될 경우)

## 배포 경로

- Vite 기본 빌드 출력: `dist/` (현재 워크플로가 자동으로 `dist`를 감지하여 배포합니다)
- 대체: 일부 프로젝트는 `build/` 또는 정적 파일만 있는 경우 `public/`을 사용합니다. 워크플로는 `build` > `dist` > `public` 순으로 존재 여부를 검사합니다.

## 배포 확인

1. GitHub Actions에서 `deploy-pages` 워크플로가 성공적으로 완료되었는지 확인합니다. 로그에 "Completed deployment successfully"가 나오면 `gh-pages` 브랜치에 빌드 결과가 푸시됩니다.
2. 스모크 체크: 워크플로의 `smoke-check` 단계가 사이트에 HTTP 200을 반환하고, 페이지 HTML에 `<div id="root">` (React 앱 진입점) 같은 예상 마커가 있는지 확인합니다.
3. 로컬에서 빠른 확인: 브라우저로 https://<your-github-user>.github.io/<repo-name>/ 에 접속해 UI가 정상 렌더링되는지 확인합니다.

## 릴리스 자산 업로드 및 검증 (간단한 가이드)

```bash
# 빌드
npm ci && npm run build
# 압축
zip -r /tmp/VisualCode-dist-v0.0.1-deps-20250824.zip dist/
# 릴리스에 업로드(덮어쓰기)
gh release upload v0.0.1-deps-20250824 /tmp/VisualCode-dist-v0.0.1-deps-20250824.zip --repo pargame/VisualCode --clobber
```

```bash
# 확인: 자산 목록 출력
gh release view v0.0.1-deps-20250824 --repo pargame/VisualCode --json assets -q '.assets[].name'
```

## 문제 해결 팁

- 워크플로가 실제로 `npm run build`를 실행했는지 확인합니다.
- 빌드 출력(`dist` 등)이 `.gitignore`나 다른 설정으로 인해 생성되지 않거나 삭제되지 않았는지 확인하세요.
- `actions/checkout` 단계의 `fetch-depth`가 낮아 일부 태그/브랜치를 못 가져오는 상황은 드물지만, 필요 시 `fetch-depth: 0`으로 변경해 보세요.

- `GITHUB_TOKEN`은 기본적으로 푸시 권한을 가집니다(리포지터리 설정에 따라 제한될 수 있음). 워크플로에 `permissions: contents: write`가 설정되어 있는지 확인하세요.

- 커스텀 도메인을 사용하는 경우 DNS와 `CNAME` 파일 유무를 확인하세요.

## 참고: 리포지터리 히스토리 재작성

2025-08-24: 보안상 이유로 리포지터리 히스토리를 재작성하여 민감 파일(`.env`, `.idea`, `audit.json`, `audit_total.txt`, `build.log`)을 제거했습니다. 배포 파이프라인이나 액션이 내부적으로 민감값을 참조하지 않는지 확인하세요. 필요 시 관련 시크릿을 교체하거나 워크플로우 권한을 재검토하십시오.

### Note: deploy job builds before publishing

Note: We adjusted the workflow to run the build earlier in the `build` job so the `publish_dir` is determined after `npm run build` completes. This ensures `dist/` is detected and avoids attempts to deploy a non-existent `public/` directory.

## Hardening & Best-practices (avoid future failures)

- Avoid here-docs in workflow `run:` blocks. YAML/runner quoting differences can make `<<'HTML'` fragile. Use `printf` or `cat > file <<'EOF'` with care. Example safe pattern used in this repo:

```bash
mkdir -p public
printf "%b" "<!doctype html>\n<html>\n  <head>\n    <meta charset=\"utf-8\">\n    <meta name=\"viewport\" content=\"width=device-width,initial-scale=1\">\n    <title>Empty GitHub Pages site</title>\n  </head>\n  <body>\n    <h1>This site was deployed from GitHub Actions</h1>\n    <p>No build artifact was found; the workflow generated this placeholder page.</p>\n  </body>\n</html>" > public/index.html
```

- Determine `publish_dir` after running the build. Prefer the order: `dist` → `build` → `public`. If you rely on a fallback placeholder, ensure the placeholder uses `printf` to avoid here-doc parsing errors.

- Token/permission guidance:
  - Keep `permissions` minimal but sufficient: at least `contents: write`, `pages: write` for deploy flows.
  - Automated issue creation or cross-repo pushes may require elevated permissions; if `actions-ecosystem/action-create-issue@v1` fails with `Resource not accessible by integration`, consider providing a repository-scoped PAT in secrets and using that for the action.

  Note on optional PAT handling:
  - In this repository the deploy workflow was recently simplified to use the repository-scoped `GITHUB_TOKEN` for automated issue creation to avoid YAML/liner context errors that can arise when conditionally referencing optional secrets inside workflow expressions or `run:` blocks.
  - The example below demonstrates a safe pattern for edge cases where a PAT is required; for typical repository-scoped deploys this is unnecessary.
  - If you prefer to use an explicit PAT (`DEPLOY_ISSUE_TOKEN`) for issue creation (recommended when you need elevated scopes or cross-repo access), re-enable it safely by adding a short preparatory step that selects the token into a step output or env var (do not use `secrets.*` directly inside `if:` expressions). Example safe pattern:

```yaml
- name: Pick issue token
  id: pick_token
  env:
    DEPLOY_ISSUE_TOKEN: ${{ secrets.DEPLOY_ISSUE_TOKEN }}
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
  run: |
    if [ -n "$DEPLOY_ISSUE_TOKEN" ]; then
      echo "token=$DEPLOY_ISSUE_TOKEN" >> $GITHUB_OUTPUT
    else
      echo "token=$GITHUB_TOKEN" >> $GITHUB_OUTPUT
    fi

- name: Create issue on deploy failure
  if: failure()
  uses: actions-ecosystem/action-create-issue@v1
  with:
    github_token: ${{ steps.pick_token.outputs.token }}
    title: 'Deploy to Pages failed for commit ${{ github.sha }}'
```

- This pattern avoids linter warnings about invalid context access and keeps the workflow clear about which token is used at runtime.

- Rollback and safe-deploy patterns:
  - Keep a `gh-pages-backup` branch that mirrors the previous production state; on smoke failure, trigger a rollback job that force-pushes the backup to `gh-pages`.
  - Alternatively, make the deploy step update `gh-pages` only when artifacts differ (checksum-based guard). Example pseudo-step:

```bash
# compute checksum of build output
NEW_SUM=$(find dist -type f -exec sha256sum {} \; | sort | sha256sum)
OLD_SUM=$(git ls-tree -r origin/gh-pages --name-only | xargs -I{} sh -c 'git show origin/gh-pages:{} 2>/dev/null | sha256sum' | sort | sha256sum || echo "")
if [ "$NEW_SUM" = "$OLD_SUM" ]; then
  echo "No changes in build output; skipping deploy"
  exit 0
fi
```

- Observability: Log `ls -la` of the deploy folder in a debug run, and expose small build metadata (build time, hash of main asset) as part of the workflow logs to aid troubleshooting.

## Quick fix: force-push local `dist/` to `gh-pages`

If GitHub Pages is still serving an older bundle even after a successful workflow, you can force-push your local `dist/` to the `gh-pages` branch as a last-resort recovery. This repo includes a helper script at `scripts/deploy-gh-pages.sh` that does a safe, repeatable force-push from a temporary directory.

Usage (local machine with push rights):

```bash
# build first
npm ci && npm run build
# run the deploy helper (it will create a temp repo and force-push gh-pages)
sh ./scripts/deploy-gh-pages.sh
```

## Recent agent-driven deploy script changes (2025-08-26)

- The helper `scripts/deploy-gh-pages.sh` was updated to improve Pages reliability:
  - create a `.nojekyll` marker at site root to avoid Jekyll filtering
  - copy built `assets/` to the site root so `/assets/...` is available in addition to `/VisualCode/assets/...`
  - rewrite generated `index.html` asset paths to prefer `/assets/...` and provide a raw.githubusercontent fallback for edge cases

These changes were applied as part of an emergency redeploy attempt; if Pages still returns 404 for nested assets, check the repository's Pages settings and the Pages cache/edge propagation.

What the script does:

- copies `dist/` into a temporary directory
- creates a minimal git repo and commits files with neutral author metadata
- force-pushes the `gh-pages` branch to the repository remote

Notes and safety

- This overwrites the remote `gh-pages` branch. Use only when you're certain the built assets are the desired production bundle.
- Prefer to fix the CI workflow instead of regularly using this helper. The helper is intended for emergency recovery or when debugging Pages behaviour.

## Notes on service worker handling in CI

To mitigate cases where Pages is serving stale HTML because an older service worker remains registered on clients, the CI workflow will expose a root-level `sw.js` during deploy:

- If your build output (`dist/`, `build/`, or `public/`) already contains a `sw.js`, it will be copied to the site root and also mirrored into `site/<repo>/sw.js`.
- If no `sw.js` exists in the build output, the deploy job will create a tiny no-op `site/sw.js` stub. This ensures `https://<owner>.github.io/sw.js` returns 200 so client-side unregister() logic can run and clear older caches.

This behavior is intended as a safety measure to help clients recover from stale cached assets. If your app intentionally relies on a custom service worker, ensure the build includes the proper `sw.js` and that the worker's lifecycle code cooperates with the CI's replacement behavior.

## Alignment with `TODO.md` development directions

Summary of how the repository and CI align with the goals listed in `TODO.md`:

- "유지 보수 추구 / docs 최신화": CI now documents the `sw.js` fallback behavior above. Keep docs and workflows in sync when changing deploy steps.
- "표준적인 개발 지향": workflows use `actions/checkout`, `setup-node`, and checksum guards before deploy; these are consistent with standard CI practices.
- "AI 전권 위임 / 자동화": The repo includes helper scripts (`scripts/deploy-gh-pages.sh`) and CI steps that nudge Pages (refresh commits). Full automated PR approval or remote pushes by an agent are not performed automatically by this document; consider adding a guarded automation step with explicit approvals if desired.
- "깃허브 액션으로 깃허브 페이지 배포": Deploy workflow (`.github/workflows/deploy-pages.yml`) performs the build, normalizes site structure, and deploys to `gh-pages`.
- "미리보기 로컬 서버": Use `npm run preview` (Vite) or `npx serve dist` locally for rapid checks before CI deploys.

If you want, I can also add a short `docs/DEVELOPMENT.md` that expands these points into a small checklist for day-to-day development (local preview, build, emergency force-push, and how to safely test service worker changes).

## 백업(미러) 브랜치 정책 및 자동화

프로젝트의 중요한 상태(특히 `main`)를 별도의 브랜치에 정기적으로 복사(미러)해 두면, 실수로 main이 손상되거나 히스토리가 재작성된 경우 빠르게 복원할 수 있습니다. 권장 설정:

- Push 트리거: `main`에 푸시될 때마다 자동으로 `main-backup`으로 동기화
- 스케줄: 주 1회(또는 일 1회) 정기 백업을 추가로 실행해 안전망 확보

### 복원 방법(간단)

1. 로컬에서 복원할 경우:

```bash
# main-backup를 로컬에 가져와서 main으로 강제 덮어쓰기
git fetch origin main-backup
git checkout main
git reset --hard origin/main-backup
git push --force origin main
```

2. 브랜치 보호가 걸려 있는 경우에는 보호 설정에 맞춰 PR(권장)로 복원하세요.

### 자동화 워크플로 위치

## 권장: 브랜치 보호 및 권한

## 로컬 디버깅(간단한 단계)

1. 로컬에서 빌드 확인: `npm ci && npm run build` — `dist/`가 생성되는지 확인
2. 로컬 서버 테스트: `npm run preview`(Vite의 경우)로 production 빌드 동작을 확인

원하시면 제가 바로 `.github/workflows/mirror-main.yml` 파일을 생성하고, `main-backup` 브랜치 자동 생성/동기화를 설정하겠습니다. 또한 문서에 포함된 예시 복원 명령과 워크플로 설명을 더 다듬어 테스트 시나리오를 추가할 수 있습니다.
