import type Database from 'better-sqlite3';
import type { ArtifactOutput } from '@teachassist/schemas';
import type { ArtifactRepository } from './interfaces.js';

export class SqliteArtifactRepository implements ArtifactRepository {
  constructor(private db: Database.Database) {}

  findById(id: string): ArtifactOutput | null {
    const row = this.db.prepare('SELECT * FROM artifact_output WHERE artifact_id = ?').get(id);
    return row ? this.toEntity(row) : null;
  }

  findByRequestId(requestId: string): ArtifactOutput[] {
    return this.db
      .prepare('SELECT * FROM artifact_output WHERE request_id = ?')
      .all(requestId)
      .map((r) => this.toEntity(r));
  }

  findAll(): ArtifactOutput[] {
    return this.db.prepare('SELECT * FROM artifact_output').all().map((r) => this.toEntity(r));
  }

  create(entity: ArtifactOutput): ArtifactOutput {
    this.db
      .prepare(
        `INSERT INTO artifact_output (artifact_id, request_id, plan_id, medium_type, language, tier, version, content, metadata, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        entity.artifact_id,
        entity.request_id,
        entity.plan_id,
        entity.medium_type,
        entity.language,
        entity.tier ?? null,
        entity.version,
        entity.content,
        JSON.stringify(entity.metadata),
        entity.created_at,
      );
    return entity;
  }

  update(id: string, partial: Partial<ArtifactOutput>): ArtifactOutput | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updated = { ...existing, ...partial, artifact_id: id };
    this.db
      .prepare(
        `UPDATE artifact_output SET medium_type = ?, language = ?, tier = ?, version = ?, content = ?, metadata = ? WHERE artifact_id = ?`,
      )
      .run(
        updated.medium_type,
        updated.language,
        updated.tier ?? null,
        updated.version,
        updated.content,
        JSON.stringify(updated.metadata),
        id,
      );
    return updated;
  }

  delete(id: string): boolean {
    return this.db.prepare('DELETE FROM artifact_output WHERE artifact_id = ?').run(id).changes > 0;
  }

  private toEntity(row: unknown): ArtifactOutput {
    const r = row as Record<string, unknown>;
    return {
      artifact_id: r.artifact_id as string,
      request_id: r.request_id as string,
      plan_id: r.plan_id as string,
      medium_type: r.medium_type as ArtifactOutput['medium_type'],
      language: r.language as ArtifactOutput['language'],
      tier: (r.tier as ArtifactOutput['tier']) || undefined,
      version: r.version as number,
      content: r.content as string,
      metadata: JSON.parse(r.metadata as string),
      created_at: r.created_at as string,
    };
  }
}
