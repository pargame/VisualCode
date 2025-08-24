# Maintenance

프로젝트 유지보수 및 정기 작업 가이드입니다.

## 주기적 작업

- 빈도 권장

  - 매주: `npm audit` 실행 및 새로운 Dependabot PR 확인
  - 매월: 의존성 버전 업데이트(비파괴적 범위, `npm update`)와 CI 안정성 검토
  - 분기별: 핵심 런타임(예: Node) 및 빌드 도구(Vite, Vitest 등) 버전 검토

- 실행 명령(로컬)

  - 취약점 조회: `npm audit` 또는 `npm run audit`
  - 안전 자동 수정: `npm audit fix` 또는 `npm run audit:fix`
  - 강제 수리(검토 후): `npm audit fix --force` 또는 `npm run audit:fix:force` (브랜치에서 PR로 진행)

- 의존성 업데이트 전략

  - 직접(최상위) 의존성은 PR로 업데이트하고 CI를 통해 검증
  - 전이적(transitive) 의존성 경고는 우선 Dependabot에 맡기고, 중요 취약점은 수동 패치 또는 패키지 교체 고려
  - 메이저 업그레이드 시에는 변경 로그 확인과 로컬 빌드/테스트 통과를 필수로 함

- 워크플로우 점검
  - Actions 실패, 느린 단계가 있으면 우선 로그로 원인 파악 후 관련 PR/이슈에 기록
  - 장기 실패(같은 워크플로우가 여러 PR에서 반복 실패)인 경우 책임자에게 알리고 hotfix 브랜치 고려

## 긴급 조치

- 배포 실패 시

  1. Actions 로그에서 실패 단계 확인
  2. 로컬에서 동일한 단계(예: `npm ci`, `npm run build`) 재현
  3. 필요한 경우 의존성 롤백 또는 코드 수정

  ### CI 실패 시 권장 트리아지

  1. 실패한 워크플로우의 'Logs'를 열어 실패 단계(예: lint, test, build)를 확인
  2. 실패가 재현 가능한지 로컬에서 `npm ci && npm run <failing-step>`로 시도
  3. 포맷 문제일 경우 `npm run format`로 자동 수정 후 커밋
  4. 의존성 문제일 경우 해당 PR 또는 브랜치에서 `npm audit`/`npm ls <pkg>`로 원인 추적
  5. Dependabot PR의 경우 자동 병합 정책(문서 참조)에 따라 PR을 검토하고 필요 시 수동 수정
  6. 반복적으로 동일한 실패가 발생하면 이슈를 생성하고 책임자에게 통보

### 취약점 발생 시 권장 플로우

1. `npm audit`로 세부 정보 확인
2. 가능한 경우 `npm audit fix`로 우선 해결
3. 자동 수리로 해결되지 않는 심각 취약점은 별도 브랜치(예: `fix/security/<issue>`)로 PR 생성
4. PR에는 영향 범위와 테스트/리스크 요약을 포함
5. 긴급(critical)인 경우 슬랙/메일/이슈로 담당자 태그 후 긴급 배포 절차 시행

## 백업 및 롤백

- Pages는 정적 호스팅이므로 긴급 롤백은 이전 커밋을 main으로 재배포 (git revert 또는 강제 푸시)로 가능

## 연락 정보

- 리포지토리 오너: `pargame` (GitHub 프로필 참조)

## 변경 기록

- 문서가 업데이트될 때마다 이 파일에 주요 변경사항과 날짜를 기록하세요.

### 문서 변경 기록 템플릿

| 날짜       |  변경자 | 파일                | 요약                       | PR/커밋 |
| ---------- | ------: | ------------------- | -------------------------- | ------- |
| 2025-08-24 | pargame | docs/ENVIRONMENT.md | 권장 Node 버전 20으로 통일 | #NNN    |

## Dependabot 및 자동화

- Dependabot 설정은 `.github/dependabot.yml`에 있으며, 주간 스케줄로 npm 의존성 업데이트 PR을 생성합니다.
- 현재 정책: major Vite 업데이트는 자동화에서 제외(수동 검토 필요).

### Dependabot 자동 병합 정책

- 목적: 보안·비파괴적(패치/마이너) 의존성 PR을 테스트 통과 시 자동으로 병합해 유지보수 부담을 줄입니다.
- 규칙 요약:
  - 자동 병합은 PR 작성자가 Dependabot일 때만 동작
  - `dependencies` 라벨이 있는 PR에만 적용
  - CI 모든 체크가 성공해야 병합
  - 병합 방식: squash, 병합 후 브랜치 삭제
  - 메이저 업그레이드는 기존 `.github/dependabot.yml`의 ignore 규칙에 따라 수동 처리

위 정책은 `.github/workflows/dependabot-automerge.yml`에 구현되어 있습니다.

## 릴리즈 및 소유권

- 릴리즈 초안 자동화: `release-drafter`를 사용해 `main`에 머지된 PR을 기반으로 릴리스 초안을 자동 생성합니다. 구성 파일: `.github/release-drafter.yml` 및 워크플로우 `.github/workflows/release-drafter.yml`.
- 코드 소유자: `.github/CODEOWNERS`에 명시된 소유자는 PR 리뷰 요청 대상이 될 수 있으며, 중요 변경에 대해 자동 리뷰 요청을 설정할 수 있습니다.

## 현재 취약점 요약 (간단)

- 2025-08-24: `micromatch`에 대한 ReDoS 취약점으로 인한 2개의 moderate 취약점이 감지되었습니다. 영향을 받는 패키지는 `lint-staged`를 통해 전이적으로 포함됩니다.
- 권장 조치: `npm audit fix`로 우선 해결을 시도하고, 자동 수리로 해결되지 않으면 `fix/security/micromatch` 같은 브랜치에서 의존성 업데이트 PR 생성 후 CI 검증.

## Repository history rewrite (sensitive file removal)

> 주의: 히스토리 재작성은 돌이킬 수 있는 작업이며 로컬 클론에 영향이 큽니다. 아래 지침을 따르세요.

2025-08-24: 리포지터리 히스토리에서 민감 파일을 제거하기 위해 로컬에서 미러를 만들고 히스토리를 재작성한 뒤 원격에 강제 푸시했습니다. 제거 대상(예시): `audit.json`, `audit_total.txt`, `build.log`, `.env`, `.idea`.

- 로컬 영향 안내

  - 기존 로컬 클론이 있으면 반드시 `git fetch --all` 후 중요한 변경사항을 백업하고 `git reset --hard origin/main` 또는 재클론 권장
  - 강제 푸시로 인해 로컬 브랜치와 리모트가 불일치할 수 있으므로 팀원에게 공지 필요

- 복구/검증
  - 재작성된 히스토리가 의도한대로 민감 파일을 제거했는지 확인하려면 `git log --stat`와 `git ls-tree`로 검증

---

로컬에 기존 클론이 있을 경우 재클론 또는 브랜치 리셋(예: `git fetch --all` + `git reset --hard origin/main`)이 필요합니다.
