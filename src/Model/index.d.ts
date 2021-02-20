import {
  Collection,
  CollectionMap,
  ColumnName,
  Database,
  TableName,
} from '../index';

export type RecordId = string;

export type SyncStatus = 'synced' | 'created' | 'updated' | 'deleted';

export interface BelongsToAssociation {
  type: 'belongs_to';
  key: ColumnName;
}
export interface HasManyAssociation {
  type: 'has_many';
  foreignKey: ColumnName;
}
export type AssociationInfo = BelongsToAssociation | HasManyAssociation;
export interface Associations {
  [tableName: string]: AssociationInfo;
}

export function associations(
  ...associationList: Array<[TableName<any>, AssociationInfo]>
): Associations;

export default class Model {
  // FIXME: How to correctly point to a static this?
  public static table: TableName<Model>;

  public static associations: Associations;

  public collection: Collection<Model>;

  public collections: CollectionMap;

  public database: Database;

  public update(recordUpdater?: (record: this) => void): Promise<void>;

  public constructor(collection: Collection);
}
