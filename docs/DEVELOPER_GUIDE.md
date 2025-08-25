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
- 빌드 산출물(`dist/`)을 로컬에서 빠르게 미리보기하려면: `npm run preview:dist` (기본 포트: 5000)

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

````bash
 # Developer Guide

이 문서는 개발자 온보딩과 로컬 개발에 필요한 기본 지침과, 실제로 로컬에서 직접 실행하면서 반드시 확인하고 수정해야 할 항목들을 정리합니다.

핵심 명령

- 의존성 설치: `npm install`
- 재현 가능한 설치(CI와 동일): `npm ci`
- 개발 서버: `npm run dev`
- 프로덕션 빌드: `npm run build`
- 포맷: `npm run format`
- 린트: `npm run lint`
- 테스트: `npm run test -- --run`
- 취약점 조회: `npm run audit`
- 취약점 자동 수리(로컬 검토): `npm run audit:fix` 또는 `npm run audit:fix:force`
- 간단 CI 재현(설치+빌드): `npm run ci:smoke`
- 빌드 산출물(`dist/`)을 로컬에서 빠르게 미리보기하려면: `npm run preview:dist` (기본 포트: 5000)

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
````

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

## 로컬에서 "직접 실행하면서" 반드시 확인·수정해야 할 항목들 (실행 가이드)

아래 항목들은 설정 파일로 이미 정의되어 있더라도, 실제로 실행하면서 직접 점검하고 필요하면 수정해야 할 사항들입니다. 새로 개발 환경을 맞추거나 배포 파이프라인을 디버그할 때 먼저 이 목록을 따라가세요.

- Node / npm 버전
  - `.nvmrc`의 버전을 적용하세요: `nvm install && nvm use`.
  - CI와 동일한 Node 버전을 사용하면 빌드 오류가 줄어듭니다.

- 의존성 설치(재현성)
  - CI 환경과 동일하게 `npm ci` 사용을 권장합니다. 로컬에서 새 패키지를 추가하면 `npm install`로 lockfile을 갱신한 뒤 커밋하세요.

- Husky 훅 설치 및 확인
  - 설치 후: `npm run prepare` (Husky 훅 설치).
  - 훅 작동 확인: `git add . && git commit -m "test hooks"` (테스트 후 `git reset --soft HEAD~1`로 롤백).

- 환경 변수(.env)
  - 민감 정보는 로컬 `.env`에 보관하고 저장소에는 `.env.example`만 둡니다.
  - Actions에서 필요한 시크릿(예: `GH_TOKEN`, `GH_PAGES_TOKEN`)은 GitHub 리포지토리 설정에 등록하세요.

- 빌드 출력 경로와 워크플로우 일치 여부
  - Vite 기본 출력은 `dist/`입니다. 워크플로우의 `publish_dir` 또는 배포 액션의 `publish_dir`이 `dist`와 일치하는지 확인하세요.

- `package.json` 주요 항목 점검
  - `scripts`에 `dev`, `build`, `preview:dist`, `ci:smoke` 등 필요한 스크립트가 있는지 확인.
  - GitHub Pages 경로 이슈가 있는 경우 `homepage` 필드(예: `/repo-name/`)를 설정해 보세요.

- 메모리/타임아웃 문제(빌드 실패 관련)
  - CI에서 OOM이 발생하면 Node 버전 변경, 의존성 줄이기, 또는 빌드 옵션(예: minify 비활성화)으로 테스트하세요.
  - Actions의 `runs-on`을 더 큰 인스턴스로 바꿔 확인해보는 방법도 있습니다.

- 로컬 미리보기(배포 전 스모크)
  - 빌드 후: `npm run preview:dist` 또는 `npx serve dist`로 확인.
  - SPA 라우팅(history API) 사용 시 404 처리 정책을 점검하세요.

- 테스트 및 스모크
  - 단위/통합: `npm run test -- --run` (Vitest)
  - 간단 CI 재현: `npm run ci:smoke`

- GitHub Actions 권한 및 토큰
  - 자동 푸시나 페이지 배포 실패 시 `GITHUB_TOKEN` 또는 개인 토큰의 권한(`contents:write`, `pages:write`)을 확인하세요.

- 로컬 디버깅 팁
  - 빌드 로그 저장: `npm run build 2>&1 | tee build.log`
  - 의존성 문제 조사: `npm ls <package>`
  - 캐시 문제 해결: `rm -rf node_modules && npm ci` 및 `npm cache clean --force`

## 간단 체크리스트(로컬 실행 시)

1. `nvm install && nvm use`
2. `npm ci`
3. `npm run prepare` (Husky)
4. `npm run lint` 및 `npm run format` (필요 시 `--fix`)
5. `npm run build` → `npm run preview:dist`
6. `npm run test -- --run`

위 사항을 따르고도 반복 에러가 있으면, `build.log`와 `npm ci` 로그를 첨부해 알려주세요.

---

## 리포지토리 정리 제안 및 자동 삭제 항목

아래 파일/폴더는 빌드 산출물 또는 감사 보고서처럼 재생성 가능하므로 보통 소스 저장소에는 보관할 필요가 없습니다. 아래 항목들을 안전하게 삭제하고 커밋하겠습니다(삭제 전에 목록을 보여드립니다).

- `audit_report.json`, `audit_report_after.json`, `audit_report_after2.json` (감사 리포트)
- `artifacts/` (릴리스 아카이브 및 sha256)
- 기타 대용량 생성물(`dist/`, `.DS_Store`)이 존재하면 제거 권장

원하시면 이 삭제 동작은 취소 가능하도록 먼저 백업 디렉터리(`docs/archive/cleanup-backup-<timestamp>/`)로 이동한 뒤 커밋하도록 변경할 수 있습니다. 기본 동작은 원하시면 "삭제 및 커밋"을 바로 실행하겠습니다.

---

문서 업데이트 완료: 이 파일에 실행 가이드를 추가했습니다. 추가로 원하시면 예제 명령 블록을 늘리거나 `scripts/cleanup.sh`와 `Makefile`을 생성해 드리겠습니다.
