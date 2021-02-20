/**
TODO: Each module must be use declare, but, the intelescence
don't work on files .js. Fix this bug for use this sintax.

declare module '@twoweb/twsqlite' {
  export { RecordId } from '@twoweb/twsqlite/Model'
  export {
    TableName,
    ColumnName,
    ColumnType,
    ColumnSchema,
    TableSchema,
    AppSchema,
  } from '@twoweb/twsqlite/Schema'
}
*/

import * as Q from './QueryDescription';
import Database, {DatabaseAdapter} from './Database';

export {default as Collection} from './Collection';
export {default as CollectionMap} from './Database/CollectionMap';
export {default as Model, associations} from './Model';
export {default as Query} from './Query';
export {tableName, columnName, appSchema, tableSchema} from './Schema';

// types
export {RecordId} from './Model';
export {
  TableName,
  ColumnName,
  ColumnType,
  ColumnSchema,
  TableSchema,
  AppSchema,
} from './Schema';

export {Q, Database, DatabaseAdapter};
