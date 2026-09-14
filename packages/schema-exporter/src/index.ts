import { DatabaseSchema, DatabaseTable } from '@schemaflow/schema-core';

export class PrismaExporter {
  export(schema: DatabaseSchema): string {
    let result = `generator client {\n  provider = "prisma-client-js"\n}\n\ndatasource db {\n  provider = "postgresql"\n  url      = env("DATABASE_URL")\n}\n\n`;

    // Write enums
    for (const enumDef of schema.enums) {
      result += `enum ${enumDef.name} {\n`;
      for (const val of enumDef.values) {
        result += `  ${val}\n`;
      }
      result += `}\n\n`;
    }

    // Write models
    for (const table of schema.tables) {
      result += `model ${this.capitalize(table.name)} {\n`;
      
      for (const col of table.columns) {
        const typeStr = this.mapToPrismaType(col.type);
        const pkStr = col.isPrimaryKey ? ' @id' : '';
        const defaultStr = col.defaultValue ? ` @default(${col.defaultValue})` : '';
        const nullStr = col.nullable ? '?' : '';
        const isUnique = table.uniqueConstraints?.some(u => u.columns.includes(col.name) && u.columns.length === 1) || false;
        const uniqueStr = isUnique ? ' @unique' : '';

        result += `  ${col.name} ${typeStr}${nullStr}${pkStr}${uniqueStr}${defaultStr}\n`;
      }

      // Add relationships
      const rels = schema.relationships.filter((r) => r.sourceTable === table.name);
      for (const rel of rels) {
        // e.g. userId Int, user User @relation(fields: [userId], references: [id])
        const targetModelName = this.capitalize(rel.targetTable);
        result += `  ${rel.targetTable} ${targetModelName} @relation(fields: [${rel.sourceColumns.join(', ')}], references: [${rel.targetColumns.join(', ')}])\n`;
      }
      
      result += `}\n\n`;
    }

    return result.trim();
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  private mapToPrismaType(sqlType: string): string {
    const t = sqlType.toLowerCase();
    if (t.includes('int')) return 'Int';
    if (t.includes('varchar') || t.includes('text') || t.includes('char')) return 'String';
    if (t.includes('bool')) return 'Boolean';
    if (t.includes('uuid')) return 'String';
    if (t.includes('decimal') || t.includes('float') || t.includes('double')) return 'Float';
    if (t.includes('timestamp') || t.includes('date')) return 'DateTime';
    return 'String'; // fallback
  }
}

export class PostgresExporter {
  export(schema: DatabaseSchema): string {
    let result = '';

    for (const table of schema.tables) {
      result += `CREATE TABLE ${table.name} (\n`;
      
      const colDefs = table.columns.map(col => {
        const pk = col.isPrimaryKey ? ' PRIMARY KEY' : '';
        const nullability = col.nullable ? '' : ' NOT NULL';
        const isUnique = table.uniqueConstraints?.some(u => u.columns.includes(col.name) && u.columns.length === 1) || false;
        const unique = isUnique ? ' UNIQUE' : '';
        const def = col.defaultValue ? ` DEFAULT ${col.defaultValue}` : '';
        
        // Find if this column has a relationship (inline FK)
        const rel = schema.relationships.find(r => r.sourceTable === table.name && r.sourceColumns.length === 1 && r.sourceColumns[0] === col.name);
        const ref = rel ? ` REFERENCES ${rel.targetTable}(${rel.targetColumns.join(', ')})` : '';

        return `  ${col.name} ${col.type}${pk}${nullability}${unique}${def}${ref}`;
      });

      result += colDefs.join(',\n');
      result += `\n);\n\n`;
    }

    return result.trim();
  }
}
