# Notifications (archived: 2025-08-24)

This file is an archived snapshot of the project's dependency/notification notes from 2025-08-24. It has been moved to `docs/archive/` to keep the top-level `docs/` directory focused on active guidance.

---

## 2025-08-24 — Dependency upgrades

Summary:

- Upgraded core dependencies to latest stable where safe:
  - React 19
  - ESLint 9 (flat config)
  - Husky 9

Verification performed:

- `npm install` — OK
- `npm run prepare` — OK (Husky hooks installed)
- `npm run test` — OK
- `npm run build` — OK
- Local audit reports: `audit_report_after.json`, `audit_report_after2.json` (no vulnerabilities)

Developer action items:

1. Pull latest main and switch to Node 20 (`nvm use`)
2. Run `npm install` and `npm run prepare` to register Husky hooks
3. Run `npm run format` and `npm run lint` if CI requests auto-fixes

Notes:

- ESLint now uses `eslint.config.cjs` (flat config). Update editor integrations if needed.
- We created `backup/main/20250824-0855` branch as a recovery point.

If you see issues, open an issue or contact the maintainers.
