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

## 통합 터미널(Exit code 127) 진단 및 대응

증상: VS Code 통합 터미널을 열 때 `/bin/zsh` 프로세스가 즉시 종료되며 "terminated with exit code 127" 메시지가 출력됩니다. 이 코드는 일반적으로 "command not found"를 의미하며, 셸 초기화 파일에서 존재하지 않는 명령을 호출하거나 PATH를 덮어써 필요한 바이너리가 보이지 않을 때 발생합니다.

재현 및 진단 명령 (로컬에서 실행):

```bash
# 기본 쉘 및 zsh 경로 확인
echo "$SHELL"
which zsh
/bin/zsh --version

# interactive / login+interactive / non-interactive 모드 테스트
/bin/zsh -i -c 'echo interactive_ok'
/bin/zsh -l -i -c 'echo login_interactive_ok'
/bin/zsh -c 'echo non_interactive_ok'
```

원인 분석 체크리스트

- `~/.zshrc`, `~/.zprofile`, `~/.zshenv` 등 초기화 파일에서 절대경로가 없는 외부 명령을 직접 호출(예: some_tool --flag)
- 초기화 파일이 PATH를 덮어써 `/usr/bin` 같은 표준 경로를 제거
- 초기화 파일에 민감 데이터(하드코딩 API 키 등)가 포함되어 있고 출력/처리시 에러 발생

안전한 패치(권장 패턴)

- non-interactive 셸에서 초기화 로직을 건너뛰도록 방어문을 추가합니다(통합 터미널 또는 스크립트가 zsh를 호출할 때 예기치 않은 종료를 방지):

```bash
# ~/.zshrc 상단에 추가
[[ $- != *i* ]] && return
```

- 외부 명령 호출는 `command -v` 또는 `if [ -x "/path/to/bin" ]`로 감싸 안전하게 처리합니다:

```bash
if command -v rbenv >/dev/null 2>&1; then
  eval "$(rbenv init - zsh)"
fi
```

- 비밀(시크릿) 값은 dotfile에 직접 저장하지 말고 안전한 위치(예: `$XDG_CONFIG_HOME/gemini/keys` 또는 환경변수)에서 로드합니다. 예시: `~/.config/gemini/keys` (각 줄에 하나의 키), 파일 권한 `chmod 600` 권장.

제가 적용한 안전 패치(사례)

- 작업: `~/.zshrc`를 백업한 뒤 안전화된 버전으로 교체했습니다. 백업 파일 예: `~/.zshrc.prepatch.1756102129`.
- 변경 요지:
  - non-interactive 셸에서 초기화 스크립트를 건너뛰도록 `[[ $- != *i* ]] && return` 추가
  - 하드코딩된 Gemini API 키 제거 및 키 파일(`~/.config/gemini/keys`) 또는 환경변수로 대체
  - `brew`, `rbenv` 등의 툴 로딩을 존재 확인(guard)으로 감쌈
- 검증: `/bin/zsh -i`, `/bin/zsh -l -i`, `/bin/zsh -c` 를 사용한 테스트에서 모두 정상 동작 확인

운영 체크리스트 (터미널 관련)

1. 문제가 보고되면 우선 VS Code에서 통합 터미널을 새로 열어 확인
2. 로컬에서 위의 재현 명령을 실행해 non-interactive vs interactive 차이를 확인
3. 초기화 파일을 열어 외부 명령 호출/경로 덮어쓰기 여부 확인
4. 임시로 `[[ $- != *i* ]] && return`을 추가해 non-interactive 환경에서 안전하게 빠져나오도록 조치
5. 변경 시 백업을 반드시 남기고(예: `~/.zshrc.prepatch.<ts>`), 테스트 후 롤백 가능하게 함

## 아카이브 및 클린업 (이번 작업 요약)

- 이번 세션에서 로컬/레포지토리 정리 작업을 수행했습니다:
  - `audit_report.json`, `audit_report_after.json`, `audit_report_after2.json` 파일들은 `docs/archive/`로 이동되어 저장소 루트에는 더 이상 존재하지 않습니다.
  - 관련 커밋:
    - `0d6343f` — archive: moved audit reports into `archive/` and added `docs/archive/NOTIFICATIONS-2025-08-24.md`
    - `8b2a6ee` — chore: archive audit reports, artifacts and UserFile (workspace commits)
    - `edd703b` — chore: remove archived audit reports and artifacts from repo (files removed from git)
  - 결과: `archive/`에 더 이상 추적되는 감사 파일이 없고(`git ls-files | grep '^archive/'` 결과 없음), `archive/artifacts/`는 현재 빈 디렉토리(로컬 파일시스템상)입니다.

운영 지침

- 아카이브 전에는 반드시 원본을 GitHub Release 또는 안전한 외부 저장소로 이전한 뒤 이동/삭제 권고
- 깃에서 완전 제거(히스토리 재작성)를 원하면 `git filter-repo` 또는 BFG 사용을 검토하되 팀원에게 사전 공지 필요

## 변경 기록(추가)

| 날짜       |  변경자 | 파일                 | 요약                                                         | PR/커밋 |
| ---------- | ------: | -------------------- | ------------------------------------------------------------ | ------- |
| 2025-08-25 | pargame | `~/.zshrc` (dotfile) | non-interactive guard 추가, gemini 키를 파일/환경변수로 이동 | ad-hoc  |
| 2025-08-25 | pargame | `archive/*`          | 감사 리포트 파일 깃에서 제거(아카이브 후 삭제)               | edd703b |
