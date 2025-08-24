# Contributing

이 프로젝트에 기여해 주셔서 감사합니다. 아래는 코드 변경 작업을 위한 최소한의 규칙입니다.

브랜치 네이밍

- feature: `feat/<short-desc>` 또는 AI 작업은 `feat/ai/<short-desc>`
- fix: `fix/<short-desc>` 또는 `fix/ai/<short-desc>`

PR 규칙

- PR은 작은 단위로 유지하십시오. 하나의 PR에는 하나의 목적만 포함됩니다.
- 모든 PR은 CI(포맷 → 린트 → 테스트 → 빌드)를 통과해야 합니다.
- 긴급 수정(hotfix)인 경우 제목에 `[hotfix]`를 붙이고 사후 검토를 요청하세요.

검토

- 병합 전 최소 1명의 리뷰어 승인이 필요합니다.

문서

- 변경 사항이 API/워크플로우/배포 관련이면 반드시 문서 업데이트를 포함하세요.

보안

- 민감 정보(토큰, 비밀번호 등)는 절대 커밋하지 마세요. 시크릿이 유출되었다면 즉시 회전하세요.

# Contributing

Thank you for considering contributing to this project. The repository uses a
lightweight workflow:

- Fork the repository or create a branch from `main`.
- Make changes on a feature branch and ensure lint, format and tests pass.
- Open a Pull Request describing the change and link any related issue.
- PRs should include: description, testing steps, and CI status.

Pre-PR checklist:

- Run `npm run format` and `npm run lint` locally.
- Add tests for new behavior and run `npm run test -- --run`.
- Ensure no secrets are committed.
