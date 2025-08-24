# Repository Standards

이 문서는 이 저장소에서 권장하는 개발/CI/배포 표준을 정리합니다.

## 필수 구성

- Node.js 20 사용 (엔진 필드에 명시)
- `prettier` + `.prettierrc`와 `check:format` 스크립트 유지
- `eslint`와 `.eslintrc.cjs`로 정적분석 유지
- `husky` + `lint-staged`로 변경 전 자동 포맷/수정
- GitHub Actions: CI, Deploy to Pages, Mirror 백업(basic)

## 브랜치 전략

- `main`은 보호된 브랜치로 유지
- `main-backup`은 자동화 전용(읽기 전용 권장)
- 기능 브랜치는 `feature/*`, 버그픽스는 `fix/*`, 보안 핫픽스는 `hotfix/*`

## 배포

- GitHub Pages: `gh-pages` 브랜치 또는 Pages 배포 액션 사용
- 배포 전 CI(테스트+lint+format) 통과 필수

## 백업

- `main-backup`을 주간(자동)으로 생성/갱신
- 중요 변경 전에는 타임스탬프 백업(예: `backup/main/YYYYMMDD-HHMM`) 권장

## 코드 포맷/스타일

- Prettier 정의는 `.prettierrc`에 있음
- 저장소에 `.prettierignore` 및 `.gitattributes` 유지

## 보안

- Dependabot을 활성화하고 보안 PR은 우선 처리
- 취약점 패치 시 PR에 영향 범위 및 테스트 체크리스트 포함

---

변경 제안은 PR로 제출하고 CI 검사 통과 후 병합하세요.
