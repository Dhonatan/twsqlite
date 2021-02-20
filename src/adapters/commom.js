import {invariant} from '../utils/common';

export function validateAdapter(adapter) {
  if (process.env.NODE_ENV !== 'production') {
    const {schema, migrations} = adapter;
    // TODO: uncomment when full migrations are shipped
    // invariant(migrations, `Missing migrations`)
    if (migrations) {
      invariant(
        migrations.validated,
        'Invalid migrations - use schemaMigrations() to create migrations. See docs for more details.',
      );

      const {minVersion, maxVersion} = migrations;

      invariant(
        maxVersion <= schema.version,
        // eslint-disable-next-line prettier/prettier
        `Migrations can't be newer than schema. Schema is version ${schema.version} and migrations cover range from ${minVersion} to ${maxVersion}`,
      );

      invariant(
        maxVersion === schema.version,
        // eslint-disable-next-line prettier/prettier
        `Missing migration. Database schema is currently at version ${schema.version}, but migrations only cover range from ${minVersion} to ${maxVersion}`,
      );
    }
  }
}
