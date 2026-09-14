import { describe, it, expect } from 'vitest';
import { DatabaseSchema } from '@schemaflow/schema-core';
import { SchemaAnalyzer } from '../src/index';

describe('SchemaAnalyzer', () => {
  it('should detect tables without primary keys', () => {
    const schema = {
      tables: [
        {
          name: 'users',
          columns: [
            { id: '1', name: 'id', type: 'UUID', isPrimaryKey: true, nullable: false },
            { id: '2', name: 'name', type: 'VARCHAR', isPrimaryKey: false, nullable: false },
          ]
        },
        {
          name: 'bad_table',
          columns: [
            { id: '3', name: 'val', type: 'INT', isPrimaryKey: false, nullable: true }
          ]
        }
      ],
      relationships: [],
      enums: []
    } as unknown as DatabaseSchema;

    const analyzer = new SchemaAnalyzer();
    const issues = analyzer.analyze(schema);

    expect(issues).toHaveLength(1);
    expect(issues[0].ruleId).toBe('no-primary-key');
    expect(issues[0].tableName).toBe('bad_table');
  });

  it('should detect unindexed foreign keys', () => {
    const schema = {
      tables: [
        {
          name: 'orders',
          columns: [
            { id: '4', name: 'id', type: 'UUID', isPrimaryKey: true, nullable: false },
            { id: '5', name: 'user_id', type: 'UUID', isPrimaryKey: false, nullable: false },
          ],
          indexes: [] // no index on user_id
        }
      ],
      relationships: [
        {
          id: 'fk_orders_user_id',
          sourceTable: 'orders',
          sourceColumns: ['user_id'],
          targetTable: 'users',
          targetColumns: ['id'],
          cardinality: 'one-to-many'
        }
      ],
      enums: []
    } as unknown as DatabaseSchema;

    const analyzer = new SchemaAnalyzer();
    const issues = analyzer.analyze(schema);

    expect(issues).toHaveLength(1);
    expect(issues[0].ruleId).toBe('unindexed-foreign-key');
    expect(issues[0].tableName).toBe('orders');
    expect(issues[0].columnName).toBe('user_id');
  });
});

