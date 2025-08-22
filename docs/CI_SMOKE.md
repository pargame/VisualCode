# CI Smoke Checks (Post-deploy verification)

이 문서는 배포 후 자동으로 수행할 스모크 체크(간단한 동작 확인)를 설명합니다.

## 목적
- 배포된 사이트가 정상적으로 로드되는지 빠르게 확인
- 주요 자산(HTML, JS, CSS)이 200 응답을 반환하고 주요 텍스트가 포함되어 있는지 확인

## 권장 스모크 체크 항목
1. HTTP 200 응답 확인
   - `curl -fsS -o /dev/null -w "%{http_code}" https://pargame.github.io/VisualCode/` → 기대값 `200`
2. HTML에 루트 노드 존재 확인
   - `curl -fsS https://pargame.github.io/VisualCode/ | grep -q "<div id=\"root\""`
3. 핵심 자산 응답 확인(예)
   - `curl -fsS -I https://pargame.github.io/VisualCode/VisualCode/assets/index-BV5CwDPO.js` → 200
4. 간단한 콘텐츠 체크
   - 인덱스에 특정 텍스트(예: 프로젝트 이름)가 포함되어 있는지 확인

## GitHub Actions에 추가하는 예제 스텝
```yaml
- name: Smoke check deployed site
  run: |
    set -e
    URL="https://pargame.github.io/VisualCode/"
    HTTP_CODE=$(curl -fsS -o /dev/null -w "%{http_code}" "$URL")
    if [ "$HTTP_CODE" -ne 200 ]; then
      echo "Site did not return 200: $HTTP_CODE"
      exit 1
    fi
    # check root node
    if ! curl -fsS "$URL" | grep -q '<div id="root"'; then
      echo "Root div not found"
      exit 1
    fi
    echo "Smoke checks passed"
```

## 실패 대응
- 실패 시: 워크플로 로그를 확인하고 빌드 단계(artifact)와 워크플로우의 publish_dir 결정 로직을 검토
- 필요하면 배포 이전 단계에서 `ls -la dist`를 추가해 빌드 출력을 노출

## 모니터링/알림
- 스모크 실패 시 PR 코멘트, Slack 알림 등을 추가해 팀에게 통보할 수 있습니다.
