import {keys, values} from 'rambdax';
import encodeName from '../encodeName';
import encodeValue from '../encodeValue';

const standardColumns = '"id" primary key, "created_at", "updated_at"';

function nullValue(columnSchema) {
  const {isOptional, type} = columnSchema;

  if (isOptional) {
    return null;
  } else if (type === 'string') {
    return '';
  } else if (type === 'number') {
    return 0;
  } else if (type === 'boolean') {
    return false;
  }

  throw new Error(
    `Unknown type for column schema ${JSON.stringify(columnSchema)}`,
  );
}

const encodeCreateTable = ({name, columns}) => {
  const columnsSQL = [standardColumns]
    .concat(keys(columns).map(column => encodeName(column)))
    .join(', ');
  return `create table if not exists ${encodeName(name)} (${columnsSQL});`;
};

const encodeIndex = (column, tableName) =>
  column.isIndexed
    ? `create index if not exists ${tableName}_${column.name} on ${encodeName(
        tableName,
      )} (${encodeName(column.name)});`
    : '';

const encodeTableIndicies = ({name: tableName, columns}) => {
  return values(columns)
    .map(column => encodeIndex(column, tableName))
    .join('');
};

const encodeTable = table =>
  encodeCreateTable(table) + encodeTableIndicies(table);

export const encodeSchema = ({tables}) =>
  values(tables)
    .map(encodeTable)
    .join('');

const encodeCreateTableMigrationStep = ({name, columns}) =>
  encodeTable({name, columns});

const encodeAddColumnsMigrationStep = ({table, columns}) => {
  return columns
    .map(column => {
      const addColumn = `alter table ${encodeName(table)} add ${encodeName(
        column.name,
      )};`;
      const setDefaultValue = `update ${encodeName(table)} set ${encodeName(
        column.name,
      )} = ${encodeValue(nullValue(column))};`;
      const addIndex = encodeIndex(column, table);

      return addColumn + setDefaultValue + addIndex;
    })
    .join('');
};

export const encodeMigrationSteps = steps => {
  return steps
    .map(step => {
      if (step.type === 'create_table') {
        step.columns = step.columns.reduce((map, column) => {
          map[column.name] = column;
          return map;
        }, {});

        return encodeCreateTableMigrationStep(step);
      } else if (step.type === 'add_columns') {
        return encodeAddColumnsMigrationStep(step);
      }

      throw new Error(`Unsupported migration step ${step.type}`);
    })
    .join('');
};
