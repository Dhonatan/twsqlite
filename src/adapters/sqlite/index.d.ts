import {AppSchema, Model, Query, RecordId, TableName} from '../../index';
import {SchemaMigrations} from '../../Schema/migrations';

type BatchOperation =
  | ['create', Model]
  | ['update', Model]
  | ['delete', Model]
  | ['show', Model];

export type SQL = string;

export type SQLiteArg = string | boolean | number | null;

export type SQLiteQuery = [SQL, SQLiteArg[]];

export interface SQLiteAdapterOptions {
  dbName?: string;
  migrations?: SchemaMigrations;
  schema: AppSchema;
}

export default class SQLiteAdapter {
  schema: AppSchema;

  constructor(options: SQLiteAdapterOptions);

  init(): void;

  batch(operations: BatchOperation): Promise<void>;

  find(table: TableName<any>, id: RecordId): Promise<>;

  query<T extends Model>(query: Query<T>): Promise<[]>;
}
