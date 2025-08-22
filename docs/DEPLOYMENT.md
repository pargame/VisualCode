# Deployment (GitHub Pages)

이 문서는 GitHub Actions를 사용해 `main` 브랜치에서 자동으로 Pages에 배포하는 과정을 설명합니다.

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
- 워크플로우는 `dist/`, `build/`, 또는 `public/` 중 존재하는 첫 디렉터리를 찾아 게시합니다.

## 배포 확인
- 성공적인 실행 후 GitHub Actions 실행 페이지에서 URL을 확인합니다.
- 일반적인 Pages URL: `https://<github-username>.github.io/<repo-name>`

## 문제 해결 팁
- 빌드 실패 시 워크플로 로그를 확인해 `npm ci`/`npm run build` 단계에서 발생한 에러를 찾으세요.
- 캐시가 원인으로 의심되면 Actions에서 캐시 키를 변경(예: `hashFiles('**/package-lock.json')`)하거나 캐시를 무시하고 재실행하세요.
