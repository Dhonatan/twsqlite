import {
  AppSchema,
  CollectionMap,
  Model,
  RecordId,
  Query,
  TableName,
} from '../index';
import {Class} from '../utils/common';
import {SchemaMigrations} from '../Schema/migrations';
import SQLiteAdapter from '../adapters/sqlite';

type BatchOperation =
  | ['create', Model]
  | ['update', Model]
  | ['delete', Model]
  | ['show', Model];

export interface DatabaseAdapter {
  schema: AppSchema;

  migrations: SchemaMigrations; // TODO: Not optional

  // Fetches given (one) record or null. Should not send raw object if already cached in JS
  find(table: TableName<any>, id: RecordId): Promise<[]>;

  // Fetches matching records. Should not send raw object if already cached in JS
  query<T extends Model>(query: Query<T>): Promise<[]>;

  // Executes multiple prepared operations
  batch(operations: BatchOperation[]): Promise<void>;
}

export default class Database {
  public adapter: SQLiteAdapter;

  public schema: AppSchema;

  public collections: CollectionMap;

  public constructor(options: {
    adapter: SQLiteAdapter;
    modelClasses: Class<Model>[];
  });

  init(): void;

  public batch(
    ...records: Model[] | null[] | void[] | false[] | Promise<void>[]
  ): Promise<void>;
}
