import {appSchema, tableSchema, Database, Model} from './src';
import SQLiteAdapter from './src/adapters/sqlite';

class Customers extends Model {
  static table = 'customers';

  static idC = () => {
    return 1060;
  };
}

class Users extends Model {
  static table = 'users';

  static idU() {
    return 20;
  }
}

const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'customers',
      columns: [
        {name: 'name', type: 'string', isIndexed: true},
        {name: 'age', type: 'number'},
      ],
    }),
    tableSchema({
      name: 'users',
      columns: [
        {name: 'name', type: 'string', isIndexed: true},
        {name: 'age', type: 'number'},
      ],
    }),
  ],
});

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema,
});

// Then, make a Watermelon database from it!
const database = new Database({
  adapter,
  modelClasses: [Customers, Users],
});

/*
console.log(
  '[COLLECTIONS] customers ',
  database.collections.get('customers').findAll({
    where: 'id > 100',
    offset: 0,
    limit: 25,
    orderBy: 'id DESC',
    groupBy: 'name',
  }),
);
*/

export default database;
