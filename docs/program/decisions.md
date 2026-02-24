# TeachAssist AI — Architecture Decision Records

## ADR-001: Monorepo with npm Workspaces + Turborepo

**Date**: 2026-02-24
**Status**: Accepted

**Context**: Need a monorepo solution for managing multiple packages (schemas, core, prompts, evals) and apps (web, api, worker).

**Decision**: Use npm workspaces for dependency management and Turborepo for task orchestration (build, test, lint, typecheck).

**Rationale**: Native npm support (no extra package manager), Turborepo adds caching and parallel execution with minimal config.

---

## ADR-002: Zod for Schema Validation

**Date**: 2026-02-24
**Status**: Accepted

**Context**: Need runtime validation and TypeScript types from a single source of truth for 12 entity types.

**Decision**: Use Zod as the schema definition layer in `packages/schemas`.

**Rationale**: Zod provides runtime validation + TypeScript type inference from a single schema definition. Avoids schema drift between validation and types.

---

## ADR-003: SQLite via better-sqlite3

**Date**: 2026-02-24
**Status**: Accepted

**Context**: Need a database for local development and MVP that matches the research database pattern.

**Decision**: Use SQLite via `better-sqlite3` with a repository pattern abstraction.

**Rationale**: Zero-config, file-based or in-memory, matches existing research SQLite DB. Repository interfaces allow future migration to PostgreSQL without domain logic changes.

---

## ADR-004: Express for API Server

**Date**: 2026-02-24
**Status**: Accepted

**Context**: Need a REST API server for the backend.

**Decision**: Use Express 4 with TypeScript, app factory pattern (`createApp()`) for testability.

**Rationale**: Mature ecosystem, simple middleware model, easy to test with supertest. App factory enables isolated test instances.

---

## ADR-005: Vite + React + TailwindCSS for Frontend

**Date**: 2026-02-24
**Status**: Accepted

**Context**: Need a modern frontend build tool and UI framework.

**Decision**: Vite for build/dev server, React 18 for UI, TailwindCSS for styling.

**Rationale**: Fast HMR, TypeScript support out of the box, utility-first CSS for rapid prototyping.

---

## ADR-006: Vitest for Testing

**Date**: 2026-02-24
**Status**: Accepted

**Context**: Need a test runner compatible with the Vite-based toolchain.

**Decision**: Use Vitest across all packages.

**Rationale**: TypeScript-native, Vite-compatible, fast execution, compatible with Jest API.

---

## ADR-007: In-Memory Job Queue for Worker

**Date**: 2026-02-24
**Status**: Accepted

**Context**: Need async job processing for long-running generation tasks.

**Decision**: Start with an in-memory queue implementation in the worker service.

**Rationale**: Sufficient for MVP/demo. Interface allows replacement with Redis/BullMQ at scale. Avoids infrastructure complexity at Level 0.

---

## ADR-008: MockAIProvider for Level 1

**Date**: 2026-02-24
**Status**: Accepted

**Context**: Level 1 needs realistic content generation without real LLM API calls.

**Decision**: Implement a `MockAIProvider` that returns fixture-based content per intent type (lesson plan, worksheet, assessment, etc.). The `AIProvider` interface allows swapping in real AI providers at Level 2+.

**Rationale**: Enables end-to-end flow testing without external dependencies. Fixture content is realistic (proper markdown structure, pedagogical elements) to validate the full pipeline. The interface abstraction (`AIProvider`) ensures clean separation.

---

## ADR-009: In-Process Worker for Level 1

**Date**: 2026-02-24
**Status**: Accepted

**Context**: Level 1 needs async job processing but doesn't require a separate worker process.

**Decision**: The generate-package handler runs in-process with the API server via a shared `InMemoryQueue` instance. Jobs are processed immediately via `setTimeout(() => queue.processNext(), 0)` after enqueuing.

**Rationale**: Simplifies deployment (single process), avoids IPC complexity, and is sufficient for demo/MVP where the mock provider returns instantly. The handler is factored as a standalone function (`createGeneratePackageHandler`) that can be moved to a separate worker process at Level 2+ without code changes.
