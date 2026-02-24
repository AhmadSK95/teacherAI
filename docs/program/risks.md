# TeachAssist AI — Risk Register

**Last Updated**: 2026-02-24

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|----|------|-----------|--------|------------|--------|
| R1 | SQLite scalability limits | Low | Medium | Using repository pattern for DB abstraction; can migrate to PostgreSQL | Accepted |
| R2 | AI model latency exceeds user expectations | Medium | High | Worker-based async processing; progress indicators in UI | Mitigated by architecture |
| R3 | FERPA compliance gaps in PII handling | Medium | Critical | Request-ID middleware, no PII in logs, PII redaction layer planned for Level 2 | In progress |
| R4 | Monorepo build times as codebase grows | Low | Low | Turborepo caching enabled; parallel builds | Accepted |
| R5 | Export format fidelity (Docs/Slides) | Medium | Medium | Placeholder; integration tests needed at Level 2 | Open |
| R6 | Prompt injection through teacher input | Medium | High | Policy service interface defined; deterministic checks planned for Level 1 | Open |
