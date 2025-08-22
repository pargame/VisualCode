# VisualCode

간단한 Vite + React 정적 사이트 저장소입니다.

로컬 개발

1. 의존성 설치 (재현 가능한 설치)

	npm ci

2. 개발 서버 실행

	npm run dev

3. 프로덕션 빌드

	npm run build

배포

이 저장소는 GitHub Actions를 사용해 `main` 브랜치에 푸시될 때 자동으로 빌드 및 GitHub Pages에 배포됩니다.

CI 동작 요약

- 워크플로우: `.github/workflows/deploy-pages.yml`
- 설치: `npm ci` 사용 (package-lock.json이 존재할 경우)
- 빌드: `npm run build` 실행 (build 스크립트가 있는 경우)
- 배포: `actions/deploy-pages@v4` 사용

문제 해결

- 캐시 관련 문제: 워크플로우는 npm 캐시를 사용해 실행 속도를 개선합니다.
- 취약점: 로컬에서 `npm audit` 및 `npm audit fix`를 실행해 문제를 확인하세요.

문의

추가 도움이나 자동화 개선을 원하면 알려 주세요.

