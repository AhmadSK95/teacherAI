# TeachAssist AI - Business Specification (App-First Teacher Ecosystem)

Version: 1.1  
Date: 2026-02-22  
Workspace: /Users/moenuddeenahmadshaik/Desktop/teacherAI

## 1. Purpose
This specification defines a build-ready, app-first product for US public school teachers. It updates prior chat-first framing to match the product vision: a minimal but resourceful teacher workspace where an intelligent agent assembles complete outputs from one prompt plus optional files.

## 2. Source Inputs
- `BXIHS Literacy 25-26.pptx` (ground-truth classroom artifact deck)
- Consolidated BRD content captured in this document (v1.1, 2026-02-22)
- `/Users/moenuddeenahmadshaik/Desktop/teacherAI/data/research/research_snapshot.md` (domain research summary)
- Founder direction (2026-02-22): app-first teacher ecosystem, not generic AI chat, not AI courseware.

## 3. Product Vision and Positioning
TeachAssist AI is a teacher toolshop with one intelligent AI agent that assembles whatever a teacher needs to do their job efficiently.

Positioning:
- Not a menu of disconnected AI tools.
- Not a generic chatbot interface.
- Not an AI course-selling platform.
- A focused teacher operating workspace for planning, differentiation, classroom operations, grading support, and family communication.

Core promise:
- One input flow: prompt + optional files/photos/voice.
- One orchestration run: agent decomposes work, reasons across context, and generates a complete deliverable set.
- Many output options: teacher chooses delivery medium (Google Docs, Slides/PPTX, PDF, spreadsheet, in-app text, multilingual variants).

## 4. Target Users and Buyers
Primary user segments:
- US Grades 6-12 general education teachers.
- US ESL/ELL teachers.
- US Special Education teachers and case managers.

Secondary users:
- Instructional coaches and department leads.
- School administrators.

Economic buyer:
- District and DOE-level curriculum, technology, multilingual services, and special-services leadership.

Procurement target:
- District/DOE pilot programs requiring privacy, auditability, and clear teacher time-savings evidence.

## 5. Ground-Truth Classroom Evidence
`BXIHS Literacy 25-26.pptx` confirms repeated daily structure, multilingual delivery needs, and differentiated outputs:
- High-frequency routines: agenda, Do Now, rules, breathing, closing activities.
- Repeated tiering model: `Mild/Medium/Hot`.
- Repeated multilingual supports: English/Spanish/French.
- Frequent classroom operations artifacts: seating charts, class contracts, participation structures.

Implication:
- Teachers need a reusable ecosystem with persistent class context, not one-off question/answer chat sessions.

## 6. Product Principles
- `P-01 Minimal Interface, Maximum Utility`: clean UI with low cognitive load and high output power.
- `P-02 One-Shot Assembly`: single request can produce a full package across multiple artifact types.
- `P-03 Teacher Control`: AI drafts and assembles; teacher remains final decision maker.
- `P-04 Multilingual by Default`: translation and language supports are baseline behavior.
- `P-05 Evidence-Aware Intelligence`: outputs include reasoning summary and source trace where relevant.
- `P-06 District/DOE Ready`: compliance, audit logs, and secure integrations are first-class requirements.

## 7. Product Definition (Main App Experience)
TeachAssist AI is a web-first application with optional mobile optimization and optional messaging extensions.

Main app surfaces:
- `Today Workspace`: class-day dashboard with active tasks, pending outputs, and quick actions.
- `Universal Composer`: one input bar for prompts + file/photo/voice attachments.
- `Output Workbench`: generated artifacts, variants, revision controls, and export actions.
- `Class Context`: classroom profile, language settings, roster snapshots, and recurring routines.
- `Delivery Hub`: publish/send/export to selected medium (Docs, Slides, PDF, spreadsheet, messaging copy).

Messaging role:
- Messaging channels (WhatsApp/SMS/Chat) are support channels for notifications, quick capture, and lightweight actions, not the primary product surface.

## 8. One-Shot Workflow Definition
1. Teacher enters request in Universal Composer and optionally attaches files/photos/voice.
2. Agent classifies intent and proposes execution plan (visible to teacher).
3. Agent assembles outputs in parallel (lesson assets, differentiated versions, multilingual variants, communication drafts, operational artifacts).
4. Teacher reviews in Output Workbench, requests edits, and approves.
5. Teacher exports or sends through preferred delivery medium.

One-shot means:
- Multi-artifact package from one request.
- Multi-language and tiering in one run.
- Minimal manual copy/paste between tools.

## 9. Scope by Release
### 9.1 Phase 1 (0-6 months) - Core Teacher Workspace
In scope:
- Web app with minimal/elegant UI and Universal Composer.
- Prompt + file/photo intake.
- One-shot lesson package assembly (slides, worksheets, vocabulary, discussion supports).
- Mild/Medium/Hot differentiation in one run.
- Default multilingual output (English/Spanish/French configurable per class).
- Basic seating chart and class operations artifacts.
- Output Workbench with export to Google Docs/Slides/PDF/PPTX.
- Evidence/reasoning summary panel for generated outputs.
- PII-safe logs and audit basics.

Out of scope:
- Fully autonomous grading finalization without teacher review.
- Full SPED legal workflow automation and final filing.
- Broad LMS writeback coverage beyond launch integrations.

### 9.2 Phase 2 (6-12 months) - District Workflow Depth
- OCR grading pipeline with rubric alignment and teacher review gates.
- Expanded DOE-ready admin controls and policy configuration.
- IEP/504 draft assistant with deterministic compliance checks.
- Assignment sync and selective grade passback for priority LMS targets.

### 9.3 Phase 3 (12-24 months) - Multi-School Ecosystem
- Deeper district integrations and analytics.
- Template sharing and controlled content packs.
- Advanced automation for recurring teacher workflows.

## 10. Functional Requirements (Build-Ready)
Requirement IDs use `FR-*` and must be testable.

### 10.1 App Shell and Core UX
- FR-01: Provide a web app main UI with `Today Workspace`, `Universal Composer`, `Output Workbench`, and `Delivery Hub`.
- FR-02: Keep primary creation flow to <=3 visible steps from prompt entry to first artifact output.
- FR-03: Support prompt intake with optional file/photo/voice attachments in one composer action.
- FR-04: Persist class profile settings (subjects, grade, routine blocks, default languages, output preferences).

Acceptance:
- First-time teacher can generate and export first package in <=10 minutes onboarding.
- Returning teacher can create a package from composer in <=3 clicks after prompt entry.

### 10.2 Intelligent Assembly Engine
- FR-10: Decompose a request into sub-tasks (lesson, differentiation, translation, communication, operations) when relevant.
- FR-11: Generate multiple artifact types in one run without requiring separate prompts.
- FR-12: Provide concise reasoning summary for key output decisions.
- FR-13: Where source files are provided, map output elements to detected source evidence.
- FR-14: Allow teacher overrides for tone, grade level, complexity, language, and medium.

Acceptance:
- >=80% of pilot requests produce a complete multi-artifact package in one run.
- Median time to first package preview <3 minutes.

### 10.3 Lesson and Literacy Output
- FR-20: Generate lesson skeleton aligned to classroom routine (greeting, agenda, Do Now, instruction, practice, closing).
- FR-21: Produce slide-ready and print-ready artifacts in the same run.
- FR-22: Include optional 5W comprehension and sentence frames when literacy activity is detected.
- FR-23: Support teacher-facing instructions and answer key toggles.

Acceptance:
- Complete lesson package with at least one presentation artifact and one printable artifact in one request.

### 10.4 ESL/ELL and Multilingual Support
- FR-30: Produce Mild/Medium/Hot tiered variants by default when requested.
- FR-31: Generate multilingual output from class language profile (default EN/ES/FR in pilot).
- FR-32: Preserve instructional meaning and vocabulary intent, not literal-only translation.
- FR-33: Output vocabulary supports with home-language columns.

Acceptance:
- Single request produces tiered multilingual outputs without reruns in >=90% of pilot scenarios.

### 10.5 SPED Support (Teacher Copilot, Not Replacement)
- FR-40: Draft SPED support artifacts (goals, accommodations summaries, progress-note drafts) from teacher prompts and files.
- FR-41: Gate high-risk outputs behind explicit teacher review and approval.
- FR-42: Run deterministic compliance checks before final IEP/504 export in supported flows.

Acceptance:
- No SPED final-export workflow completes without explicit teacher confirmation.

### 10.6 Grading and Assessment Support
- FR-50: Parse rubric files and student work images/docs for draft scoring.
- FR-51: Produce per-student draft feedback and class-level misconception summaries.
- FR-52: Require teacher confirmation before publishing any grade outputs.

Acceptance:
- Pilot benchmark agreement target: >85% vs human rubric scoring on selected tasks.

### 10.7 Classroom Operations
- FR-60: Generate seating charts from roster + constraints (group size, language mix, behavior flags).
- FR-61: Produce class contracts, participation rubrics, and classroom routine templates.
- FR-62: Export operations artifacts as image/PDF/editable formats.

Acceptance:
- Seating plan for 24 students generated in <60 seconds median.

### 10.8 Delivery Medium and Distribution
- FR-70: Export outputs to Google Docs, Google Slides/PPTX, PDF, spreadsheet, and in-app rich text.
- FR-71: Support batch export for multi-artifact packages.
- FR-72: Keep version history for artifacts and revisions.

Acceptance:
- Teacher can deliver a complete package to preferred medium without manual reformatting.

### 10.9 Messaging Extensions (Secondary)
- FR-80: Accept quick-capture requests from messaging channels.
- FR-81: Return links/previews to artifacts generated in main app workspace.
- FR-82: Maintain feature parity for core safety and approval gates across channels.

Acceptance:
- Messaging users can continue work in the main app without losing context.

## 11. Non-Functional Requirements
- NFR-01 Security: TLS 1.3 in transit, AES-256 at rest, tenant isolation.
- NFR-02 Privacy: no student data used for model training; minimal retention defaults.
- NFR-03 Reliability: 99.5% monthly uptime target for core APIs.
- NFR-04 Performance: p95 time-to-first-preview <8 seconds; median full package <3 minutes.
- NFR-05 Auditability: request IDs, model/version traceability, artifact provenance, approval events.
- NFR-06 Human-in-the-loop: mandatory confirmation for high-risk outputs (grades, IEP/504 final docs).
- NFR-07 Accessibility: WCAG 2.1 AA baseline for educator workflows.

## 12. Data and Integration Requirements
Launch integrations:
- Identity: Clever, ClassLink, Google OAuth, Microsoft Entra ID, SAML 2.0.
- Rostering: OneRoster via Clever/ClassLink/Edlink.
- LMS priorities: Google Classroom, Canvas, Schoology (phased writeback).
- Storage/delivery: Google Drive plus direct export downloads.
- Messaging extensions: WhatsApp Business API, SMS, Google Chat, Teams.

Data principles:
- District student data accessed via secure API and minimized in processing.
- PII redaction in logs and observability streams.
- Configurable data retention and deletion workflows per district policy.

## 13. Compliance and Governance Requirements
- FERPA-aligned DPA and district data governance workflows.
- COPPA controls for under-13 contexts where applicable.
- IDEA/Section 504 safeguards with deterministic checks on supported flows.
- State and DOE policy configuration layer for district-specific rules.
- Admin-facing audit and review tools for procurement confidence.

## 14. KPIs and Success Metrics
North-star:
- Weekly active teachers completing one-shot multi-artifact workflows in the main app.

Operational KPIs:
- Time saved per teacher/week (target: 5+ hours).
- One-shot completion rate (target: >=70% of qualified prompts produce usable package first run).
- Median package generation time (target: <3 min).
- Multilingual output adoption rate in ESL/ELL classrooms.
- Pilot NPS (target: >=50).
- Privacy/compliance incidents (target: 0).
- Pilot-to-paid district conversion (target: >=80%).

## 15. Delivery and Acceptance Gates
Gate A - Product usability readiness:
- Main app UI complete and teacher-testable.
- One-shot package generation live with export actions.
- ESL/ELL multilingual tiering validated in pilot scenarios.

Gate B - District/DOE readiness:
- SSO and roster sync hardened.
- Compliance controls and audit logs available.
- Security review and incident-response runbook complete.

Gate C - Scale readiness:
- Multi-tenant observability and cost controls.
- Performance resilience under concurrent school usage.
- Standardized district onboarding playbook.

## 16. Open Decisions to Resolve Early
- Initial LMS writeback scope (read-only first vs limited writeback in pilot).
- Initial SPED assistant depth in Phase 1 (draft-only vs draft + compliance precheck).
- Default evidence display mode (always visible vs optional panel).
- District-configured language bundles vs EN/ES/FR default baseline.
- First mobile strategy (responsive web only vs dedicated app shell in Phase 1).

## 17. Final Build Direction
Build TeachAssist AI as a minimal, elegant, app-first teacher ecosystem where one prompt plus optional files yields a complete, deliverable package across teacher-preferred media. Messaging remains a supporting channel. The MVP quality bar is practical teacher empowerment: less tool switching, faster preparation, stronger multilingual/SPED support, and safer district-ready workflows.
