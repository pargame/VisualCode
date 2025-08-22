# Environment Setup

이 문서는 로컬 개발 환경과 CI 환경을 설정하는 절차를 담고 있습니다.

## 로컬 개발 (macOS)

- 요구사항
  - Node.js 18 또는 24 (권장: 24.x LTS)
  - npm 9 이상 (npm 11 사용 권장)
  - Git
  - VS Code (옵션)

- 설치 및 준비
  1. repo 클론
     ```bash
     git clone https://github.com/pargame/VisualCode.git
     cd VisualCode
     ```
  2. 의존성 설치 (재현 가능한 설치)
     ```bash
     npm ci
     ```
  3. 개발 서버 실행
     ```bash
     npm run dev
     ```

## CI 환경 (GitHub Actions)

- 워크플로우 파일: `.github/workflows/deploy-pages.yml`
- Node 설치: `actions/setup-node@v4` (node-version: '18', cache: 'npm')
- 캐시: `setup-node` 내장 npm 캐시 사용
- 권한: `contents: write`, `pages: write`, `id-token: write`

## 주의사항
- `npm audit fix --force`는 메이저 업그레이드를 포함할 수 있으며 코드 호환성 확인이 필요합니다.
- macOS에서는 `fsevents` 등 선택적 의존성이 포함되어 설치 로그가 다르게 보일 수 있습니다.
