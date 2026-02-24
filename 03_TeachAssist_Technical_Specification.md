# TeachAssist AI - Technical Specification and Evaluation Criteria

Version: 1.0  
Date: 2026-02-24  
Primary Inputs:
- `/Users/moenuddeenahmadshaik/Desktop/teacherAI/01_TeachAssist_Business_Specification.md`
- `/Users/moenuddeenahmadshaik/Desktop/teacherAI/data/research/teacherai_research.db`

## 1. Purpose
This document translates the product BRD into a build-ready technical specification with strict evaluation and closure criteria for autonomous implementation by Claude.

This spec is designed for:
- App-first, minimal UI teacher ecosystem.
- One-shot prompt + file orchestration.
- US district/DOE readiness.
- ESL/ELL + SPED + general teacher workflows.
- High-autonomy execution with high-level human approvals.

## 2. Build Scope (P0/P1/P2)
### 2.1 P0 (Showable MVP)
- Main web app with:
  - `Today Workspace`
  - `Universal Composer`
  - `Output Workbench`
  - `Class Context`
  - `Delivery Hub`
- One-shot generation pipeline from prompt + optional files.
- Multi-artifact package generation in one run:
  - lesson deck output (Google Slides/PPTX)
  - worksheet output (PDF)
  - teacher-facing text output (in-app)
- Mild/Medium/Hot differentiation.
- Multilingual generation (EN/ES/FR baseline).
- Basic seating chart generation from roster fixture.
- Export + version history baseline.
- PII-safe logs, request IDs, and approval gates for high-risk outputs.

### 2.2 P1 (Post-MVP)
- OCR grading draft pipeline with rubric parsing.
- SPED draft assistant with deterministic pre-export checks.
- Google Classroom + roster integrations hardened.

### 2.3 P2 (Scale)
- Advanced district controls, deeper LMS writeback, and cross-school analytics.

## 3. System Architecture
### 3.1 Reference Architecture
- `apps/web`: Main teacher application (web-first responsive).
- `services/api`: Synchronous APIs, auth, orchestration entrypoint.
- `services/worker`: Async jobs for long-running generation/export.
- `packages/core`: Domain logic (planning, generation, constraints).
- `packages/schemas`: Shared typed contracts.
- `packages/prompts`: Prompt templates and policy-constrained generation instructions.
- `packages/evals`: Evaluation harness, fixtures, rubric logic.
- `infra`: Local/dev deployment assets.
- `tests`: Unit/integration/e2e suites.

### 3.2 Runtime Flow
1. Teacher submits request in `Universal Composer` with optional attachments.
2. API ingests request and writes `request_event`.
3. Orchestrator creates execution graph (`plan_graph`) with sub-tasks.
4. Worker executes tasks in parallel where safe:
   - lesson draft
   - tiering
   - multilingual variants
   - operations artifacts (if requested)
5. Artifacts are versioned and shown in `Output Workbench`.
6. Teacher edits/approves; exports through `Delivery Hub`.
7. Audit and feedback events are stored.

## 4. UX and Interaction Contract
### 4.1 UX Constraints
- Minimal visual density.
- <=3 visible steps from prompt entry to first preview.
- No modal overload.
- All generated outputs are grouped as one package per request.

### 4.2 Required Screens
- `Today Workspace`: active classes, queued tasks, last outputs.
- `Universal Composer`: prompt, attachments, class/language/output controls.
- `Output Workbench`: package tabs, edit loop, reasoning summary, source trace.
- `Delivery Hub`: export targets, naming, version tag, final push.
- `Class Context`: class profile, language profile, routine templates.

## 5. Domain Services
### 5.1 Intake and Parsing Service
Responsibilities:
- Normalize text/file/photo/voice metadata intake.
- Validate attachment types and size limits.
- Create source extraction records with confidence.

### 5.2 Planning and Orchestration Service
Responsibilities:
- Intent classification (`lesson`, `ops`, `grading`, `sped`, `communication`).
- Build directed execution plan with deterministic dependencies.
- Retry transient failures and preserve traceability.

### 5.3 Content Assembly Service
Responsibilities:
- Build lesson skeleton aligned to routine.
- Create requested artifacts by medium.
- Apply differentiation and language transforms.

### 5.4 ESL/ELL Service
Responsibilities:
- Tiering rules (Mild/Medium/Hot).
- Language variant generation.
- Vocabulary tables with home-language support.

### 5.5 SPED Copilot Service (Guardrailed)
Responsibilities:
- Draft support content only.
- Run deterministic checks before any final-export path.
- Enforce explicit teacher approval event.

### 5.6 Operations Service
Responsibilities:
- Seating chart generation with constraints.
- Class routine and contract template generation.

### 5.7 Delivery Service
Responsibilities:
- Export to Google Docs, Slides/PPTX, PDF, spreadsheet, in-app format.
- Maintain artifact versions and export logs.

### 5.8 Policy and Safety Service
Responsibilities:
- Redaction rules for logs.
- High-risk gate enforcement.
- Per-district policy toggle checks.

## 6. Data Model (Core)
Minimum entities:
- `teacher_profile`
- `class_profile`
- `request_event`
- `attachment_meta`
- `plan_graph`
- `artifact_output`
- `edit_event`
- `approval_event`
- `export_event`
- `outcome_feedback`
- `district_policy`
- `language_profile`

Reference source:
- `/Users/moenuddeenahmadshaik/Desktop/teacherAI/data/research/internal_data_blueprint.csv`

## 7. API Contract (P0)
### 7.1 Teacher and Class Context
- `POST /v1/teachers`
- `POST /v1/classes`
- `GET /v1/classes/{class_id}`

### 7.2 One-Shot Request Lifecycle
- `POST /v1/requests`
- `GET /v1/requests/{request_id}`
- `GET /v1/requests/{request_id}/plan`
- `GET /v1/requests/{request_id}/artifacts`

### 7.3 Artifact Editing and Approval
- `POST /v1/artifacts/{artifact_id}/edits`
- `POST /v1/artifacts/{artifact_id}/approve`
- `POST /v1/requests/{request_id}/export`

### 7.4 Safety and Audit
- `GET /v1/audit/{request_id}`
- `GET /v1/health`

## 8. Security, Privacy, and Compliance Controls
- Encrypted transport + encrypted at rest.
- Tenant-aware isolation at request and artifact level.
- No student data used for model training.
- PII redaction in logs by default.
- High-risk operations require explicit approval events.
- Compliance references must map to FERPA/COPPA/IDEA/504 policy controls.

## 9. Testing Strategy
### 9.1 Unit Tests
- Planner decomposition.
- Tiering logic.
- Language fallback behavior.
- Seating constraints.
- Policy gate checks.

### 9.2 Integration Tests
- End-to-end request ingestion to artifact generation.
- Multi-medium export flows.
- Approval gates on grading/SPED paths.

### 9.3 E2E Tests
- Teacher creates package from one request.
- Teacher revises output and re-exports.
- Teacher runs multilingual tiered flow with attachments.

### 9.4 Non-Functional Tests
- Load: concurrent request handling.
- Performance: preview and package latency thresholds.
- Reliability: retry + failure recovery.

## 10. Product Levels and Closure Model
Progress is level-based. Claude must not declare completion unless all closure checks in the current level pass.

### Level 0 - Foundation Ready
Deliverables:
- Repo scaffold, typed schemas, lint/test setup, baseline app shell.
Closure:
- 100% of required checks pass.
- CI green.
- No P0 blocker defects open.

### Level 1 - Core One-Shot Flow
Deliverables:
- Universal Composer -> Planner -> Output Workbench -> basic export.
Closure:
- Mandatory scenarios pass.
- Median preview <8 seconds on local benchmark.
- Audit log completeness >=99% for test runs.

### Level 2 - Teaching Package Quality
Deliverables:
- Lesson package + tiering + multilingual output + seating chart.
Closure:
- 100% pass on P0 scenario suite.
- Quality thresholds met for pedagogical and language checks.

### Level 3 - Showable MVP
Deliverables:
- End-to-end demo flow with real fixture data.
- High-risk approval gates.
- Release notes + operator runbook.
Closure:
- All P0 exit criteria satisfied.
- Demo script reproducible by third party using docs.

## 11. Evaluation Criteria (Strict)
### 11.1 Gate Model
All gates are blocking. A level is closed only when every gate is green.

Gate A: Functional completeness
- Every required story for current level implemented.
- No placeholder path in demo-critical flow.

Gate B: Quality and correctness
- Unit + integration + e2e coverage for touched components.
- No failing tests.
- No known Sev-1/Sev-2 defects.

Gate C: Performance
- Preview latency and package generation within thresholds.
- No unbounded retries or memory spikes in test workload.

Gate D: Safety/compliance
- PII redaction validated.
- Approval events enforced for high-risk outputs.
- Audit trail complete.

Gate E: Product UX quality
- <=3-step flow from prompt to first preview.
- Core screens functional and coherent.
- Usability smoke test passes with fixture teacher persona.

### 11.2 Minimum Pass Thresholds
- Functional scenario pass rate: 100% for P0 suite.
- Regression suite pass rate: 100%.
- Lint/type checks: 100%.
- Export integrity: 100% successful open/parse for generated artifacts in tests.
- Critical bug backlog at level close: 0 open.

### 11.3 Scenario Evaluation Matrix (P0)
Must-pass scenarios:
1. Prompt-only lesson generation.
2. Prompt + file adaptation to lesson package.
3. Multilingual EN/ES/FR package generation.
4. Mild/Medium/Hot differentiated package generation.
5. Seating chart generation from roster fixture.
6. Export to PDF and Slides/PPTX.
7. High-risk output requires approval before export.
8. Artifact revision and version history retrieval.

### 11.4 Defect Severity Policy
- Sev-1: security/compliance breach, data loss, production crash.
- Sev-2: wrong output in core flow, broken export, approval bypass.
- Sev-3: non-critical functional bug.
- Sev-4: cosmetic/docs issues.

Level closure policy:
- Sev-1/Sev-2 must be zero.
- Sev-3 allowed only with approved follow-up ticket and no P0 impact.

## 12. Required Build Outputs Per Iteration
For every iteration/slice Claude must produce:
- Plan.
- Files changed.
- Code and tests.
- Test evidence (commands + summary).
- Risk register updates.
- Next slice.

## 13. High-Level Human Approval Model
Human stays in loop only at these checkpoints:
- Approval 1: Level plan acceptance.
- Approval 2: Level closure acceptance.
- Approval 3: Scope/compliance change requests.

No line-level coding approvals required unless explicitly requested.

## 14. MVP Exit Criteria (Showable)
MVP is considered achieved only if all are true:
- One-shot request creates complete package in the app.
- Package includes at least two media types (for example Slides + PDF).
- Multilingual + differentiation flow passes.
- Teacher can review, edit, approve, and export.
- Audit trail and redaction checks pass.
- End-to-end demo runbook reproduces the flow from clean start.

## 15. Out of Scope for P0
- Fully autonomous grading publication.
- Fully autonomous SPED legal filing.
- Broad cross-LMS writeback coverage.
- Parent-side standalone application.

## 16. Implementation Notes for Claude
- Work vertically, not by isolated layers.
- Prefer deterministic logic for policy and constraint checks.
- Keep prompts and model interactions behind testable interfaces.
- Use fixture-based evaluation from day 1.
- Do not claim completion until level closure checklist is fully green.
