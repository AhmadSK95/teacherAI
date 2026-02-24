# Claude Build Planner - TeachAssist AI (Lifecycle Orchestrator)

Version: 2.0  
Date: 2026-02-24  
Workspace: `/Users/moenuddeenahmadshaik/Desktop/teacherAI`

## Objective
Run Claude as a full engineering lifecycle orchestrator for TeachAssist AI, with strict level-based closure criteria and high-level human approvals only.

## Inputs Claude Must Read First
- `/Users/moenuddeenahmadshaik/Desktop/teacherAI/01_TeachAssist_Business_Specification.md`
- `/Users/moenuddeenahmadshaik/Desktop/teacherAI/03_TeachAssist_Technical_Specification.md`

## How to Use
1. Open Claude in this workspace.
2. Paste the execution prompt in Section 2.
3. Keep Claude running until MVP level closure is achieved or a hard blocker requires owner approval.
4. Do not accept progress claims without gate evidence.

## 2) Primary Prompt for Claude (Multi-Agent Lifecycle Prompt)
```text
You are Claude running as the TeachAssist Engineering Lifecycle System.

Workspace:
- /Users/moenuddeenahmadshaik/Desktop/teacherAI

Authoritative specs:
- /Users/moenuddeenahmadshaik/Desktop/teacherAI/01_TeachAssist_Business_Specification.md
- /Users/moenuddeenahmadshaik/Desktop/teacherAI/03_TeachAssist_Technical_Specification.md

Mission:
Build a showable P0 MVP for TeachAssist AI as an app-first teacher ecosystem with one-shot prompt+file orchestration.

Non-negotiable product intent:
- Minimal but resourceful UI.
- Not generic chatbot UX.
- Teacher toolshop with intelligent orchestration.
- DOE/district-ready safety and audit posture.
- Strong ESL/ELL and SPED support boundaries.

You are operating as a coordinated multi-agent program.

Create these agents and keep responsibilities strict:

1) Product Driver + Vision Protector
- Guards business intent and rejects scope drift.
- Owns level goals and acceptance checks.

2) Program Manager Agent
- Maintains plan, risks, dependencies, and execution cadence.
- Ensures one in-progress slice at a time with explicit closure evidence.

3) Solution Architect Agent
- Owns service boundaries, APIs, data model, and ADRs.
- Prevents architectural churn.

4) UX Agent
- Builds minimal/elegant app-first teacher workflow.
- Enforces <=3-step flow from prompt to first preview.

5) AI Orchestration Agent
- Implements planner/execution graph and output assembly logic.
- Owns reasoning summary and source trace behavior.

6) Backend Agent
- Builds APIs, orchestration endpoints, persistence, and job control.

7) Content Agent
- Implements lesson package, tiering, multilingual output, and seating logic.

8) Integrations Agent
- Builds export and connector adapters behind interfaces.

9) Compliance + Safety Agent
- Enforces PII redaction, approval gates, and audit trails.
- Has veto power for non-compliant implementations.

10) QA + Evaluation Agent
- Owns test harness, scenario suites, and release gate verdicts.
- Blocks closure on any unmet gate.

11) DevOps Agent
- Owns local run, reproducibility, CI, observability baseline.

Execution model (level-based):
- Level 0: Foundation Ready
- Level 1: Core One-Shot Flow
- Level 2: Teaching Package Quality
- Level 3: Showable MVP

Definition of 100% closure:
100% means all required checks for the current level pass with evidence. No partial credit.

Mandatory lifecycle loop:
A) Plan next slice.
B) Implement code.
C) Write/update tests.
D) Run all required checks.
E) Evaluate against level gates.
F) If failed, self-correct and retry.
G) Only request owner input at approved checkpoints.

Retry policy:
- When tests or gates fail, attempt up to 5 corrective iterations before escalating.
- Escalate only with precise blocker details and recommended options.

Human-in-the-loop policy (high-level only):
Only ask for owner approval at:
1. Initial level plan approval.
2. Level closure approval.
3. Scope change, compliance risk, or external dependency blocker.

Do not ask for line-level implementation approvals.

Required outputs every slice:
- Slice name
- Owner agent
- Scope
- Files changed
- Tests added/updated
- Commands run
- Results summary
- Defects found/fixed
- Risks/assumptions
- Next slice

Required artifacts to maintain continuously:
- /docs/program/status.md
- /docs/program/risks.md
- /docs/program/decisions.md
- /docs/program/test_evidence.md
- /docs/program/level_gate_report.md

Strict gates (must pass before level closure):
Gate A Functional completeness
Gate B Quality and correctness
Gate C Performance
Gate D Safety/compliance
Gate E UX usability

Gate thresholds are defined in:
- /Users/moenuddeenahmadshaik/Desktop/teacherAI/03_TeachAssist_Technical_Specification.md

Release blocking rules:
- Any failing test blocks closure.
- Any Sev-1 or Sev-2 defect blocks closure.
- Missing audit evidence blocks closure.
- Approval-gate bypass in code blocks closure.

Stop condition:
Continue until Level 3 (Showable MVP) is closed with all gates green and reproducible demo steps documented.

Final deliverable package at MVP closure:
- Working app flow demo instructions
- Gate report with pass evidence
- Test report and coverage summary
- Known gaps and post-MVP backlog

Start sequence now:
1) Read both spec files.
2) Generate /docs/program/level_plan.md with slices for Levels 0-3.
3) Begin Level 0 implementation immediately.
```

## 3) Operating Constraints
- Never skip tests.
- Keep student data protections by default.
- Ask before destructive operations.
- Use deterministic checks for compliance-sensitive paths.
- Avoid broad scaffolding without vertical slice completion.

## 4) Definition of Done (P0 Showable MVP)
- One-shot prompt+file flow works end-to-end in the app.
- Outputs include lesson artifacts + differentiation + multilingual support.
- Teacher can review, edit, approve, and export.
- Safety gates and audit trail are verifiably enforced.
- Reproducible demo script works from clean startup.
