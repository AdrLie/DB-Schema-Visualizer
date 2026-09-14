import { parse, Statement, CreateTableStatement, AlterTableStatement } from 'pgsql-ast-parser';
import { v4 as uuidv4 } from 'uuid';
import {
  DatabaseSchema,
  DatabaseTable,
  DatabaseColumn,
  DatabaseRelationship,
  DatabaseIndex,
  DatabasePrimaryKey,
  DatabaseForeignKey,
  DatabaseUniqueConstraint,
  DatabaseCheckConstraint,
} from '@schemaflow/schema-core';

export class PostgresParser {
  async parse(input: string): Promise<DatabaseSchema> {
    const ast = parse(input);
    const tables: DatabaseTable[] = [];
    const relationships: DatabaseRelationship[] = [];

    // First pass: extract tables and inline constraints
    for (const stmt of ast) {
      if (stmt.type === 'create table') {
        const table = this.parseCreateTable(stmt);
        tables.push(table);
      }
    }

    // Second pass: extract relationships from foreign keys (both inline and altered)
    for (const table of tables) {
      for (const fk of table.foreignKeys) {
        relationships.push({
          id: uuidv4(),
          sourceTable: table.name,
          sourceColumns: fk.columns,
          targetTable: fk.referencedTable,
          targetColumns: fk.referencedColumns,
          cardinality: 'one-to-many', // Simplified for now, real parser would deduce this
        });
      }
    }

    // Alter table pass
    for (const stmt of ast) {
      if (stmt.type === 'alter table') {
        // Implement ALTER TABLE parsing for FKs/PKs if needed
      }
    }

    return {
      id: uuidv4(),
      name: 'Parsed Schema',
      databaseType: 'PostgreSQL',
      tables,
      views: [],
      enums: [],
      relationships,
    };
  }

  private parseCreateTable(stmt: CreateTableStatement): DatabaseTable {
    const columns: DatabaseColumn[] = [];
    let primaryKey: DatabasePrimaryKey | undefined;
    const foreignKeys: DatabaseForeignKey[] = [];
    const uniqueConstraints: DatabaseUniqueConstraint[] = [];
    const checkConstraints: DatabaseCheckConstraint[] = [];
    const indexes: DatabaseIndex[] = [];

    for (const col of stmt.columns) {
      if (col.kind === 'column') {
        const nullable = col.constraints?.some((c) => c.type === 'not null') ? false : true;
        const isPrimaryKey = col.constraints?.some((c) => c.type === 'primary key') || false;
        
        let typeStr = 'UNKNOWN';
        if ('name' in col.dataType) {
          typeStr = col.dataType.name;
          if (typeStr === 'varchar' || typeStr === 'character varying') {
             typeStr = 'VARCHAR'; // Simple normalization
          } else if (typeStr === 'uuid') {
             typeStr = 'UUID';
          }
        }

        columns.push({
          id: uuidv4(),
          name: col.name.name,
          type: typeStr,
          nullable,
          isPrimaryKey,
        });

        if (isPrimaryKey) {
          primaryKey = { columns: [col.name.name] };
        }

        // Inline FKs
        const fkConstraint = col.constraints?.find((c) => c.type === 'reference');
        if (fkConstraint && fkConstraint.type === 'reference') {
          foreignKeys.push({
            id: uuidv4(),
            columns: [col.name.name],
            referencedTable: fkConstraint.foreignTable.name,
            referencedColumns: fkConstraint.foreignColumns.map(c => c.name),
          });
        }
        
        const uniqueConstraint = col.constraints?.find((c) => c.type === 'unique');
        if (uniqueConstraint) {
           uniqueConstraints.push({
             columns: [col.name.name]
           });
        }
      }
    }

    return {
      id: uuidv4(),
      name: stmt.name.name,
      columns,
      primaryKey,
      foreignKeys,
      indexes,
      uniqueConstraints,
      checkConstraints,
    };
  }
}
