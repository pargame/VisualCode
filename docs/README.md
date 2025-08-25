# Documentation (간략 안내)

이 폴더는 프로젝트의 운영·배포·개발 환경과 관련된 핵심 문서를 담고 있습니다. 변경은 PR로 진행해 주세요.

## 빠른 목차

## 퀵스타트 (개발자 관점)

Last updated: 2025-08-25

이 폴더는 프로젝트 운영 및 개발 관련 문서를 포함합니다.

1. 레포 클론 및 의존 설치

   ```bash
   git clone https://github.com/pargame/VisualCode.git
   cd VisualCode
   npm ci
   ```

2. 개발 서버 실행

   ```bash
   npm run dev
   # http://localhost:5173 에서 확인
   ```

3. 프로덕션 빌드

   ```bash
   npm run build
   # 결과물이 dist/에 생성됩니다.
   ```

## 토큰 및 배포 핵심 가이드 (요약)

- 자동 배포/이슈 생성은 기본적으로 `GITHUB_TOKEN`으로 동작합니다. 대부분의 배포/자동화 작업은 추가 설정 없이 동작합니다.
- 레포지토리 범위를 넘어서는 권한(또는 cross-repo 이슈 생성 등)이 정말로 필요할 때만 `DEPLOY_ISSUE_TOKEN` 같은 PAT을 `Settings → Secrets`에 추가하세요.
- 워크플로우는 `secrets.*`를 직접 `if:` 에 넣지 않고, 런타임 셸 스텝에서 선택해 `outputs`로 전달하는 안전한 패턴을 사용합니다. (`docs/DEPLOYMENT.md`에 코드 예시 포함)

## 기여/수정 방법

- 문서에 소폭 개선이 필요하면 `docs/*` 파일을 편집해 PR을 보내 주세요. 급한 수정은 작은 PR로 여러 번 나누는 것을 권장합니다.

---

다음은 폴더에 포함된 기존 문서의 간단 설명입니다. 자세한 내용은 각 파일을 열어 확인하세요.

# Documentation

이 폴더는 프로젝트의 운영, 배포, 개발 환경, 아키텍처, 그리고 소스 파일 구성을 문서화합니다.

주요 문서

- `ENVIRONMENT.md` — 로컬 개발 및 CI 환경 설정 (책임자: pargame)
- `DEPLOYMENT.md` — GitHub Actions로 Pages에 배포하는 방법과 워크플로우 설명 (책임자: pargame)
- `ARCHITECTURE.md` — 애플리케이션 아키텍처 개요 (책임자: pargame)
- `SOURCES.md` — 주요 소스 파일과 역할 (책임자: pargame)
- `MAINTENANCE.md` — 유지보수 절차와 정기 작업 목록 (책임자: pargame)

문서에 문제가 있거나 보완할 내용이 있으면 이 리포지토리에서 PR을 통해 수정하십시오.
