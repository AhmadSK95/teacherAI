import type Database from 'better-sqlite3';
import type { RequestEvent } from '@teachassist/schemas';
import type { RequestRepository } from './interfaces.js';

export class SqliteRequestRepository implements RequestRepository {
  constructor(private db: Database.Database) {}

  findById(id: string): RequestEvent | null {
    const row = this.db.prepare('SELECT * FROM request_event WHERE request_id = ?').get(id);
    return row ? this.toEntity(row) : null;
  }

  findByTeacherId(teacherId: string): RequestEvent[] {
    return this.db
      .prepare('SELECT * FROM request_event WHERE teacher_id = ?')
      .all(teacherId)
      .map((r) => this.toEntity(r));
  }

  findAll(): RequestEvent[] {
    return this.db.prepare('SELECT * FROM request_event').all().map((r) => this.toEntity(r));
  }

  create(entity: RequestEvent): RequestEvent {
    this.db
      .prepare(
        `INSERT INTO request_event (request_id, teacher_id, class_id, prompt_text, attachment_ids, inferred_intent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        entity.request_id,
        entity.teacher_id,
        entity.class_id ?? null,
        entity.prompt_text,
        JSON.stringify(entity.attachment_ids),
        entity.inferred_intent,
        entity.created_at,
      );
    return entity;
  }

  update(id: string, partial: Partial<RequestEvent>): RequestEvent | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...partial, request_id: id };
    this.db
      .prepare(
        `UPDATE request_event SET teacher_id = ?, class_id = ?, prompt_text = ?, attachment_ids = ?, inferred_intent = ? WHERE request_id = ?`,
      )
      .run(
        updated.teacher_id,
        updated.class_id ?? null,
        updated.prompt_text,
        JSON.stringify(updated.attachment_ids),
        updated.inferred_intent,
        id,
      );
    return updated;
  }

  delete(id: string): boolean {
    return this.db.prepare('DELETE FROM request_event WHERE request_id = ?').run(id).changes > 0;
  }

  private toEntity(row: unknown): RequestEvent {
    const r = row as Record<string, unknown>;
    return {
      request_id: r.request_id as string,
      teacher_id: r.teacher_id as string,
      class_id: (r.class_id as string) || undefined,
      prompt_text: r.prompt_text as string,
      attachment_ids: JSON.parse(r.attachment_ids as string),
      inferred_intent: r.inferred_intent as RequestEvent['inferred_intent'],
      created_at: r.created_at as string,
    };
  }
}
