import {invariant} from '../utils/common';
import CollectionMap from './CollectionMap';
import {operationTypeToCollectionChangeType} from './helpers';

export default class Database {
  adapter;

  schema;

  collections;

  constructor({adapter, modelClasses}) {
    if (process.env.NODE_ENV !== 'production') {
      invariant(adapter, 'Missing adapter parameter for new Database()');
      invariant(
        modelClasses && Array.isArray(modelClasses),
        'Missing modelClasses parameter for new Database()',
      );
    }

    this.adapter = adapter;
    this.schema = adapter.schema;
    this.collections = new CollectionMap(this, modelClasses);
  }

  // TODO: Executes multiple prepared operations
  // Note: falsy values (null, undefined, false) passed to batch are just ignored
  async batch(...records) {}

  async init() {
    await this.adapter.init();
  }
}
