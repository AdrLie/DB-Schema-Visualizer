import { DatabaseSchema, DatabaseTable } from '@schemaflow/schema-core';

export type IssueSeverity = 'info' | 'warning' | 'error';

export interface AnalysisIssue {
  ruleId: string;
  severity: IssueSeverity;
  tableName: string;
  columnName?: string;
  message: string;
}

export interface AnalysisRule {
  id: string;
  name: string;
  description: string;
  analyze(schema: DatabaseSchema): AnalysisIssue[];
}

export class NoPrimaryKeyRule implements AnalysisRule {
  id = 'no-primary-key';
  name = 'Missing Primary Key';
  description = 'Detects tables that do not have a primary key defined.';

  analyze(schema: DatabaseSchema): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];

    for (const table of schema.tables) {
      const hasPk = table.columns.some((col) => col.isPrimaryKey);
      if (!hasPk) {
        issues.push({
          ruleId: this.id,
          severity: 'error',
          tableName: table.name,
          message: `Table "${table.name}" has no primary key.`,
        });
      }
    }

    return issues;
  }
}

export class UnindexedForeignKeyRule implements AnalysisRule {
  id = 'unindexed-foreign-key';
  name = 'Unindexed Foreign Key';
  description = 'Detects foreign keys that do not have a corresponding index, which can cause performance issues.';

  analyze(schema: DatabaseSchema): AnalysisIssue[] {
    const issues: AnalysisIssue[] = [];

    for (const table of schema.tables) {
      // Find all columns that are foreign keys (in a real scenario we'd check the constraints, but let's assume we have them)
      // Since our parser adds foreign keys to the relationships array:
      const fks = schema.relationships.filter((r) => r.sourceTable === table.name);

      for (const fk of fks) {
        // Our domain model supports composite foreign keys, so we check the first column for simplicity in this rule,
        // or check if ALL sourceColumns are indexed. Let's check the first.
        const colName = fk.sourceColumns[0];
        
        // Find if this column has an index
        const hasIndex = table.indexes?.some((idx) => idx.columns.includes(colName)) || false;
        
        // A primary key also acts as an index natively
        const colDef = table.columns.find((c) => c.name === colName);
        const isPk = colDef?.isPrimaryKey || false;

        if (!hasIndex && !isPk) {
          issues.push({
            ruleId: this.id,
            severity: 'warning',
            tableName: table.name,
            columnName: colName,
            message: `Foreign key "${colName}" in table "${table.name}" is not indexed.`,
          });
        }
      }
    }

    return issues;
  }
}

export class SchemaAnalyzer {
  private rules: AnalysisRule[] = [];

  constructor() {
    this.rules = [
      new NoPrimaryKeyRule(),
      new UnindexedForeignKeyRule(),
    ];
  }

  addRule(rule: AnalysisRule) {
    this.rules.push(rule);
  }

  analyze(schema: DatabaseSchema): AnalysisIssue[] {
    const allIssues: AnalysisIssue[] = [];
    for (const rule of this.rules) {
      allIssues.push(...rule.analyze(schema));
    }
    return allIssues;
  }
}
