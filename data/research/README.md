# TeachAssist Domain Research Database

This folder contains a local research datastore for TeachAssist AI domain planning.

## Files
- `teacherai_research.db`: SQLite database with curated domain sources and internal data blueprint.
- `init_research_db.sql`: schema and seed script used to build the database.
- `sources.csv`: exported source catalog.
- `internal_data_blueprint.csv`: exported internal product data blueprint.
- `acquisition_queue.csv`: exported action queue for acquisition and validation.

## Table Summary
- `sources` (45 rows)
  - External standards, compliance, integration APIs, public datasets, content licensing, and procurement references.
- `internal_data_blueprint` (12 rows)
  - Data entities needed to make the one-shot teacher agent reliable in production.
- `acquisition_queue` (8 rows)
  - Priority actions to convert research links into usable integration and policy assets.

## Quick Queries
```sql
-- Show highest-priority sources
SELECT source_id, category, name, url
FROM sources
WHERE priority = 1
ORDER BY category, source_id;

-- Compliance-focused sources
SELECT source_id, name, url
FROM sources
WHERE category = 'compliance_policy'
ORDER BY source_id;

-- Integration APIs for Phase 1
SELECT s.source_id, s.name, q.next_action
FROM sources s
JOIN acquisition_queue q ON q.source_id = s.source_id
WHERE q.target_phase = 'phase_1'
ORDER BY q.priority, s.source_id;

-- Internal data entities required for MVP
SELECT data_id, domain, description
FROM internal_data_blueprint
WHERE required_for_mvp = 1
ORDER BY data_id;
```

## Notes
- `last_verified` is set to `2026-02-22` for all source records in this seed.
- Some partner integrations require credentials or contracts (for example ClassLink sandbox and some district systems).
- Legal and licensing rows are research references, not legal advice.
