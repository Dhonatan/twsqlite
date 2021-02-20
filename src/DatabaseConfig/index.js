import {openDatabase, enablePromise} from 'react-native-sqlite-storage';

enablePromise(true);

let database = null;

export function open({dbName, location}) {
  const dbLocation = location || 'default';

  if (database) {
    return database;
  }

  database = new Promise((resolve, reject) => {
    openDatabase({name: `${dbName}.db`, location: dbLocation})
      .then(resolve)
      .catch(reject);
  });

  return database;
}
