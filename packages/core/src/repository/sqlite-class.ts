import type Database from 'better-sqlite3';
import type { ClassProfile } from '@teachassist/schemas';
import type { ClassRepository } from './interfaces.js';

export class SqliteClassRepository implements ClassRepository {
  constructor(private db: Database.Database) {}

  findById(id: string): ClassProfile | null {
    const row = this.db.prepare('SELECT * FROM class_profile WHERE class_id = ?').get(id);
    return row ? this.toEntity(row) : null;
  }

  findByTeacherId(teacherId: string): ClassProfile[] {
    const rows = this.db
      .prepare('SELECT * FROM class_profile WHERE teacher_id = ?')
      .all(teacherId);
    return rows.map((r) => this.toEntity(r));
  }

  findAll(): ClassProfile[] {
    return this.db.prepare('SELECT * FROM class_profile').all().map((r) => this.toEntity(r));
  }

  create(entity: ClassProfile): ClassProfile {
    this.db
      .prepare(
        `INSERT INTO class_profile (class_id, teacher_id, name, grade, subject, period_length_minutes, roster_count, support_flags, routine_blocks, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        entity.class_id,
        entity.teacher_id,
        entity.name,
        entity.grade,
        entity.subject,
        entity.period_length_minutes,
        entity.roster_count,
        JSON.stringify(entity.support_flags),
        JSON.stringify(entity.routine_blocks),
        entity.created_at,
        entity.updated_at,
      );
    return entity;
  }

  update(id: string, partial: Partial<ClassProfile>): ClassProfile | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...partial, class_id: id };
    this.db
      .prepare(
        `UPDATE class_profile SET teacher_id = ?, name = ?, grade = ?, subject = ?, period_length_minutes = ?, roster_count = ?, support_flags = ?, routine_blocks = ?, updated_at = ? WHERE class_id = ?`,
      )
      .run(
        updated.teacher_id,
        updated.name,
        updated.grade,
        updated.subject,
        updated.period_length_minutes,
        updated.roster_count,
        JSON.stringify(updated.support_flags),
        JSON.stringify(updated.routine_blocks),
        updated.updated_at,
        id,
      );
    return updated;
  }

  delete(id: string): boolean {
    return this.db.prepare('DELETE FROM class_profile WHERE class_id = ?').run(id).changes > 0;
  }

  private toEntity(row: unknown): ClassProfile {
    const r = row as Record<string, unknown>;
    return {
      class_id: r.class_id as string,
      teacher_id: r.teacher_id as string,
      name: r.name as string,
      grade: r.grade as number,
      subject: r.subject as string,
      period_length_minutes: r.period_length_minutes as number,
      roster_count: r.roster_count as number,
      support_flags: JSON.parse(r.support_flags as string),
      routine_blocks: JSON.parse(r.routine_blocks as string),
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}
