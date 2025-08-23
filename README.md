# VisualCode

이 저장소 이름은 `VisualCode`일 뿐이며, 특정 제품을 지칭하지 않습니다.
실제 목적은 React + GitHub Pages를 사용해 웹 페이지를 만들기 위한 기반(boilerplate)을 제공하는 것입니다. 이 리포지터리는 Vite 기반 개발 환경, GitHub Actions를 이용한 빌드·배포 파이프라인, 그리고 보안·운영 관련 문서화를 포함합니다.

## 한눈에 보기
- 기술 스택: Vite, React
- 목표: 빠른 로컬 개발, 재현 가능한 프로덕션 빌드, GitHub Pages로의 자동 배포
- 포함된 항목: Vite 설정(`vite.config.js`), 간단한 React 앱(`src/`), CI 워크플로우 문서(`.github/workflows/deploy-pages.yml` 문서화), 운영 문서(`docs/`)

## 빠른 시작 (로컬)
1. 리포지터리 클론

```bash
git clone https://github.com/pargame/VisualCode.git
cd VisualCode
```

2. 의존성 설치 (재현 가능한 설치 권장)

```bash
npm ci
```

3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173`(또는 콘솔에 표시된 포트)를 열어 앱을 확인하세요.

4. 프로덕션 빌드

```bash
npm run build
```

빌드 결과는 일반적으로 `dist/` 폴더에 생성됩니다.

## 배포 및 CI
- 워크플로우 파일: `.github/workflows/deploy-pages.yml` (문서화되어 있음)
- 설치: 워크플로우는 `package-lock.json`이 있을 경우 `npm ci`를 사용하도록 권장합니다.
- 캐싱: `actions/setup-node@v4`의 npm 캐시 기능을 사용해 의존성 복원 속도를 개선합니다.
- 빌드: `npm run build`를 실행하고, 빌드 산출물을 아티팩트로 업로드한 뒤 `actions/deploy-pages@v4`(또는 `upload-pages-artifact@v2` + `deploy-pages`)로 GitHub Pages에 배포합니다.
- 권한: Pages 배포에 필요한 최소 권한(`contents: write`, `pages: write`, `id-token: write`)을 문서화했습니다.

## 배포 검증 (스모크 체크)
배포 완료 후 자동 또는 수동으로 다음을 검증하세요:
- 사이트가 HTTP 200을 반환하는지
- `index.html`에 `<div id="root">`가 존재하는지
- 주요 자산(js/css)이 200을 반환하는지

예시 스모크 체크 스크립트:

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

## 표준 아키텍처 (정의)
이 프로젝트는 경량 SPA를 대상으로 한 표준 아키텍처를 따릅니다. 목적은 개발 편의성과 배포 안전성을 동시에 확보하는 것입니다.

- 목표: 소스 코드는 간결하게, 빌드는 재현 가능하게, 배포는 자동화·검증 가능한 방식으로 운영
- 구성 요소:
	- 빌드 도구: Vite
	- UI: React
	- CI/CD: GitHub Actions
	- 호스팅: GitHub Pages
	- 재현성: `package-lock.json` + `npm ci`
	- 보안: Secrets는 GitHub Actions Secrets로 관리, 민감 파일은 히스토리에서 제거
	- 검증: 스모크 체크(HTTP/DOM/asset)

## 이 리포지터리에 적용된 작업 (체크리스트)
- Vite `base` 설정: `vite.config.js`에 `base: '/VisualCode/'`를 적용하여 Pages의 서브경로 문제를 해결했습니다.
- 재현 가능한 설치: `package-lock.json`을 포함하고 워크플로우에서 `npm ci` 사용을 권장합니다.
- CI 캐싱: `actions/setup-node@v4`의 npm 캐시를 워크플로우에 포함해 의존성 복원 속도를 개선했습니다.
- 빌드·배포 파이프라인: Actions에서 빌드를 실행하고 아티팩트를 업로드한 뒤 Pages에 배포하도록 구성했습니다.
- 배포 검증: `docs/CI_SMOKE.md`에 기반한 스모크 체크 스크립트를 문서화했습니다.
- 보안 조치: 민감 파일(`.env`, `audit.json`, `build.log` 등)을 히스토리에서 제거했으며, 로컬 노트 파일은 `.gitignore`로 관리합니다.
- 캐시/인덱스 정책: HTML은 no-cache 헤더로 최신 HTML을 보장하고, 에셋은 해시된 파일명으로 캐시 가능하도록 유지했습니다.

## 운영·유지보수 팁
- 히스토리 재작성 후 로컬 동기화: 히스토리 재작성(민감파일 제거) 후에는 필요 시 `git fetch --all && git reset --hard origin/main`로 로컬을 재설정하세요.
- 의존성 취약점: `npm audit`와 `npm audit fix`를 주기적으로 실행해보세요. 자동 수정을 적용할 때는 변경 범위를 검토하세요.

## 관련 문서
- `docs/DEPLOYMENT.md`, `docs/CI_SMOKE.md`, `docs/ENVIRONMENT.md`, `docs/SECURITY.md` — 운영·배포·보안 관련 세부 문서

---

원하시면 이 README를 리포지터리에 커밋하고 원격에 푸시해 드립니다. `UserNotification.md`는 로컬 전용으로 유지하려면 그대로 두고, 삭제하려면 알려주세요.

