# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TeachAssist AI is an app-first intelligent teacher ecosystem for US public school teachers (Grades 6-12, ESL/ELL, Special Education). Core promise: one prompt + optional files → one orchestration run → complete deliverable package (Google Docs, Slides/PPTX, PDF, multilingual variants).

**Not** a generic chatbot, menu of disconnected tools, or AI courseware platform.

## Authoritative Specifications

- `01_TeachAssist_Business_Specification.md` — Product vision, user segments, functional requirements, KPIs
- `02_Claude_Build_Planner.md` — Execution framework, multi-agent model, level-based closure criteria
- `03_TeachAssist_Technical_Specification.md` — Technical architecture, API contracts, data model, evaluation gates

## Architecture

```
apps/web/              → React + TypeScript frontend (web-first responsive)
services/api/          → Express API server — auth, orchestration entrypoint, sync endpoints
services/worker/       → Async job runner for long-running generation/export
packages/core/         → Domain logic (planning, generation, constraints, tiering)
packages/schemas/      → Shared Zod schemas and TypeScript types
packages/prompts/      → Prompt templates and policy-constrained instructions
packages/evals/        → Evaluation harness, fixtures, rubric logic
infra/                 → Local/dev deployment (Docker, scripts)
tests/                 → Unit/integration/e2e test suites
docs/program/          → Status, risks, decisions, test evidence, gate reports
data/research/         → Research DB (SQLite), domain sources, data blueprint
```

### Runtime Flow

1. Teacher submits in **Universal Composer** (prompt + optional attachments)
2. API ingests → writes `request_event` → creates `plan_graph`
3. Worker executes parallel tasks: lesson draft, tiering, multilingual variants, ops artifacts
4. Artifacts versioned in **Output Workbench** → teacher reviews/edits/approves
5. Export via **Delivery Hub** to chosen medium
6. Audit + feedback events logged

### Key UX Surfaces

- **Today Workspace** — Dashboard with active tasks, pending outputs
- **Universal Composer** — Single input bar (prompt + file/photo/voice)
- **Output Workbench** — Generated artifacts, variants, revision controls
- **Class Context** — Class profile, language settings, roster, routines
- **Delivery Hub** — Export to Docs, Slides, PDF, spreadsheet

### Data Model (12 core entities)

`teacher_profile`, `class_profile`, `request_event`, `attachment_meta`, `plan_graph`, `artifact_output`, `edit_event`, `approval_event`, `export_event`, `outcome_feedback`, `district_policy`, `language_profile`

Blueprint reference: `data/research/internal_data_blueprint.csv`

## Build Commands

```bash
# Install all dependencies (monorepo)
npm install

# Development
npm run dev              # Start all services in dev mode
npm run dev:web          # Frontend only
npm run dev:api          # API server only
npm run dev:worker       # Worker only

# Testing
npm test                 # Run all tests
npm run test:unit        # Unit tests only
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests
npm run test -- --grep "pattern"  # Run single test by pattern

# Linting & Type Checking
npm run lint             # ESLint
npm run typecheck        # TypeScript compiler checks

# Build
npm run build            # Production build all packages
```

## Key Design Principles

- **Vertical slices**: Build end-to-end flows, not isolated layers
- **Deterministic compliance**: Policy/constraint checks use deterministic logic, not LLM judgment
- **Testable AI interfaces**: All prompt/model interactions sit behind testable interfaces
- **Fixture-based evaluation**: Use fixture data from day 1; no mocked AI in evaluation tests
- **<=3 steps**: Prompt entry to first preview must be 3 or fewer visible steps
- **One-shot assembly**: Single request → complete multi-artifact package

## Product Levels (Closure Model)

- **Level 0** — Foundation: repo scaffold, schemas, lint/test setup, baseline app shell
- **Level 1** — Core One-Shot Flow: Composer → Planner → Workbench → export
- **Level 2** — Teaching Package Quality: lesson + tiering + multilingual + seating
- **Level 3** — Showable MVP: end-to-end demo, all gates green, reproducible demo script

Each level has 5 blocking gates: Functional (A), Quality (B), Performance (C), Safety (D), UX (E).

## Compliance Posture

- FERPA/COPPA/IDEA/Section 504 alignment required
- PII redaction in logs by default
- High-risk outputs (grades, SPED) require explicit teacher approval events
- No student data used for model training
- Tenant isolation at request and artifact level

## Program Artifacts (kept current)

- `docs/program/status.md` — Current progress
- `docs/program/risks.md` — Risk register
- `docs/program/decisions.md` — Architecture Decision Records
- `docs/program/test_evidence.md` — Test run results
- `docs/program/level_gate_report.md` — Gate pass/fail evidence
- `docs/program/level_plan.md` — Slice plan for Levels 0-3
