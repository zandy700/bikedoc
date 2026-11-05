# BikeDoc Completion Plan

> **For agentic workers:** Use superpowers:executing-plans for this completion audit; UI, domain, tests, and docs are delegated as requested.

**Goal:** Finish and verify the existing BikeDoc implementation against the supplied product spec.

**Architecture:** Preserve App Router pages, client localStorage state, deterministic sample seed, and server-side vision diagnosis with a rule fallback. Keep workshop data visibly distinct from the supplied motivation facts.

**Tech Stack:** Next.js, strict TypeScript, Tailwind, AI SDK, Zod, Recharts, Vitest, Testing Library, Playwright.

**Spec:** User's BikeDoc product specification in this session.

## Global Constraints

- No login; no API key required; no remotes or pushes.
- Only motivation facts: Xingjian Zhang, 3 years at WheelLab, 750 bikes shipped to Zanzibar.
- At least 12 common repair guides, approximately 60 sample bikes and 3 shipments.
- Production screenshots and successful lint, typecheck, tests, build required before DONE status.

## Review Focus

- No-key and provider-error diagnosis must yield clearly labeled demo results.
- Image-only requests must avoid claiming that rules inspected the photo.
- Malformed stored data must recover; stage progression must preserve history.
- Narrow screens and keyboard navigation must expose all controls.
- Safety-critical repair instructions must avoid unsupported universal thresholds.

### Task 1: Domain audit

Files: `lib/ai/`, `lib/diagnosis/`, `lib/guides/`, `lib/store/`, related tests.

- [x] Compare provider API with requested structured generation and verify supported defaults.
- [x] Review guide mechanics and correct unsafe or ambiguous instructions.
- [x] Run domain tests; commit verified changes.

### Task 2: UI and workflow audit

Files: `components/`, `app/globals.css`, component tests.

- [x] Preserve existing shipment assignment work and verify add/advance/history/assignment flows.
- [x] Fix keyboard focus, responsive overflow, and accessible names where needed.
- [x] Run component tests and production browser checks; commit verified changes.

### Task 3: Documentation and delivery

Files: `README.md`, `.env.example`, `.github/workflows/ci.yml`, `scripts/screenshots.mjs`, `docs/screenshots/`.

- [x] Audit docs against final behavior and exact required story/license/demo line.
- [x] Run lint, typecheck, test, build; resolve failures.
- [x] Start production server; capture six Playwright screenshots and inspect desktop/mobile output.
- [x] Commit docs and screenshots, update vault handoff, verify clean git state, write DONE to `/workspace/bikedoc-status`.

## Verification record

- ESLint, `tsc --noEmit`, 193 Vitest tests, and production build passed.
- Playwright checked mobile light/dark routes, demo results, and add → advance → assign → shipped → reload persistence.
- Six screenshots captured against `npm run start`; desktop/mobile output inspected.
- Independent whole-project reviewer approved with no substantive findings. Live provider requests were not exercised without credentials.
- Ruling: retain the existing app and complete its gaps, as requested; no scaffolding replacement or remote operations.
