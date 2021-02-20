// Creates a specification of how to migrate between different versions of
// database schema. Every time you change the database schema, you must
// create a corresponding migration.
//
// See docs for more details
//
// Example:
//
// schemaMigrations({
//   migrations: [
//     {
//       toVersion: 3,
//       steps: [
//         createTable({
//           name: 'comments',
//           columns: [
//             { name: 'post_id', type: 'string', isIndexed: true },
//             { name: 'body', type: 'string' },
//           ],
//         }),
//         addColumns({
//           table: 'posts',
//           columns: [
//             { name: 'subtitle', type: 'string', isOptional: true },
//             { name: 'is_pinned', type: 'boolean' },
//           ],
//         }),
//       ],
//     },
//     {
//       toVersion: 2,
//       steps: [
//         // ...
//       ],
//     },
//   ],
// })

import {sortBy, prop, last, head} from 'rambdax';
import {validateColumnSchema} from '../index';
import {invariant} from '../../utils/common';
import {isObject} from '../../utils/fp';

const sortMigrations = sortBy(prop('toVersion'));

export function schemaMigrations(migrationSpec) {
  const {migrations} = migrationSpec;

  if (process.env.NODE_ENV !== 'production') {
    // validate migrations spec object
    invariant(Array.isArray(migrations), 'Missing migrations array');

    // validate migrations format
    migrations.forEach(migration => {
      invariant(
        isObject(migration),
        'Invalid migration (not an object) in schema migrations',
      );

      const {toVersion, steps} = migration;

      invariant(
        typeof toVersion === 'number',
        'Invalid migration - `toVersion` must be a number',
      );
      invariant(
        toVersion >= 2,
        `Invalid migration to version ${toVersion}. Minimum possible migration version is 2`,
      );
      invariant(
        Array.isArray(steps) &&
          steps.every(step => typeof step.type === 'string'),
        `Invalid migration steps for migration to version ${toVersion}. 'steps' should be an array of migration step calls`,
      );
    });
  }

  const sortedMigrations = sortMigrations(migrations);
  const oldestMigration = head(sortedMigrations);
  const newestMigration = last(sortedMigrations);
  const minVersion = oldestMigration ? oldestMigration.toVersion - 1 : 1;
  const maxVersion = newestMigration ? newestMigration.toVersion : 1;

  if (process.env.NODE_ENV !== 'production') {
    // validate that migration spec is without gaps and duplicates
    sortedMigrations.reduce((maxCoveredVersion, migration) => {
      const {toVersion} = migration;

      if (maxCoveredVersion) {
        invariant(
          toVersion === maxCoveredVersion + 1,
          `Invalid migrations! Migrations listed cover range from version ${minVersion} to ${maxCoveredVersion}, but migration ${JSON.stringify(
            migration,
          )} is to version ${toVersion}. Migrations must be listed without gaps, or duplicates.`,
        );
      }

      return toVersion;
    }, null);
  }

  return {
    sortedMigrations,
    minVersion,
    maxVersion,
    validated: true,
  };
}

function validateTable(table, columns) {
  if (process.env.NODE_ENV !== 'production') {
    invariant(table, 'Missing table name in addColumn()');
    invariant(
      columns && Array.isArray(columns),
      "Missing 'columns' or not an array in addColumn()",
    );
    columns.forEach(column => validateColumnSchema(column));
  }
}

export function createTable({name, columns}) {
  validateTable(name, columns);

  return {type: 'create_table', name, columns};
}

export function addColumns({table, columns}) {
  validateTable(table, columns);

  return {type: 'add_columns', table, columns};
}

/*

TODO: Those types of migrations are currently not implemented.

// table operations
destroyTable('table_name')
renameTable({ from: 'old_table_name', to: 'new_table_name' })

// column operations
renameColumn({ table: 'table_name', from: 'old_column_name', to: 'new_column_name' })
destroyColumn({ table: 'table_name', column: 'column_name' })

// indexing
addColumnIndex({ table: 'table_name', column: 'column_name' })
removeColumnIndex({ table: 'table_name', column: 'column_name' })

// optionality
makeColumnOptional({ table: 'table_name', column: 'column_name' }) // allows nulls now
makeColumnRequired({ table: 'table_name', column: 'column_name' }) // nulls are changed to null value ('', 0, false)

*/
