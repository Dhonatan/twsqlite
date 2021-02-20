import {buildQueryDescription} from '../QueryDescription';
import {open} from '../DatabaseConfig';

export default class Query {
  // Note: Don't use this directly, use Collection.query(...)
  constructor(collection, conditions) {
    this.collection = collection;
    this._rawDescription = buildQueryDescription(conditions);
  }

  async query(query, values = []) {
    try {
      this.database = await open({dbName: this._dbName});

      return new Promise((resolve, reject) => {
        this.database.transaction(async tx => {
          try {
            const result = await tx.executeSql(query, values);

            resolve(result[1]);
          } catch (err) {
            reject(new Error(err));
          }
        });
      });
    } catch (err) {
      return new Error('[ERROR EXEC METHOD QUERY] ', err);
    }
  }
}
