import {pipe, join, keys, values, always, map} from 'rambdax';
import encodeName from '../encodeName';

const columnNames = pipe(
  keys,
  map(encodeName),
  join(', '),
);

const valuePlaceholders = pipe(
  values,
  map(always('?')),
  join(', '),
);

export default function encodeInsert(model) {
  const {raw, table} = model;
  const sql = `insert into ${table} (${columnNames(
    raw,
  )}) values (${valuePlaceholders(raw)})`;
  const args = values(raw);

  return [sql, args];
}

export function encodeInsertWithoutValues(model) {
  const {raw, table} = model;

  return `insert into ${table} (${columnNames(raw)}) values `;
}

function hasJsonStructure(str) {
  if (typeof str !== 'string') {
    return false;
  }

  try {
    const result = JSON.parse(str);
    const type = Object.prototype.toString.call(result);
    return type === '[object Object]' || type === '[object Array]';
  } catch (err) {
    return false;
  }
}

function encodeValue(value) {
  // When a string is in JSON.strinfy format
  if (hasJsonStructure(value)) {
    return `'${value}'`;
  }

  return encodeName(value);
}

export function encodeInsertValues(record) {
  const recordKeys = Object.keys(record);
  const recordValues = Object.values(record);

  recordValues.forEach((value, idx) => {
    const key = recordKeys[idx];

    switch (typeof value) {
      case 'string':
        record[key] = encodeValue(value);
        break;
      case 'number':
        record[key] = value;
        break;
      default:
        record[key] = encodeValue(null);
    }
  });

  return `(${values(record)})`;
}
