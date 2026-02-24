# TeachAssist AI — Test Evidence

**Date**: 2026-02-24
**Level**: 1 — Core One-Shot Flow

## Full Test Run

```
$ npm test (turbo run test)

 Tasks:    11 successful, 11 total
 Time:     ~1.3s
```

## Package Breakdown

| Package | Test File | Tests | Status |
|---------|-----------|-------|--------|
| @teachassist/schemas | entities.test.ts | 22 | Pass |
| @teachassist/core | repositories.test.ts | 11 | Pass |
| @teachassist/core | intake-service.test.ts | 10 | Pass |
| @teachassist/core | planning-service.test.ts | 4 | Pass |
| @teachassist/core | content-assembly-service.test.ts | 5 | Pass |
| @teachassist/core | policy-service.test.ts | 5 | Pass |
| @teachassist/core | delivery-service.test.ts | 4 | Pass |
| @teachassist/api | api.test.ts | 19 | Pass |
| @teachassist/api | e2e-flow.test.ts | 5 | Pass |
| @teachassist/worker | queue.test.ts | 5 | Pass |
| @teachassist/worker | generate-package.test.ts | 3 | Pass |
| @teachassist/web | App.test.tsx | 14 | Pass |
| @teachassist/prompts | prompts.test.ts | 9 | Pass |
| @teachassist/evals | runner.test.ts | 4 | Pass |
| **Total** | **14 files** | **120** | **All Pass** |

## Typecheck

```
$ npm run typecheck (turbo run typecheck)

 Tasks:    11 successful, 11 total
 Time:     ~0.8s
```

All packages typecheck with zero errors under strict mode.

## Build

```
$ npm run build (turbo run build)

 Tasks:    7 successful, 7 total
 Time:     ~0.9s
```

All packages build successfully.

## Test Coverage Areas

### Level 0 (carried forward)
- **Schemas**: Positive + negative validation for all 12 entities, enum validation, default values
- **Core Repos**: CRUD operations for teacher, class, request, artifact, plan_graph repositories
- **Prompts**: Template registry CRUD, variable rendering, built-in templates
- **Evals**: Eval runner pass/fail cases, suite execution, keyword/length checks

### Level 1 (new)
- **Intake Service**: Intent classification for 7 intent types, request persistence, optional class_id
- **Planning Service**: Plan graph creation, task node mapping per intent, persistence
- **Content Assembly Service**: Artifact generation via MockAIProvider, node status updates, plan completion
- **Policy Service**: PII detection (SSN patterns), high-risk intent flagging (IEP), compliance checks
- **Delivery Service**: Markdown export, HTML/PDF export, content type headers
- **API Routes**: Request creation (201), validation (400), retrieval, plan lookup, artifact listing
- **Teacher/Class CRUD**: GET/PUT teacher profile, POST/GET/PUT classes
- **Export Endpoints**: Markdown and HTML download with Content-Disposition
- **Worker Handler**: Job processing, artifact storage, queue integration
- **E2E Flow**: Full prompt→plan→generate→artifacts→export pipeline (5 scenarios)
- **UI Components**: Composer form, disabled/enabled button states, API error display, workbench loading/display
