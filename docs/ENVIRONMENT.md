# Environment Setup

이 문서는 로컬 개발 환경과 CI 환경을 설정하는 절차를 담고 있습니다.

## 로컬 개발 (macOS)

- 요구사항

  - Node.js 20.x (권장: 20.x LTS)
  - npm 9 이상 (권장: npm 10+)
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

  nvm (권장)

  - macOS에서 여러 Node 버전을 쉽게 전환하려면 `nvm`(Node Version Manager)을 사용하세요.
  - 설치(예: Homebrew):
    ```bash
    brew install nvm
    mkdir -p ~/.nvm
    # 쉘 프로필에 nvm 초기화 추가 (예: ~/.zshrc)
    echo 'export NVM_DIR="$HOME/.nvm"' >> ~/.zshrc
    echo 'source $(brew --prefix nvm)/nvm.sh' >> ~/.zshrc
    source ~/.zshrc
    ```
  - 권장 Node 버전(루트 `.nvmrc` 사용):
    ```bash
    nvm install
    nvm use
    ```

  3. 개발 서버 실행
     ```bash
     npm run dev
     ```

  관리/유지보수 유틸리티

  - 취약점 스캔(로컬): `npm run audit` — JSON 출력을 통해 자동화 도구 또는 수동 분석에 사용
  - 취약점 자동 수정: `npm run audit:fix` (안전) / `npm run audit:fix:force` (검토 후 브랜치에서 사용)
  - CI/빌드 재현(간단 스모크): `npm run ci:smoke` (의존성 설치 후 빌드까지만 실행)

## CI 환경 (GitHub Actions)

- 워크플로우 파일: `.github/workflows/deploy-pages.yml`
- Node 설치: `actions/setup-node@v4` (node-version: '18', cache: 'npm')
- 캐시: `setup-node` 내장 npm 캐시 사용
- 권한: `contents: write`, `pages: write`, `id-token: write`

## 주의사항

- `npm audit fix --force`는 메이저 업그레이드를 포함할 수 있으며 코드 호환성 확인이 필요합니다.
- macOS에서는 `fsevents` 등 선택적 의존성이 포함되어 설치 로그가 다르게 보일 수 있습니다.
