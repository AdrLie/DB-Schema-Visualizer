import { describe, it, expect } from 'vitest';
import { PostgresParser } from '../src/postgresParser';

describe('PostgresParser', () => {
  it('should parse a basic table', async () => {
    const parser = new PostgresParser();
    const sql = `
      CREATE TABLE users (
        id UUID PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE
      );

      CREATE TABLE orders (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES users(id),
        total DECIMAL(10,2)
      );
    `;

    const schema = await parser.parse(sql);
    
    expect(schema.tables.length).toBe(2);
    expect(schema.tables[0].name).toBe('users');
    expect(schema.tables[0].columns.length).toBe(3);
    expect(schema.tables[0].primaryKey?.columns).toEqual(['id']);
    
    expect(schema.tables[1].name).toBe('orders');
    expect(schema.tables[1].foreignKeys.length).toBe(1);
    expect(schema.tables[1].foreignKeys[0].referencedTable).toBe('users');
    expect(schema.relationships.length).toBe(1);
    expect(schema.relationships[0].sourceTable).toBe('orders');
    expect(schema.relationships[0].targetTable).toBe('users');
  });
});
