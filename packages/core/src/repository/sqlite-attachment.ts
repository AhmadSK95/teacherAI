import type Database from 'better-sqlite3';
import type { AttachmentMeta } from '@teachassist/schemas';
import type { AttachmentRepository } from './interfaces.js';

export class SqliteAttachmentRepository implements AttachmentRepository {
  constructor(private db: Database.Database) {}

  findById(id: string): AttachmentMeta | null {
    const row = this.db.prepare('SELECT * FROM attachment_meta WHERE attachment_id = ?').get(id);
    return row ? this.toEntity(row) : null;
  }

  findByRequestId(requestId: string): AttachmentMeta[] {
    return this.db
      .prepare('SELECT * FROM attachment_meta WHERE request_id = ?')
      .all(requestId)
      .map((r) => this.toEntity(r));
  }

  findAll(): AttachmentMeta[] {
    return this.db.prepare('SELECT * FROM attachment_meta').all().map((r) => this.toEntity(r));
  }

  create(entity: AttachmentMeta): AttachmentMeta {
    this.db
      .prepare(
        `INSERT INTO attachment_meta (attachment_id, request_id, file_name, file_type, file_size_bytes, parse_success, extracted_topics, confidence, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        entity.attachment_id,
        entity.request_id,
        entity.file_name,
        entity.file_type,
        entity.file_size_bytes,
        entity.parse_success ? 1 : 0,
        JSON.stringify(entity.extracted_topics),
        entity.confidence ?? null,
        entity.created_at,
      );
    return entity;
  }

  update(id: string, partial: Partial<AttachmentMeta>): AttachmentMeta | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...partial, attachment_id: id };
    this.db
      .prepare(
        `UPDATE attachment_meta SET file_name = ?, file_type = ?, file_size_bytes = ?, parse_success = ?, extracted_topics = ?, confidence = ? WHERE attachment_id = ?`,
      )
      .run(
        updated.file_name,
        updated.file_type,
        updated.file_size_bytes,
        updated.parse_success ? 1 : 0,
        JSON.stringify(updated.extracted_topics),
        updated.confidence ?? null,
        id,
      );
    return updated;
  }

  delete(id: string): boolean {
    return this.db.prepare('DELETE FROM attachment_meta WHERE attachment_id = ?').run(id).changes > 0;
  }

  private toEntity(row: unknown): AttachmentMeta {
    const r = row as Record<string, unknown>;
    return {
      attachment_id: r.attachment_id as string,
      request_id: r.request_id as string,
      file_name: r.file_name as string,
      file_type: r.file_type as string,
      file_size_bytes: r.file_size_bytes as number,
      parse_success: Boolean(r.parse_success),
      extracted_topics: JSON.parse(r.extracted_topics as string),
      confidence: (r.confidence as number) ?? undefined,
      created_at: r.created_at as string,
    };
  }
}
