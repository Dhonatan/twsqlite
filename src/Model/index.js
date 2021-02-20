import fromPairs from '../utils/fp/fromPairs';

export function associations(...associationList) {
  return fromPairs(associationList);
}

export default class Model {
  // Set this in concrete Models to the name of the database table
  static table;

  // Set this in concrete Models to define relationships between different records
  static associations;

  collection;

  // Don't use this directly! Use `collection.create()`
  constructor(collection) {
    this.collection = collection;
  }

  // Modifies the model (using passed function) and saves it to the database.
  // Touches `updatedAt` if available.
  //
  // Example:
  // someTask.update(task => {
  //   task.name = 'New name'
  // })
  async update(recordUpdater) {
    this.collection.database._ensureInAction(
      'Model.update() can only be called from inside of an Action. See docs for more details.',
    );
    this._prepareUpdate(recordUpdater);
    await this.collection.database.batch(this);
  }

  // Prepares an update to the database (using passed function).
  // Touches `updatedAt` if available.
  //
  // After preparing an update, you must execute it synchronously using
  // database.batch()
  _prepareUpdate(recordUpdater) {
    // implements your logic here
  }

  // Collections of other Models in the same domain as this record
  get collections() {
    return this.database.collections;
  }

  get database() {
    return this.collection.database;
  }

  get asModel() {
    return this;
  }

  // See: Database.batch()
  // To be used by Model subclass methods only
  batch(...records) {
    return this.collection.database.batch(...records);
  }

  get table() {
    return this.constructor.table;
  }
}
