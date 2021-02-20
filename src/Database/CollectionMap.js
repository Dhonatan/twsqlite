import Collection from '../Collection';

export default class CollectionMap {
  map;

  constructor(database, modelClasses) {
    this.map = modelClasses.reduce(
      (map, modelClass) => ({
        ...map,
        [modelClass.table]: new Collection(database, modelClass),
      }),
      {},
    );
  }

  getModelFunctions(schema) {
    const model = schema.modelClass;
    const classKeys = Object.keys(model);

    for (let key of classKeys) {
      if (typeof model[key] === 'function') {
        schema[key] = model[key];
      }
    }

    return schema;
  }

  get(tableName) {
    return this.getModelFunctions(this.map[tableName]);
  }
}
