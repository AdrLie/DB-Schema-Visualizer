import { describe, it, expect } from 'vitest';
import { PrismaExporter, PostgresExporter } from '../src/index';
import { DatabaseSchema } from '@schemaflow/schema-core';

describe('Exporters', () => {
  const schema = {
    tables: [
      {
        id: 'table1',
        name: 'users',
        columns: [
          { id: '1', name: 'id', type: 'UUID', isPrimaryKey: true, nullable: false },
          { id: '2', name: 'name', type: 'VARCHAR', isPrimaryKey: false, nullable: false },
        ],
        indexes: [],
        foreignKeys: [],
        uniqueConstraints: [],
        checkConstraints: []
      }
    ],
    relationships: [],
    enums: []
  } as unknown as DatabaseSchema;

  it('should export Prisma schema', () => {
    const exporter = new PrismaExporter();
    const result = exporter.export(schema);

    expect(result).toContain('model Users');
    expect(result).toContain('id String @id');
    expect(result).toContain('name String');
  });

  it('should export Postgres schema', () => {
    const exporter = new PostgresExporter();
    const result = exporter.export(schema);

    expect(result).toContain('CREATE TABLE users');
    expect(result).toContain('id UUID PRIMARY KEY NOT NULL');
  });
});
