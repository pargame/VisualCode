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

권장 환경

- 권장 Node 버전: 20.x (프로젝트는 Vite 최신 버전 호환을 위해 Node 20을 권장합니다)
- nvm 사용을 권장: 루트에 `.nvmrc`가 포함되어 있습니다. 설치 후 `nvm use`로 권장 버전을 적용하세요.

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
