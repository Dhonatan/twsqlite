import {
  propEq,
  is,
  has,
  any,
  values as getValues,
  complement,
  T,
  F,
  pipe,
} from 'rambdax';

// Don't import whole `utils` to keep little the use of memory
import cond from '../utils/fp/cond';
import partition from '../utils/fp/partition';
import isObject from '../utils/fp/isObject';
import invariant from '../utils/common/invariant';

// Note: These operators are designed to match SQLite semantics
// to ensure that iOS, Android, web, and Query observation yield exactly the same results
//
// - `true` and `false` are equal to `1` and `0`
//   (JS uses true/false, but SQLite uses 1/0)
// - `null`, `undefined`, and missing fields are equal
//   (SQLite queries return null, but newly created records might lack fields)
// - You can only compare columns to values/other columns of the same type
//   (e.g. string to int comparisons are not allowed)
// - numeric comparisons (<, <=, >, >=, between) with null on either side always return false
//   e.g. `null < 2 == false`
// - `null` on the right-hand-side of IN/NOT IN is not allowed
//   e.g. `Q.in([null, 'foo', 'bar'])`
// - `null` on the left-hand-side of IN/NOT IN will always return false
//   e.g. `null NOT IN (1, 2, 3) == false`

function _valueOrColumn(arg) {
  if (arg !== null && typeof arg === 'object') {
    return arg;
  }

  return {value: arg};
}

// Equals (weakly)
// Note:
// - (null == undefined) == true
// - (1 == true) == true
// - (0 == false) == true
export function eq(valueOrColumn) {
  return {operator: 'eq', right: _valueOrColumn(valueOrColumn)};
}

// Not equal (weakly)
// Note:
// - (null != undefined) == false
// - (1 != true) == false
// - (0 != false) == false
export function notEq(valueOrColumn) {
  return {operator: 'notEq', right: _valueOrColumn(valueOrColumn)};
}

// Greater than (SQLite semantics)
// Note:
// - (5 > null) == false
export function gt(valueOrColumn) {
  return {operator: 'gt', right: _valueOrColumn(valueOrColumn)};
}

// Greater than or equal (SQLite semantics)
// Note:
// - (5 >= null) == false
export function gte(valueOrColumn) {
  return {operator: 'gte', right: _valueOrColumn(valueOrColumn)};
}

// Greater than (JavaScript semantics)
// Note:
// - (5 > null) == true
export function weakGt(valueOrColumn) {
  return {operator: 'weakGt', right: _valueOrColumn(valueOrColumn)};
}

// Less than (SQLite semantics)
// Note:
// - (null < 5) == false
export function lt(valueOrColumn) {
  return {operator: 'lt', right: _valueOrColumn(valueOrColumn)};
}

// Less than or equal (SQLite semantics)
// Note:
// - (null <= 5) == false
export function lte(valueOrColumn) {
  return {operator: 'lte', right: _valueOrColumn(valueOrColumn)};
}

// Value in a set (SQLite IN semantics)
// Note:
// - `null` in `values` is not allowed!
export function oneOf(values) {
  if (process.env.NODE_ENV !== 'production') {
    invariant(
      Array.isArray(values),
      'argument passed to oneOf() is not an array',
    );
  }

  return {operator: 'oneOf', right: {values}};
}

// Value not in a set (SQLite NOT IN semantics)
// Note:
// - `null` in `values` is not allowed!
// - (null NOT IN (1, 2, 3)) == false
export function notIn(values) {
  if (process.env.NODE_ENV !== 'production') {
    invariant(
      Array.isArray(values),
      'argument passed to notIn() is not an array',
    );
  }

  return {operator: 'notIn', right: {values}};
}

// Number is between two numbers (greater than or equal left, and less than or equal right)
export function between(left, right) {
  const values = [left, right];
  return {operator: 'between', right: {values}};
}

export function like(value) {
  return {operator: 'like', right: {value}};
}

export function notLike(value) {
  return {operator: 'notLike', right: {value}};
}

export function sanitizeLikeString(value) {
  return value.replace(/[^a-zA-Z0-9]/g, '_');
}

export function column(name) {
  return {column: name};
}

function _valueOrComparison(arg) {
  if (arg !== null && typeof arg === 'object') {
    return arg;
  }

  return eq(arg);
}

export function where(left, valueOrComparison) {
  return {
    type: 'where',
    left,
    comparison: _valueOrComparison(valueOrComparison),
  };
}

export function and(...conditions) {
  return {type: 'and', conditions};
}

export function or(...conditions) {
  return {type: 'or', conditions};
}

// Use: on('tableName', 'left_column', 'right_value')
// or: on('tableName', 'left_column', gte(10))
// or: on('tableName', where('left_column', 'value')))
export const on = (table, leftOrWhereDescription, valueOrComparison) => {
  if (typeof leftOrWhereDescription === 'string') {
    invariant(
      valueOrComparison !== undefined,
      'illegal `undefined` passed to Q.on',
    );

    return {
      type: 'on',
      table,
      left: leftOrWhereDescription,
      comparison: _valueOrComparison(valueOrComparison),
    };
  }

  const whereDescription = leftOrWhereDescription;

  return {
    type: 'on',
    table,
    left: whereDescription.left,
    comparison: whereDescription.comparison,
  };
};

const getJoins = partition(propEq('type', 'on'));

export function buildQueryDescription(conditions) {
  const [join, whereConditions] = getJoins(conditions);

  return {join, where: whereConditions};
}

const isNotObject = complement(isObject);

const searchForColumnComparisons = cond([
  [is(Array), any(value => searchForColumnComparisons(value))], // dig deeper into arrays
  [isNotObject, F], // bail if primitive value
  [has('column'), T], // bingo!
  [
    T,
    pipe(
      // dig deeper into objects
      getValues,
      any(value => searchForColumnComparisons(value)),
    ),
  ],
]);
