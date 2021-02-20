import {
  Database,
  Model,
  Query,
  RecordId,
  TableName,
  TableSchema,
} from '../index';
import {Condition} from '../QueryDescription';
import {Class} from '../utils/common';

interface options {
  where: string;
  limit: number;
  offset: number;
  groupBy: string;
  orderBy: string;
}

interface multipleInsertsOptions {
  numberInsertsPerBatch: number;
  generateId: boolean;
  generateTimestamps: boolean;
}

interface updateOptions {
  columns: {};
  where: {};
}

export default class Collection<Record extends Model> {
  public database: Database;

  public modelClass: Class<Record>;

  public table: TableName<Record>;

  public schema: TableSchema;

  public constructor(database: Database, ModelClass: Class<Record>);

  public find(id: RecordId | number): Promise<Record>;

  public findAll(options: options): Promise<Record>;

  public query(query: string, values: []): Promise<[]>;

  public create(recordBuilder?: (record: Record) => void): Promise<Record>;

  public multipleInserts(recordBuilder: [Record], options: multipleInsertsOptions): Promise<[]>;

  public update(options: updateOptions): Promise<Record>;

  public delete(id: RecordId | number): Promise<Record>;

  public clean(): void;
}
