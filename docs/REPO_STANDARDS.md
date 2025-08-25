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

### 에디터 설정 권장

프로젝트 루트에 `.editorconfig`를 추가하여 에디터 간 기본 인덴트, EOL, 문자셋을 일관화합니다. 이미 `.editorconfig`가 포함되어 있으므로 로컬 에디터에서 해당 설정을 적용해 주세요.

## 보안

- Dependabot을 활성화하고 보안 PR은 우선 처리
- 취약점 패치 시 PR에 영향 범위 및 테스트 체크리스트 포함

## Recent changes

- 2025-08-24: Imported local audit reports for traceability: `audit_report_after.json` and `audit_report_after2.json` (archived in `docs/archive/` and removed from repo root). These show zero known vulnerabilities after remediation.
- 2025-08-24: Published release for dependency upgrades: [v0.0.1-deps-20250824](https://github.com/pargame/VisualCode/releases/tag/v0.0.1-deps-20250824) (React 19, ESLint 9, Husky 9).
  Release assets: `VisualCode-dist-v0.0.1-deps-20250824.zip` attached to the release (build output `dist/`).

### Release asset upload & verification

- Build artifacts (Vite): `dist/` — create the zip locally or in CI and attach to a GitHub Release. Do not commit large binary artifacts into the repository; keep them as release assets.
- Recommended ephemeral paths (CI/local): `/tmp/VisualCode-dist-<tag>.zip` or `artifacts/VisualCode-dist-<tag>.zip`.
- Example: upload with the GitHub CLI (used in our maintenance run):

  gh release upload v0.0.1-deps-20250824 /tmp/VisualCode-dist-v0.0.1-deps-20250824.zip --repo pargame/VisualCode --clobber

- Verify the asset exists via the GitHub UI or GitHub CLI:

  gh release view v0.0.1-deps-20250824 --repo pargame/VisualCode --json assets

  # Or list asset names (requires `jq`):

  gh release view v0.0.1-deps-20250824 --repo pargame/VisualCode --json assets -q '.assets[].name'

- Browser verification: https://github.com/pargame/VisualCode/releases/tag/v0.0.1-deps-20250824 — the asset should appear under "Assets".

Notes:

- Prefer storing artifacts only on GitHub Releases (or a dedicated artifact storage) rather than committing them to the repo. If you must keep a copy in-tree for traceability, use a dedicated `releases/` or `artifacts/` folder and consider adding a small CHECKSUM file; still prefer the GitHub Release as the single source of truth.
- If you need automated checks after upload, add a small CI job that calls `gh release view --json assets` and fails if the expected asset name is missing.

### Checksums and release integrity

We now generate a SHA256 checksum for every release artifact and upload it alongside the zip. This allows consumers to verify integrity after downloading.

Generation (CI): `sha256sum artifacts/VisualCode-dist-<tag>.zip > artifacts/VisualCode-dist-<tag>.sha256`

Verification (local):

```bash
# download assets from the Releases page or via gh
gh release download v0.0.1-deps-20250824 --repo pargame/VisualCode --pattern "VisualCode-dist-v0.0.1-deps-20250824.*"
# verify checksum
sha256sum -c VisualCode-dist-v0.0.1-deps-20250824.sha256
```

Recommendation: Consumers should verify checksums after downloading, and automation should fail CI if checksum verification fails.

### 도구: 릴리스 무결성 검증 스크립트

로컬 또는 CI에서 릴리스 자산(zip + sha256)을 자동으로 검증하는 `scripts/verify-release-asset.sh` 스크립트를 추가했습니다. 사용 예시는 README에 문서화되어 있으며, `npm run verify:release` 스크립트로도 실행할 수 있습니다.

### Automated release upload (recommended)

We provide a reproducible workflow that builds the site and uploads a release asset when a tag matching `v*` is pushed: `.github/workflows/release-upload.yml`.

How it works:

- Push a tag (e.g., `git tag v0.0.2 && git push origin v0.0.2`). The workflow will:
  1. Checkout the tag
  2. Run `npm ci` and `npm run build`
  3. Create `artifacts/VisualCode-dist-<tag>.zip` from `dist/`
  4. Upload the zip as a release asset and verify its presence

Notes:

- This reduces the need for manual `gh release upload` steps and keeps releases reproducible from CI. The workflow uses the repository `GITHUB_TOKEN`; if you need cross-repo uploads or additional permissions, consider a personal access token stored in secrets.
- If you prefer manual uploads for signed binaries or special handling, the manual `gh release upload` approach in docs remains supported.

Local helper: creating a release zip

You can generate the same zip artifact locally for testing or manual uploads with:

```bash
# optionally set TAG env var; otherwise package.json version is used
TAG=dev-local npm run release:zip
# result: artifacts/VisualCode-dist-<TAG>.zip and (CI creates a .sha256 when uploading)
```

Use this when you want to validate the zip locally before creating a tag and pushing.

Next steps:

- Run CI on the branch to confirm the ETARGET error is resolved.
- If `/husky` v10 becomes available upstream and we still want to upgrade, create a follow-up PR that:
  - updates `package.json` to the desired `husky` version,
  - runs `npm ci` locally and in CI to verify install,
  - updates `.husky/*` scripts only if required by the new major, and
  - documents changes in `docs/REPO_STANDARDS.md` and `docs/MAINTENANCE.md`.

- Consider pinning `husky` with a more conservative semver (e.g., `8.x` / `~8.0.0`) if automatic upgrades cause instability.

---

변경 제안은 PR로 제출하고 CI 검사 통과 후 병합하세요.
