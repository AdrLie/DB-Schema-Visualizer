import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as pg from 'pg';
import * as mysql from 'mysql2/promise';
import { DatabaseSchema, DatabaseTable, DatabaseColumn } from '@schemaflow/schema-core';
import { v4 as uuidv4 } from 'uuid';

export interface DbConnectionDetails {
  type: 'postgresql' | 'mysql';
  host: string;
  port: number;
  database: string;
  user: string;
  password?: string;
  ssl?: boolean;
}

@Injectable()
export class DbConnectorService {
  private readonly logger = new Logger(DbConnectorService.name);

  async testConnection(details: DbConnectionDetails): Promise<boolean> {
    try {
      if (details.type === 'postgresql') {
        const client = new pg.Client(this.getPgConfig(details));
        await client.connect();
        await client.query('SELECT 1');
        await client.end();
        return true;
      } else if (details.type === 'mysql') {
        const connection = await mysql.createConnection(this.getMySqlConfig(details));
        await connection.query('SELECT 1');
        await connection.end();
        return true;
      }
      throw new BadRequestException(`Unsupported database type: ${details.type}`);
    } catch (error: any) {
      this.logger.error(`Connection test failed: ${error.message}`);
      throw new BadRequestException(`Connection failed: ${error.message}`);
    }
  }

  async introspect(details: DbConnectionDetails): Promise<DatabaseSchema> {
    if (details.type === 'postgresql') {
      return this.introspectPostgres(details);
    } else if (details.type === 'mysql') {
      return this.introspectMysql(details);
    }
    throw new BadRequestException(`Unsupported database type: ${details.type}`);
  }

  async executeSql(details: DbConnectionDetails, sql: string): Promise<any> {
    try {
      if (details.type === 'postgresql') {
        const client = new pg.Client(this.getPgConfig(details));
        await client.connect();
        const res = await client.query(sql);
        await client.end();
        return res.rows;
      } else if (details.type === 'mysql') {
        const connection = await mysql.createConnection(this.getMySqlConfig(details));
        const [rows] = await connection.query(sql);
        await connection.end();
        return rows;
      }
      throw new BadRequestException(`Unsupported database type: ${details.type}`);
    } catch (error: any) {
      this.logger.error(`Execute SQL failed: ${error.message}`);
      throw new BadRequestException(`Execution failed: ${error.message}`);
    }
  }

  private getPgConfig(details: DbConnectionDetails): pg.ClientConfig {
    return {
      host: details.host,
      port: details.port,
      database: details.database,
      user: details.user,
      password: details.password,
      ssl: details.ssl ? { rejectUnauthorized: false } : false,
    };
  }

  private getMySqlConfig(details: DbConnectionDetails): mysql.ConnectionOptions {
    return {
      host: details.host,
      port: details.port,
      database: details.database,
      user: details.user,
      password: details.password,
      ssl: details.ssl ? { rejectUnauthorized: false } : undefined,
    };
  }

  private async introspectPostgres(details: DbConnectionDetails): Promise<DatabaseSchema> {
    const client = new pg.Client(this.getPgConfig(details));
    try {
      await client.connect();

      // Get tables and columns
      const tablesRes = await client.query(`
        SELECT c.table_name, c.column_name, c.data_type, c.is_nullable, c.column_default,
          (SELECT COUNT(*) FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name
           WHERE tc.table_name = c.table_name AND kcu.column_name = c.column_name AND tc.constraint_type = 'PRIMARY KEY') > 0 as is_primary
        FROM information_schema.columns c
        WHERE c.table_schema = 'public'
        ORDER BY c.table_name, c.ordinal_position;
      `);

      // Get foreign keys
      const fksRes = await client.query(`
        SELECT
            tc.table_name, 
            kcu.column_name, 
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name,
            tc.constraint_name
        FROM information_schema.table_constraints AS tc 
        JOIN information_schema.key_column_usage AS kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
          ON ccu.constraint_name = tc.constraint_name
          AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema='public';
      `);

      await client.end();

      return this.buildSchema(details.database, 'PostgreSQL', tablesRes.rows, fksRes.rows);
    } catch (error: any) {
      this.logger.error(`Introspection failed: ${error.message}`);
      if (client) {
         try { await client.end(); } catch (e) {}
      }
      throw new BadRequestException(`Introspection failed: ${error.message}`);
    }
  }

  private async introspectMysql(details: DbConnectionDetails): Promise<DatabaseSchema> {
    let connection: mysql.Connection | null = null;
    try {
      connection = await mysql.createConnection(this.getMySqlConfig(details));

      const [columns]: any = await connection.query(`
        SELECT TABLE_NAME as table_name, COLUMN_NAME as column_name, DATA_TYPE as data_type, 
               IS_NULLABLE as is_nullable, COLUMN_DEFAULT as column_default, COLUMN_KEY as column_key
        FROM information_schema.columns 
        WHERE table_schema = ?
        ORDER BY TABLE_NAME, ORDINAL_POSITION;
      `, [details.database]);

      const [fks]: any = await connection.query(`
        SELECT TABLE_NAME as table_name, COLUMN_NAME as column_name, 
               REFERENCED_TABLE_NAME as foreign_table_name, REFERENCED_COLUMN_NAME as foreign_column_name,
               CONSTRAINT_NAME as constraint_name
        FROM information_schema.KEY_COLUMN_USAGE 
        WHERE TABLE_SCHEMA = ? AND REFERENCED_TABLE_NAME IS NOT NULL;
      `, [details.database]);

      await connection.end();

      const normalizedColumns = columns.map((col: any) => ({
        table_name: col.table_name,
        column_name: col.column_name,
        data_type: col.data_type,
        is_nullable: col.is_nullable,
        column_default: col.column_default,
        is_primary: col.column_key === 'PRI'
      }));

      return this.buildSchema(details.database, 'MySQL', normalizedColumns, fks);
    } catch (error: any) {
      this.logger.error(`Introspection failed: ${error.message}`);
      if (connection) {
         try { await connection.end(); } catch (e) {}
      }
      throw new BadRequestException(`Introspection failed: ${error.message}`);
    }
  }

  private buildSchema(dbName: string, dbType: 'PostgreSQL' | 'MySQL', columnsData: any[], fksData: any[]): DatabaseSchema {
    const tablesMap = new Map<string, DatabaseTable>();

    for (const row of columnsData) {
      const tableName = row.table_name;
      if (!tablesMap.has(tableName)) {
        tablesMap.set(tableName, {
          id: uuidv4(),
          name: tableName,
          columns: [],
          foreignKeys: [],
          indexes: [],
          uniqueConstraints: [],
          checkConstraints: []
        });
      }

      const table = tablesMap.get(tableName)!;
      table.columns.push({
        id: uuidv4(),
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === 'YES',
        defaultValue: row.column_default,
        isPrimaryKey: Boolean(row.is_primary)
      });
      
      if (row.is_primary) {
          if (!table.primaryKey) {
              table.primaryKey = { columns: [] };
          }
          table.primaryKey.columns.push(row.column_name);
      }
    }

    for (const row of fksData) {
      const table = tablesMap.get(row.table_name);
      if (table) {
        // Find existing FK with same constraint name, or create new
        let fk = table.foreignKeys.find((f: any) => f.name === row.constraint_name);
        if (!fk) {
          fk = {
            id: uuidv4(),
            name: row.constraint_name,
            columns: [],
            referencedTable: row.foreign_table_name,
            referencedColumns: []
          };
          table.foreignKeys.push(fk);
        }
        fk.columns.push(row.column_name);
        fk.referencedColumns.push(row.foreign_column_name);
      }
    }

    const tables = Array.from(tablesMap.values());
    const relationships = [];

    for (const table of tables) {
      for (const fk of table.foreignKeys) {
        relationships.push({
          id: fk.id,
          sourceTable: table.name,
          sourceColumns: fk.columns,
          targetTable: fk.referencedTable,
          targetColumns: fk.referencedColumns,
          cardinality: 'many-to-one' as const
        });
      }
    }

    return {
      id: uuidv4(),
      name: dbName,
      databaseType: dbType,
      tables,
      views: [],
      enums: [],
      relationships
    };
  }
}
