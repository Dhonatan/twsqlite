import {Collection, Database, Model, TableName} from '../index';
import {Class} from '../utils/common';

export default class CollectionMap {
  public map: {[tableName: string]: Collection<any>};

  public constructor(database: Database, modelClasses: Array<Class<Model>>);

  public get<T extends Model>(tableName: TableName<T>): Collection<T>;
}
