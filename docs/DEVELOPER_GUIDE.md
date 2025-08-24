# Developer Guide

이 문서는 개발자 온보딩과 로컬 개발에 필요한 기본 지침을 제공합니다.

핵심 명령

- 의존성 설치: `npm install`
- 재현 가능한 설치(CI와 동일): `npm ci`
- 개발 서버: `npm run dev`
- 프로덕션 빌드: `npm run build`
- 포맷: `npm run format`
- 린트: `npm run lint`
- 테스트: `npm run test -- --run`
- 취약점 조회: `npm run audit`
- 취약점 자동 수리(로컬 검토): `npm run audit:fix` 또는 `npm run audit:fix:force` (검토 후 사용)
- 간단 CI 재현(설치+빌드): `npm run ci:smoke`

권장 환경

- 권장 Node 버전: 20.x (프로젝트는 Vite 최신 버전 호환을 위해 Node 20을 권장합니다)
- nvm 사용을 권장: 루트에 `.nvmrc`가 포함되어 있습니다. 설치 후 `nvm use`로 권장 버전을 적용하세요.

nvm 사용 예시 (macOS + Homebrew)

```bash
brew install nvm
mkdir -p ~/.nvm
echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
echo 'source $(brew --prefix nvm)/nvm.sh' >> ~/.zshrc
source ~/.zshrc
nvm install
nvm use
```

gh CLI 사용 예시 (더 상세)

```bash
# 최근 실행 10개 보기
gh run list --repo <owner>/<repo> --limit 10

# 특정 실행 로그 보기
gh run view <run-id> --repo <owner>/<repo> --log

# 웹에서 보기
gh run view <run-id> --repo <owner>/<repo> --web

# preview artifact 다운로드
gh run download <run-id> --repo <owner>/<repo> --name preview-dist
```

테스트 추가

- 테스트 파일 위치: `test/*.test.jsx` 또는 `test/*.spec.jsx`
- 테스트는 `vitest`와 `@testing-library/react`를 사용합니다. DOM 테스트는 jsdom 환경을 사용합니다.

커밋 훅

- Husky가 설치되어 있으며, pre-commit 훅에서 `lint-staged`를 통해 변경 파일에 대해 ESLint와 Prettier가 실행됩니다.

PR preview artifact

- Pull Request를 열면 GitHub Actions가 빌드 산출물을 `preview-dist`라는 아티팩트로 업로드합니다.
- 리뷰어는 Actions의 'Artifacts'에서 `preview-dist`를 다운로드해 로컬에서 `npx serve dist` 등으로 미리보기를 확인할 수 있습니다.

GitHub CLI (`gh`) 사용

- 개발자는 로컬에서 GitHub Actions 실행 상태를 빠르게 확인하려면 `gh` CLI를 설치해 사용하세요.
- 설치(macOS + Homebrew):

```bash
brew install gh
gh auth login
gh auth status
```

- 유용한 명령 예:

```bash
gh run list --repo <owner>/<repo> --limit 10
gh run view <run-id> --repo <owner>/<repo>
gh run view <run-id> --repo <owner>/<repo> --web
gh run download <run-id> --repo <owner>/<repo> --name preview-dist
```

CI 포맷·린트 정책 (중요)

- 워크플로 동작 요약:
  - `push` (main에 대한 푸시): 전체 포맷 검사, 린트 검사, 빌드 및 배포(해당 워크플로우가 활성화된 경우)를 실행합니다.
  - `pull_request` (same-repo PR): CI는 자동으로 Prettier 및 ESLint --fix를 시도하고, 변경 사항이 있으면 해당 PR 브랜치에 커밋을 시도합니다(브랜치 보호나 포크 PR의 경우 푸시가 불가능하면 안내 메시지를 남깁니다).
  - `pull_request` (fork PR): 포맷/린트 검사를 실행하지만, 자동 푸시가 불가능하므로 실패로 차단하지 않고 안내 메시지를 표시합니다. 외부 기여자는 로컬에서 `npm run format` 및 `npm run lint`를 실행해 수정한 뒤 다시 PR을 업데이트해야 합니다.

- 권장 작업 흐름:
  1.  로컬에서 작업 브랜치를 만들고 개발합니다.
  2.  커밋 전에 `npm run format`과 `npm run lint`를 실행하거나 Husky pre-commit 훅이 자동 실행되도록 합니다.
  3.  같은 저장소에 PR을 여는 경우 CI가 자동으로 포맷/린트를 커밋할 수 있으므로 변경을 수락할 수 있습니다. 포크 PR인 경우에는 로컬에서 포맷/린트를 실행해 주세요.

- 문제 해결 팁:
  - CI가 자동 커밋을 시도했지만 푸시가 실패하면(포크 또는 보호된 브랜치) CI 로그에 실패 원인이 기록됩니다. 이 경우 안내에 따라 로컬에서 포맷을 적용하고 PR을 업데이트하세요.
  - 포맷/린트 규칙을 변경하려면 `.eslintrc.json`, `.prettierrc`, 또는 `.editorconfig`를 업데이트하고 팀과 합의 후 커밋하세요.

## CI auto-fix behavior (summary)

- For pull requests opened from branches within this repository, CI will attempt to run Prettier and ESLint with `--fix` and commit any changes back to the source branch. If the branch is protected or the workflow lacks permissions, the push will fail and CI will add a helpful message to the run logs explaining the action required (typically: run `npm run format` and `npm run lint` locally, then push the fixes).

- For pull requests opened from forks, CI runs format and lint checks but will not attempt to push changes back to the fork. Fork contributors should run `npm run format` and `npm run lint` locally and push the updates or open a branch on this repo so CI can commit fixes.

- CI logs will contain details when auto-fix attempts occur; reviewers can check the "Actions" tab for the PR to see any auto-commit changes.
