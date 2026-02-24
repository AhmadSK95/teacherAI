import type Database from 'better-sqlite3';
import type { PlanGraph } from '@teachassist/schemas';
import type { PlanGraphRepository } from './interfaces.js';

export class SqlitePlanGraphRepository implements PlanGraphRepository {
  constructor(private db: Database.Database) {}

  findById(id: string): PlanGraph | null {
    const row = this.db.prepare('SELECT * FROM plan_graph WHERE plan_id = ?').get(id);
    return row ? this.toEntity(row) : null;
  }

  findByRequestId(requestId: string): PlanGraph | null {
    const row = this.db
      .prepare('SELECT * FROM plan_graph WHERE request_id = ?')
      .get(requestId);
    return row ? this.toEntity(row) : null;
  }

  findAll(): PlanGraph[] {
    return this.db.prepare('SELECT * FROM plan_graph').all().map((r) => this.toEntity(r));
  }

  create(entity: PlanGraph): PlanGraph {
    this.db
      .prepare(
        `INSERT INTO plan_graph (plan_id, request_id, task_nodes, dependency_edges, created_at, completed_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        entity.plan_id,
        entity.request_id,
        JSON.stringify(entity.task_nodes),
        JSON.stringify(entity.dependency_edges),
        entity.created_at,
        entity.completed_at ?? null,
      );
    return entity;
  }

  update(id: string, partial: Partial<PlanGraph>): PlanGraph | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...partial, plan_id: id };
    this.db
      .prepare(
        `UPDATE plan_graph SET task_nodes = ?, dependency_edges = ?, completed_at = ? WHERE plan_id = ?`,
      )
      .run(
        JSON.stringify(updated.task_nodes),
        JSON.stringify(updated.dependency_edges),
        updated.completed_at ?? null,
        id,
      );
    return updated;
  }

  delete(id: string): boolean {
    return this.db.prepare('DELETE FROM plan_graph WHERE plan_id = ?').run(id).changes > 0;
  }

  private toEntity(row: unknown): PlanGraph {
    const r = row as Record<string, unknown>;
    return {
      plan_id: r.plan_id as string,
      request_id: r.request_id as string,
      task_nodes: JSON.parse(r.task_nodes as string),
      dependency_edges: JSON.parse(r.dependency_edges as string),
      created_at: r.created_at as string,
      completed_at: (r.completed_at as string) || undefined,
    };
  }
}
