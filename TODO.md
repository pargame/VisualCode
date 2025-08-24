# Copilot 개발 방향성

- 유지 보수 추구: 관련 docs문서를 함께 최신화 하면서 진행
- 표준적인 개발을 지향
- AI 전권 위임: AI가 선택한 우선순위에 따라 차례대로 알아서 최대한 많이 주도적으로 진행. 이후 커밋 푸시까지 진행
- 깃허브 액션으로 깃허브 페이지 배포. PR은 귀찮으니까 한다고 해도, 너가 알아서 승인하도록.
- 혼자 AI와 작업하므로 피드백을 빨리 할 수 있도록 미리보기 로컬 서버 추구
- AI에 작업을 시키면, 깃 스테이징/커밋/머지 등 알아서 실행되며 로컬 서버 실행 자동화 추구
- 간소화된 깃 환경 추구: 브랜치 너무 많이 만들면 주기적으로 머지 및 삭제 권장
- 간소화된 개발 풀 추구: 혼자 개발중이므로 너무 복잡한 작업 세분화/로그 세분화 지양

# 현재 사용자의 기능적 요구사항 리스트

- 기능: 격자 화면 구현, 각 점 클릭 시 노드 생성, 생성된 노드에 파이썬 코드 저장

# 목표 진행 중 문제

- 실제 사이트에 배포가 적용이 안됨
- 터미널에 명령어 실행 시, 무한 로딩 및 멈춤 잦게 발생중

## Recent AI actions (2025-08-25)

- Fixed `src/App.jsx`: removed stray markdown fences and corrected the global click handler so clicks on the board/editor controls do not create duplicate nodes. Verified file has no syntax errors.
- Ensured import/export UI remains available (file input + export JSON button).

## Next steps (recommended)

- Run the local dev server and manually verify: grid snapping, single-node creation on board clicks, node selection/edit/save, and import/export JSON flow.
- If local verification passes: commit the fix, push to a branch, create/merge PR and let CI run (or use the repository's auto-merge policy).
- If deployed site does not reflect changes: trigger a redeploy (force gh-pages push) and run the smoke-check again; check CDN/browser cache if still stale.

_Note: these actions follow the AI full-delegation preference listed above and are safe to run when you confirm._
