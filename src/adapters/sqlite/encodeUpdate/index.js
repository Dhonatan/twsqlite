import {pipe, map, join, keys, values, append} from 'rambdax';
import encodeName from '../encodeName';

const encodeSetPlaceholders = pipe(
  keys,
  map(encodeName),
  map(key => `${key}=?`),
  join(', '),
);

const getArgs = (raw, id) =>
  pipe(
    values,
    append(id), // for `where id is ?`
  )(raw);

export default function encodeUpdate(model) {
  const {raw, table, id} = model;
  const sql = `update ${encodeName(table)} set ${encodeSetPlaceholders(
    raw,
  )} where "UUID" is ?`;
  const args = getArgs(raw, id);

  return [sql, args];
}
