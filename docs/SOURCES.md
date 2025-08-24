# Sources and File Mapping

이 문서는 프로젝트의 주요 소스 파일과 역할을 설명합니다.

프로젝트 루트 구조(요약)

- `index.html` — Vite entry HTML
- `package.json` / `package-lock.json` — 의존성 및 스크립트
- `src/` — React 소스
  - `src/main.jsx` — 앱 엔트리 포인트
  - `src/App.jsx` — 루트 컴포넌트
  - `src/styles.css` — 기본 스타일
- `.github/workflows/deploy-pages.yml` — Pages 배포 워크플로우
- `docs/` — 문서화

설명

- `index.html`: Vite 템플릿으로, 메타 태그(캐시 제어 등)를 여기서 관리할 수 있음
- `src/`: React 컴포넌트 및 스타일을 관리. 컴포넌트 추가 시 여기 아래에 폴더를 만들어 구조화하세요.
- `package.json` 스크립트:
  - `dev` — 로컬 개발 서버
  - `build` — 프로덕션 빌드
  - `preview` — 빌드된 결과를 로컬에서 미리보기
