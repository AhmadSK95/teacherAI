import type Database from 'better-sqlite3';
import type { TeacherProfile } from '@teachassist/schemas';
import type { TeacherRepository } from './interfaces.js';

export class SqliteTeacherRepository implements TeacherRepository {
  constructor(private db: Database.Database) {}

  findById(id: string): TeacherProfile | null {
    const row = this.db.prepare('SELECT * FROM teacher_profile WHERE teacher_id = ?').get(id);
    return row ? this.toEntity(row) : null;
  }

  findByEmail(email: string): TeacherProfile | null {
    const row = this.db.prepare('SELECT * FROM teacher_profile WHERE email = ?').get(email);
    return row ? this.toEntity(row) : null;
  }

  findAll(): TeacherProfile[] {
    const rows = this.db.prepare('SELECT * FROM teacher_profile').all();
    return rows.map((r) => this.toEntity(r));
  }

  create(entity: TeacherProfile): TeacherProfile {
    this.db
      .prepare(
        `INSERT INTO teacher_profile (teacher_id, email, display_name, grade_bands, subjects, preferred_languages, output_defaults, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        entity.teacher_id,
        entity.email,
        entity.display_name,
        JSON.stringify(entity.grade_bands),
        JSON.stringify(entity.subjects),
        JSON.stringify(entity.preferred_languages),
        JSON.stringify(entity.output_defaults),
        entity.created_at,
        entity.updated_at,
      );
    return entity;
  }

  update(id: string, partial: Partial<TeacherProfile>): TeacherProfile | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...partial, teacher_id: id };
    this.db
      .prepare(
        `UPDATE teacher_profile SET email = ?, display_name = ?, grade_bands = ?, subjects = ?, preferred_languages = ?, output_defaults = ?, updated_at = ? WHERE teacher_id = ?`,
      )
      .run(
        updated.email,
        updated.display_name,
        JSON.stringify(updated.grade_bands),
        JSON.stringify(updated.subjects),
        JSON.stringify(updated.preferred_languages),
        JSON.stringify(updated.output_defaults),
        updated.updated_at,
        id,
      );
    return updated;
  }

  delete(id: string): boolean {
    const result = this.db
      .prepare('DELETE FROM teacher_profile WHERE teacher_id = ?')
      .run(id);
    return result.changes > 0;
  }

  private toEntity(row: unknown): TeacherProfile {
    const r = row as Record<string, unknown>;
    return {
      teacher_id: r.teacher_id as string,
      email: r.email as string,
      display_name: r.display_name as string,
      grade_bands: JSON.parse(r.grade_bands as string),
      subjects: JSON.parse(r.subjects as string),
      preferred_languages: JSON.parse(r.preferred_languages as string),
      output_defaults: JSON.parse(r.output_defaults as string),
      created_at: r.created_at as string,
      updated_at: r.updated_at as string,
    };
  }
}
