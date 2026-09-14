export type DatabaseType = 'PostgreSQL' | 'MySQL' | 'SQLite' | 'Unknown';

export interface DatabaseSchema {
  id: string;
  name: string;
  namespace?: string; // e.g., 'public'
  databaseType: DatabaseType;
  tables: DatabaseTable[];
  views: DatabaseView[];
  enums: DatabaseEnum[];
  relationships: DatabaseRelationship[];
}

export interface DatabaseTable {
  id: string;
  name: string;
  schema?: string;
  columns: DatabaseColumn[];
  primaryKey?: DatabasePrimaryKey;
  foreignKeys: DatabaseForeignKey[];
  indexes: DatabaseIndex[];
  uniqueConstraints: DatabaseUniqueConstraint[];
  checkConstraints: DatabaseCheckConstraint[];
}

export interface DatabaseView {
  id: string;
  name: string;
  schema?: string;
  definition: string;
  columns: DatabaseColumn[];
}

export interface DatabaseEnum {
  id: string;
  name: string;
  schema?: string;
  values: string[];
}

export interface DatabaseColumn {
  id: string;
  name: string;
  type: string;
  nullable: boolean;
  defaultValue?: string;
  isPrimaryKey: boolean;
}

export interface DatabasePrimaryKey {
  name?: string;
  columns: string[]; // Supports composite primary keys
}

export interface DatabaseForeignKey {
  id: string;
  name?: string;
  columns: string[]; // Supports composite foreign keys
  referencedTable: string;
  referencedColumns: string[];
}

export interface DatabaseIndex {
  name: string;
  columns: string[];
  isUnique: boolean;
}

export interface DatabaseUniqueConstraint {
  name?: string;
  columns: string[];
}

export interface DatabaseCheckConstraint {
  name?: string;
  expression: string;
}

export interface DatabaseRelationship {
  id: string;
  sourceTable: string;
  sourceColumns: string[];
  targetTable: string;
  targetColumns: string[];
  cardinality: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many';
}
