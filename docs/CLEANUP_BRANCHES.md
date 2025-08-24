# Branch cleanup guidance

이 문서는 오래된 브랜치 식별 및 정리 절차를 안내합니다.

1. 오래된 브랜치 목록 얻기

```bash
# 로컬에서 원격 브랜치와 마지막 커밋 날짜 보기
git fetch --prune
for b in $(git for-each-ref --format='%(refname:short) %(authordate:iso8601)' refs/remotes/origin | sort -r); do echo "$b"; done
```

2. 삭제 후보 필터
- 마지막 커밋이 90일 이상 전인 브랜치
- 이미 main에 머지된 브랜치
- 의존성/자동 생성 브랜치(dependabot)는 별도 정책 적용

3. 안전한 삭제 절차
- 삭제 전 브랜치 백업(예: `git checkout -b backup/<branch>`)
- PR이 닫혔거나 머지된 브랜치만 삭제 권장
- 삭제 커맨드:

```bash
git push origin --delete <branch>
```

4. 자동화 제안
- stale-branch action을 사용해 PR/이슈로 알림 생성 또는 자동 삭제 트리거 설정 가능

