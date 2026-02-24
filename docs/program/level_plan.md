# TeachAssist AI — Level Plan (Levels 0–3)

## Level 0: Foundation Ready (COMPLETE)

Repo scaffold, typed schemas, lint/test setup, baseline app shell.

- Slice 1: Root monorepo scaffold (npm workspaces + Turborepo)
- Slice 2: Shared config packages (TypeScript, ESLint, Prettier)
- Slice 3: packages/schemas (12 Zod entity schemas + enums)
- Slice 4: packages/core (Repository interfaces, SQLite repos, migrations)
- Slice 5: services/api + services/worker (Express app, health endpoint, job queue)
- Slice 6: apps/web (React app shell, 5 placeholder pages)
- Slice 7: packages/prompts + packages/evals + infra (Templates, eval runner, Docker)
- Slice 8: docs/program + gate verification

## Level 1: Core One-Shot Flow

Composer -> Planner -> Workbench -> Export end-to-end.

- Slice 9: Universal Composer UI (prompt input, file upload, submit)
- Slice 10: Intake service (parse prompt, infer intent, create request_event)
- Slice 11: Planning service (decompose request into plan_graph)
- Slice 12: Content assembly service (execute plan nodes, generate artifacts)
- Slice 13: Output Workbench UI (display artifacts, version navigation)
- Slice 14: Basic export flow (Markdown/PDF download)
- Slice 15: End-to-end integration test (Composer → Export)
- Slice 16: Level 1 gate verification

## Level 2: Teaching Package Quality

Lesson + tiering + multilingual + seating chart.

- Slice 17: Lesson plan generation with standards alignment
- Slice 18: Tiered differentiation (approaching, on-level, advanced)
- Slice 19: Multilingual variant generation (ESL/ELL support)
- Slice 20: Seating chart generator
- Slice 21: Class Context UI (class profiles, language profiles, roster)
- Slice 22: Approval workflow for high-risk outputs
- Slice 23: Feedback collection (usefulness score, time saved)
- Slice 24: Level 2 gate verification

## Level 3: Showable MVP

End-to-end demo, all gates green, reproducible demo script.

- Slice 25: Delivery Hub UI (Google Docs, Slides, PDF export)
- Slice 26: Today Workspace (dashboard with active tasks, pending outputs)
- Slice 27: Polish UX (loading states, error handling, responsive refinement)
- Slice 28: Demo data seeding (realistic teacher, classes, requests)
- Slice 29: Demo script (reproducible walkthrough)
- Slice 30: Performance optimization and final safety review
- Slice 31: E2E test suite (Cypress/Playwright)
- Slice 32: Level 3 gate verification + MVP declaration
