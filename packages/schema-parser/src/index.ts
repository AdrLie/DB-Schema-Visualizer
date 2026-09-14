import { DatabaseSchema } from '@schemaflow/schema-core';
import { PostgresParser } from './postgresParser';

export interface SchemaParser {
  parse(input: string): Promise<DatabaseSchema>;
}

export { PostgresParser };
