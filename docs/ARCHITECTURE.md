# Architecture Overview

이 프로젝트는 단일 페이지 애플리케이션(SPA)으로 Vite + React를 사용하여 빌드된 정적 자원을 GitHub Pages에 배포합니다.

## 구성 요소

- Vite (빌드 도구)
- React (UI 라이브러리)
- GitHub Actions (CI/CD)
- GitHub Pages (호스팅)

## 런타임/배포 모델

1. 개발자가 `main` 브랜치에 변경을 푸시합니다.
2. GitHub Actions가 빌드 및 아티팩트를 생성합니다.
3. 아티팩트를 Pages로 배포합니다.
4. 사용자는 정적 호스팅된 자원을 통해 SPA를 제공합니다.

## 확장 제안

- 테스트(단위/통합)를 추가하여 CI 단계에 포함
- A/B 배포나 Canary 배포는 Pages 한계로 인해 별도 호스팅(예: Cloudflare Pages, Netlify) 고려
- 서버 사이드 기능이 필요하면 API 서버를 별도 서비스로 분리
