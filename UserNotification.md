# VisualCode 프로젝트 소개 (초보 개발자용)

이 문서는 VisualCode 리포지터리를 처음 접하는 초보 개발자를 위해 작성되었습니다. 로컬에서 개발을 시작하는 방법, 빌드와 배포 방식, 코드 구조, 주의할 점 등을 자세히 설명합니다.

## 프로젝트 개요
- 기술 스택: Vite + React
- 목적: 간단한 SPA(단일 페이지 애플리케이션) 예제 및 GitHub Pages로의 자동 배포 설정 демонстрация
- 배포 방식: GitHub Actions를 사용해 `main` 브랜치에서 빌드 후 GitHub Pages에 배포합니다.

## 주요 파일/디렉터리 설명
- `index.html` — Vite의 엔트리 HTML 파일입니다. `#root` 요소가 React 앱의 마운트 포인트입니다.
- `vite.config.js` — Vite 설정 파일입니다. `base`가 `/VisualCode/`로 설정되어 있어 GitHub Pages 서브경로에 맞춰 빌드합니다.
- `package.json` — 의존성과 스크립트가 정의되어 있습니다.
  - `npm run dev` — 로컬 개발 서버 시작
  - `npm run build` — 프로덕션 빌드 생성 (결과는 `dist/` 등)
  - `npm run preview` — 빌드 결과 미리보기
- `src/` — React 소스 코드
  - `src/main.jsx` — 애플리케이션 진입점 (React 루트 마운트)
  - `src/App.jsx` — 간단한 UI 컴포넌트
  - `src/styles.css` — 기본 스타일
- `docs/` — 운영·배포·보안 문서 모음 (`DEPLOYMENT.md`, `ENVIRONMENT.md`, 등)
- `.github/workflows/deploy-pages.yml` — (문서화된) GitHub Actions 워크플로우(원격에 적용되어 있을 수 있음)

## 로컬 개발 환경 설정
1. Node.js 설치
   - 권장: Node.js 18 또는 24 (LTS 버전 사용 권장).
2. 레포 클론
   ```bash
   git clone https://github.com/pargame/VisualCode.git
   cd VisualCode
   ```
3. 의존성 설치
   ```bash
   npm ci
   ```
4. 개발 서버 실행
   ```bash
   npm run dev
   ```
   - 브라우저에서 `http://localhost:5173` (또는 콘솔에 표시된 포트)로 접속합니다.

## 빌드 및 배포
- 빌드
  ```bash
  npm run build
  ```
  - 빌드 출력은 일반적으로 `dist/` 폴더에 생성됩니다.
- 배포
  - 이 리포지터리는 GitHub Actions를 통해 `main` 브랜치에 푸시될 때 자동으로 빌드 후 GitHub Pages에 배포됩니다. 배포 설정은 `.github/workflows/deploy-pages.yml`과 관련된 `pages` 권한(예: `contents: write`, `pages: write`, `id-token: write`)을 요구합니다.

## 배포 검증(스모크 체크)
- 배포 후 간단한 검증:
  - 사이트가 HTTP 200을 반환하는지 확인
  - `index.html`에 `<div id="root">` 존재 여부 확인
  - 빌드된 자산(js/css)이 200을 반환하는지 확인

예시 스크립트(간단):
```bash
URL="https://pargame.github.io/VisualCode/"
HTTP_CODE=$(curl -fsS -o /dev/null -w "%{http_code}" "$URL")
if [ "$HTTP_CODE" -ne 200 ]; then
  echo "Site did not return 200: $HTTP_CODE"
  exit 1
fi
curl -fsS "$URL" | grep -q '<div id="root"' || (echo 'Root div not found' && exit 1)
echo "Smoke checks passed"
```

## 협업 및 주의사항
- 히스토리 재작성: 최근에 민감 파일들(audit.json, audit_total.txt, build.log, .env, .idea 등)을 히스토리에서 제거하기 위해 리포지터리 히스토리를 재작성하고 강제 푸시한 기록이 있습니다. 이로 인해 협업자가 로컬에 오래된 히스토리를 가지고 있다면 충돌이 발생할 수 있으니 팀원에게 알리고 로컬을 재동기화하도록 안내하세요.
- 로컬 노트 파일(`UserFile.md`) 등 개인 파일은 `.gitignore`에 추가되어 추적되지 않도록 설정했습니다.
- 보안: 시크릿(Secrets)은 GitHub 리포지터리의 `Settings > Secrets and variables > Actions`에서 관리합니다. 키 교체가 필요하면 즉시 갱신하세요.

## 문제 해결(간단 체크리스트)
- 빌드 실패
  - `npm ci`가 성공했는지 확인
  - `npm run build` 출력 로그에서 에러 메시지 확인
- 배포 실패
  - GitHub Actions 로그 확인
  - `pages` 권한과 `GITHUB_TOKEN` 사용 권한 확인
- 캐시 관련 문제
  - Actions에서 캐시 키(hashFiles('**/package-lock.json'))를 변경하거나 캐시를 무시하고 재실행

## 추가 자료 및 도움이 필요하면
- 운영 관련 문서: `docs/DEPLOYMENT.md`, `docs/CI_SMOKE.md`, `docs/ENVIRONMENT.md`, `docs/SECURITY.md`
- 더 자세한 도움을 원하면 제가 로컬 빌드 실행, 워크플로우 파일 점검, 또는 Actions 로그 분석(출력 제공 필요)을 도와드릴 수 있습니다.

---

이 문서를 원하시면 리포지터리에 커밋하고 푸시하겠습니다.
