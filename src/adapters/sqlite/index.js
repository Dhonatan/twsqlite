import {open} from '../../DatabaseConfig';
import {defaultSchema} from '../../Schema';
import {logger, invariant} from '../../utils/common';
import {validateAdapter} from '../commom';
import {encodeSchema, encodeMigrationSteps} from './encodeSchema';

const DEFAULT_SCHEMA_NEEDED = 'default_schema_needed';
const SCHEMA_NEEDED = 'schema_needed';
const MIGRATIONS_NEEDED = 'migrations_needed';
const STATUS_OK = 'status_ok';
const MIN_ID = 1000000;

export default class SQLiteAdapter {
  schema;

  migrations;

  database;

  _tag; // implements tag status database

  _dbName;

  constructor(options) {
    const {dbName, schema, migrations} = options;
    this.schema = schema;
    this.migrations = migrations;
    this._dbName = this._getName(dbName);

    if (process.env.NODE_ENV !== 'production') {
      validateAdapter(this);
    }
  }

  async init() {
    const database = await this._getDatabaseStatus(this.schema.version);

    logger.log(
      `[DB] Setting up database with schema version ${this.schema.version}`,
    );

    switch (database.status) {
      case DEFAULT_SCHEMA_NEEDED:
        await this._setUpWithDefaultSchema();
      // eslint-disable-next-line no-fallthrough
      case SCHEMA_NEEDED:
        await this._setUpWithSchema();
      // eslint-disable-next-line no-fallthrough
      case MIGRATIONS_NEEDED:
        await this._setUpWithMigrations(database);
        break;
      case STATUS_OK:
        break;
      default:
        invariant(false, 'Invalid database initialization status');
    }

    logger.log('[DB] Schema set up successfully');
  }

  async _getDatabaseStatus(currentDBVersion) {
    try {
      const hasDefaultSchema = await this._databaseHasDefaultSchema();
      const databaseVersion = hasDefaultSchema
        ? await this._getSchemaVersion()
        : 0;
      let database = {status: STATUS_OK, version: databaseVersion};

      if (!hasDefaultSchema) {
        database.status = DEFAULT_SCHEMA_NEEDED;
      } else if (databaseVersion === 0) {
        database.status = SCHEMA_NEEDED;
      } else if (databaseVersion < currentDBVersion) {
        database.status = MIGRATIONS_NEEDED;
      }

      return database;
    } catch (err) {
      return new Error('[ERROR TO INITIALIZE SCHEMA]', err);
    }
  }

  _getName(name) {
    if (process.env.NODE_ENV === 'test') {
      return name || `file:testdb${this._tag}?mode=memory&cache=shared`;
    }

    return name || 'twsqlite';
  }

  async execSchemas(schemas) {
    for (const schema of schemas) {
      schema && (await this.query(schema, []));
    }
  }

  async _getSchemaVersion() {
    const result = await this.query(
      'SELECT MAX(version) AS version FROM versions',
      [],
    );
    const version = result.rows.item(0).version;

    return version || 0;
  }

  async _databaseHasDefaultSchema() {
    const defaultAppSchema = await this.query(
      "SELECT name FROM sqlite_master WHERE type='table' AND name=:name",
      ['versions'],
    );

    return !!defaultAppSchema.rows.length;
  }

  async _exectuteMigrations(migrations) {
    const migrationsArr = migrations.split(';');

    await this.execSchemas(migrationsArr);
  }

  async _setUpWithMigrations({version, status}) {
    const migrationSteps = this._migrationSteps(version || 1);

    if (migrationSteps) {
      logger.log(
        `[DB] Migrating from version ${version} to ${this.schema.version}...`,
      );

      try {
        await this._exectuteMigrations(encodeMigrationSteps(migrationSteps));
        await this._insertMigrationsVersion();

        if (status === MIGRATIONS_NEEDED) {
          await this._insertSchemaVersion();
        }
      } catch (error) {
        logger.error('[DB] Migration failed', error);
        throw error;
      }

      logger.log('[DB] Migration successful');
    }
  }

  async _executeSchema(schemas) {
    try {
      const schemasArr = schemas.split(';');
      await this.execSchemas(schemasArr);
      await this._insertSchemaVersion();
    } catch (err) {
      throw new Error(err);
    }
  }

  async _setUpWithSchema() {
    await this._executeSchema(this._encodedSchema());
  }

  async _setUpWithDefaultSchema() {
    const defaultSchemas = encodeSchema(defaultSchema()).split(';');

    await this.execSchemas(defaultSchemas);
  }

  find(table, id) {
    // implements method find here
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
      return new Error('[ERROR TO OPEN DATABASE] ', err);
    }
  }

  _execBatch() {
    // implements action requested
  }

  batch(operations) {
    // implement batch here
  }

  _encodedSchema() {
    return encodeSchema(this.schema);
  }

  _migrationSteps(fromVersion) {
    const {stepsForMigration} = require('../../Schema/migrations/helpers');
    const {migrations} = this;

    // TODO: Remove this after migrations are shipped
    if (!migrations) {
      return null;
    }

    return stepsForMigration({
      migrations,
      fromVersion,
      toVersion: this.schema.version,
    });
  }

  _encodeMigrations(steps) {
    return encodeMigrationSteps(steps);
  }

  async getNextId(table) {
    const result = await this.query(
      `SELECT (MAX(ID) + 1) AS id FROM ${table}`,
      [],
    );
    const row = result.rows.item(0);

    return row.id || MIN_ID;
  }

  async _insertSchemaVersion() {
    const nextId = await this.getNextId('versions');
    const nextSchemaVersion = this.schema.version;
    const timestamp = Date.now();

    await this.query(
      'INSERT INTO versions (id, version, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [nextId, nextSchemaVersion, timestamp, timestamp],
    );
  }

  async getLastExecutedMigration() {
    const result = await this.query(
      'SELECT MAX(migration) AS migration FROM executed_migrations',
      [],
    );
    const row = result.rows.item(0);

    return row.migration || 0;
  }

  async _insertMigrationsVersion() {
    const lastExecutedMigration = await this.getLastExecutedMigration();
    const currentExecutedMigration = this.schema.version;

    for (let i = lastExecutedMigration; i === currentExecutedMigration; i++) {
      if (i !== lastExecutedMigration) {
        const nextId = await this.getNextId('executed_migrations');
        const timestamp = Date.now();

        await this.query(
          'INSERT INTO executed_migrations (id, migration, created_at, updated_at) VALUES (?, ?, ?, ?)',
          [nextId, i, timestamp, timestamp],
        );
      }
    }
  }
}
