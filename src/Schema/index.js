import {invariant} from '../utils/common';
import {includes} from 'rambdax';

export function tableName(name) {
  return name;
}

export function columnName(name) {
  return name;
}

function callInvariant(condition, message) {
  if (process.env.NODE_ENV !== 'production') {
    invariant(condition, message);
  }
}

export function appSchema({version, tables: tableList}) {
  callInvariant(version > 0, 'Schema version must be greater than 0');

  const tables = tableList.reduce((map, table) => {
    callInvariant(
      typeof table === 'object' && table.name,
      'Table schema must contain a name',
    );
    map[table.name] = table;
    return map;
  }, {});

  return {version, tables};
}

export function validateColumnSchema(column) {
  if (process.env.NODE_ENV !== 'production') {
    invariant(column.name, 'Missing column name');
    invariant(
      includes(column.type, ['string', 'boolean', 'number']),
      `Invalid type ${column.type} for column ${column.name} (valid: string, boolean, number)`,
    );
    invariant(
      !includes(column.name, ['id', 'created_at', 'updated_at']),
      `You must not define a column with name ${column.name}`,
    );
    if (column.name === 'created_at' || column.name === 'updated_at') {
      invariant(
        column.type === 'number' && !column.isOptional,
        `${column.name} must be of type number and not optional`,
      );
    }
    if (column.name === 'last_modified') {
      invariant(
        column.type === 'number',
        "For compatibility reasons, column last_modified must be of type 'number', and should be optional",
      );
    }
  }
}

export function tableSchema({name, columns: columnList}) {
  if (process.env.NODE_ENV !== 'production') {
    invariant(name, 'Missing table name in schema');
  }

  const columns = columnList.reduce((map, column) => {
    if (process.env.NODE_ENV !== 'production') {
      validateColumnSchema(column);
    }
    map[column.name] = column;
    return map;
  }, {});

  return {name, columns};
}

export function defaultSchema() {
  return appSchema({
    version: 1,
    tables: [
      tableSchema({
        name: 'versions',
        columns: [{name: 'version', type: 'number', isIndexed: true}],
      }),
      tableSchema({
        name: 'executed_migrations',
        columns: [{name: 'migration', type: 'number', isIndexed: true}],
      }),
    ],
  });
}
