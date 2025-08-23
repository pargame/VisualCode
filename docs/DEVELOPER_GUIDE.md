# Developer Guide

이 문서는 개발자 온보딩과 로컬 개발에 필요한 기본 지침을 제공합니다.

핵심 명령

- 의존성 설치: `npm install`
- 재현 가능한 설치(CI와 동일): `npm ci`
- 개발 서버: `npm run dev`
- 프로덕션 빌드: `npm run build`
- 포맷: `npm run format`
- 린트: `npm run lint`
- 테스트: `npm run test -- --run`

테스트 추가

- 테스트 파일 위치: `test/*.test.jsx` 또는 `test/*.spec.jsx`
- 테스트는 `vitest`와 `@testing-library/react`를 사용합니다. DOM 테스트는 jsdom 환경을 사용합니다.

커밋 훅

- Husky가 설치되어 있으며, pre-commit 훅에서 `lint-staged`를 통해 변경 파일에 대해 ESLint와 Prettier가 실행됩니다.
