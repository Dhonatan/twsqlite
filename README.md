# TWSqlite

### An ORM build on top SQLite for react-native

### ️️⚠️ `Use this library from the the version 1.10.3`

## Summary

- [Getting started](#getting-started)
- [Set up usage](#set-up-usage)
- [Schema](#schema)
- [Models](#models)
- [Create, Read, Update, Delete](#create-read-update-delete)
- [Migrations](#migrations)
- [See a simple example](https://gitlab.com/twoweb/libs/twsqlite/blob/twsqlite-1/example.js)

## Getting started

#### TWSqlite uses [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage) to interact to SQLite database so you should install it first.

Yarn:

```
yarn add @twoweb/twsqlite
```

NPM:

```
npm install --save @twoweb/twsqlite
```

## Set up usage

#### Create model/schema.js in your project:

```javascript
import {appSchema, tableSchema} from '@twoweb/twsqlite';

export default appSchema({
  version: 1,
  tables: [
    // tableSchemas go here...
  ],
});
```

You'll need it for [the next step](#schema). Now, in your index.js:

```javascript
import {Database} from '@twoweb/twsqlite';
import SQLiteAdapter from '@twoweb/twsqlite/adapters/sqlite';

import schema from './model/schema';
// import Post from './model/Post' // ⬅️ You'll import your Models here

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema,
});

// Then, make a twsqlite database from it!
const database = new Database({
  adapter,
  modelClasses: [
    // Post, // ⬅️ You'll add Models to twsqlite here
  ],
  actionsEnabled: true,
});
```

### ⚠️ `Each schema must be your Model, otherwise, twsqlite don't work`. See [Models](#models) here.

## Schema

When using TWSqlite, you're dealing with Models and Collections. However, underneath TWSqlite sits an underlying database (SQLite) which speaks a different language: tables and columns. Together, those are called a database schema and we must define it first.

## Defining a Schema

Say you want Models Post, Comment in your app. For each of those Models, you define a table. And for every field of a Model (e.g. name of the blog post, author of the comment) you define a column. For example:

```javascript
// model/schema.js
import {appSchema, tableSchema} from '@twoweb/twsqlite';

export const mySchema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'posts',
      columns: [
        {name: 'title', type: 'string'},
        {name: 'subtitle', type: 'string', isOptional: true},
        {name: 'body', type: 'string'},
        {name: 'is_pinned', type: 'boolean'},
      ],
    }),
    tableSchema({
      name: 'comments',
      columns: [
        {name: 'body', type: 'string'},
        {name: 'post_id', type: 'string', isIndexed: true},
      ],
    }),
  ],
});
```

- #### Note: It is database convention to use plural and snake_case names for table names. Column names are also snake_case. So `Post` become `posts` and `createdAt` becomes `created_at`.
- #### The columns `id`, `created_at` and `updated_at` are auto genereted, so if you try to overwrite you will get an error.

## Column types

- Columns have one of three types: `string`, `number`, or `boolean`.

- Fields of those types will default to `''`, `0`, or `false` respectively, if you create a record with a missing field.

- To allow fields to be `null`, mark the column as `isOptional: true`.

## Modifying Schema

Whenever you change the Schema, you must increment the version number. During development, this will cause the database to clear completely on next launch.

To seamlessly change the schema (without deleting data), use [Migrations](#migrations).

#### ⚠️ `Always use Migrations if you already shipped your app.`

## Indexing

To enable database indexing, add `isIndexed:true` to a column.

Indexing makes querying by a column faster, at the slight expense of create/update speed and database size.

For example, you will often want to query all comments belonging to a post (that is, query comments by its `post_id` column), and so you should mark the `post_id` column as indexed.

However, if you rarely query all comments by its author, indexing `author_id` is probably not worth it.

## Models

A Model class represents a type of thing in your app. For example, `Post`, `Comment`, `User`.

Before defining a Model, you first need to [define its schema](#schema).

#### Create a Model

Let's define the `Post` model:

```javascript
// model/Post
import {Model} from '@twoweb/twsqlite';

export default class Post extends Model {
  static table = 'posts';
}
```

Mark the table name for this Model. Now add the new Model to Database:

```javascript
// model/index.js
import Post from 'model/Post';

const database = new Database({
  // ...
  modelClasses: [Post],
});
```

#### Associations (Not implemented yet)

Your models almost surely relate to one another. A `Post` has many `Comments`. And every `Comment` belongs to a Post. (Every relation is double-sided). Define those associations like so:

```javascript
class Post extends Model {
  static table = 'posts';
  static associations = {
    comments: {type: 'has_many', foreignKey: 'post_id'},
  };
}

class Comment extends Model {
  static table = 'comments';
  static associations = {
    posts: {type: 'belongs_to', key: 'post_id'},
  };
}
```

On the "child" side (`comments`) you define a `belongs_to` association, and pass a column name (key) that points to the parent (`post_id` is the ID of the post the comment belongs to).

On the "parent" side (`posts`) you define an equivalent `has_many` association and pass the same column name (here named `foreignKey`).

## Create, Read, Update, Delete

When you have your [Schema](#schema) and [Models](#models) defined, learn how to manipulate them!

#### Collections

The `Collection` object is how you find, query, and create new records of a given type.

#### Get a collection

```javascript
const postsCollection = database.collections.get('posts');
```

⚠️ `Pass the table name as the argument`

#### Find a record (by ID)

```javascript
const post = await postsCollection.find(1556);
```

`find()` returns a object with the propertis of the table. Case don't have data, returns a empty object.

#### Find all

`findAll()` return all records of a table;

```javascript
const post = await postsCollection.findAll();
```

`findAll()` support five filters. They are: `where`, `limit`, `offset`, `group by` and `order by`. Each parameter is optional

```javascript
const post = await postsCollection.findAll({
  where: "title like '%javascript%'",
  offset: 0,
  limit: 25,
  groupBy: 'name ASC',
  orderBy: 'updated_at DESC',
});
```

#### Query records

Find a list of records matching given conditions using `.query()`:

```javascript
const allPosts = await postsCollection.query(
  'SELECT * FROM posts LEFT JOIN comments ON comments.post_id = posts.id ' +
    "WHERE updated_at > '2019-10-30 10:50:13'",
);
```

This way, you can do complex queries.

#### Create a new record

`create()` a new record and receive him after being saved.

```javascript
await postsCollection.create({
  name: 'Learn React Native',
  body: 'React Native is...',
  is_pinned: true,
});

// or receive the record saved
const post = await postsCollection.create({
  name: 'Learn React Native',
  body: 'React Native is...',
  is_pinned: true,
});
```

The fields `id`, `updated_at` and `created_at` are optinal. Twsqlite generate `id` (next id on the table), `updated_at` (timestamp) and `created_at` (timestamp) . Otherwise,
if you send the `id` or `updated_at` or `created_at` on create, twsqlite will send your values to record.

#### Create records with multiples inserts

If you need save a lot of date. Use the function bellow.

```javascript
await postsCollection.multipleInserts([
  {
    name: 'Learn React Native',
    body: 'React Native is...',
    is_pinned: true,
  },
  {
    name: 'Learn VueJS',
    body: 'Vue is...',
    is_pinned: false,
  },
  ...
]);

```

You can set optional params

```javascript
await postsCollection.multipleInserts([
  {
    name: 'Learn React Native',
    body: 'React Native is...',
    is_pinned: true,
  },
  {
    name: 'Learn VueJS',
    body: 'Vue is...',
    is_pinned: false,
  },
  ...
], {
  numberInsertsPerBatch: 200, // Default 500
  generateId: true, // Default false
  generateTimestamps: true, // Default false
});

```

The `multipleInserts` function works with batches of inserts. For example: We need to save 650 posts to the database. This way, the function will make 4 connections to the database to save the information. Three conections will save 200 posts per batch and one batch will save 50 posts.
  - The param `numberInsertsPerBatch` define the number of inserts per batch.
  - The param `generateId` defines whether it is necessary to generate the ID of each record that will be saved.
  - The param `generateTimestamps` defines whether it is necessary to generate the timestamps (created_at and updated_at) of each record that will be saved.

#### Update a record

The method update need to receive the columns to be updated and the clause where. After being saved, receive the record updated.

```javascript
await postsCollection.update({
  columns: {
    body: 'Edited - React Native is...',
    is_pinned: false,
  },
  where: {
    id: 1556,
  },
});

// or receive the record updated
const post = await postsCollection.update({
  columns: {
    body: 'Edited - React Native is...',
    is_pinned: false,
  },
  where: {
    id: 1556,
  },
});
```

The field `updated_at` is auto generated.

#### ⚠️ `The clause where only work with column id. Another clauses, not implemented yet`

#### Delete a record

Delete one record by `id`.

```javascript
await postsCollection.delete(1556);
```

#### Clean a table

Clear all data of a table

```javascript
await postsCollection.clean();
```

## Migrations

Schema migrations is the mechanism by which you can add new tables and columns to the database in a backward-compatible way.

Without migrations, if a user of your app upgrades from one version to another, their local database will be cleared at launch, and they will lose all their data.

#### ⚠️ `Always use migrations!`

## Migrations setup

- First, add a new file for migrations:

```javascript
// app/model/migrations/index.js

import {schemaMigrations} from '@twoweb/twsqlite/Schema/migrations';

export default schemaMigrations({
  migrations: [
    // We'll add migration definitions here later
  ],
});
```

2 Second, hook up migrations to the Database adapter setup:

```javascript
// index.js
import migrations from 'model/migrations';

const adapter = new SQLiteAdapter({
  schema: mySchema,
  migrations,
});
```

## Migrations workflow

When you make schema changes when you use migrations, be sure to do this in this specific order, to minimize the likelihood of making an error.

#### Step 1: Add a new migration

First, define the migration - that is, define the change that occurs between two versions of schema (such as adding a new table, or a new table column).

Don't change the schema file yet!

```javascript
// app/model/migrations// model/schema.js

export default appSchema({
  version: 2,
  tables: [
    // ...
  ]
})
import {
  schemaMigrations,
  createTable,
} from '@twoweb/twsqlite/Schema/migrations';

export default schemaMigrations({
  migrations: [
    {
      // Set this to a number one larger than the current schema version
      toVersion: 2,
      steps: [
        // See "Migrations API" for more details
        createTable({
          name: 'comments',
          columns: [
            {name: 'post_id', type: 'string', isIndexed: true},
            {name: 'body', type: 'string'},
          ],
        }),
      ],
    },
  ],
});
```

If run ypur app now. You should see this error:

#### `Migrations can't be newer than schema. Schema is version 1 and migrations cover range from 1 to 2`

If so, good, move to the next step!

But you might also see an error like "Missing table name in schema", which means you made an error in defining migrations. See [Migrations API](#migrations-api) below for details.

#### Step 2: Make matching changes in schema

Now it's time to make the actual changes to the schema file — add the same tables or columns as in your migration definition

⚠️ Please double and triple check that your changes to schema match exactly the change you defined in the migration. Otherwise you risk that the app will work when the user migrates, but will fail if it's a fresh install — or vice versa.

⚠️ Don't change the schema version yet

```javascript
// model/schema
export default appSchema({
  version: 1,
  tables: [
    // This is our new table!
    tableSchema({
      name: 'comments',
      columns: [
        {name: 'post_id', type: 'string', isIndexed: true},
        {name: 'body', type: 'string'},
      ],
    }),
    // ...
  ],
});
```

#### Step 3: Bump schema version

Now that we made matching changes in the schema (source of truth about tables and columns) and migrations (the change in tables and columns), it's time to commit the change by bumping the version:

```javascript
// model/schema
export default appSchema({
  version: 2,
  tables: [
    // ...
  ],
});
```

If you refresh again, your app should show up without issues — but now you can use the new tables/columns

#### Step 4: Test your migrations

Before shipping a new version of the app, please check that your database changes are all compatible:

Migrations test: Install the previous version of your app, then update to the version you're about to ship, and make sure it still works
Fresh schema install test: Remove the app, and then install the new version of the app, and make sure it works

#### Why is this order important

It's simply because React Native are configured to automatically refresh when you save a file (after 0.60). You don't want to database to accidentally migrate (upgrade) with changes that have a mistake, or changes you haven't yet completed making. By making migrations first, and bumping version last, you can double check you haven't made a mistake.

## Migrations API

Each migration must migrate to a version one above the previous migration, and have multiple steps (such as adding a new table, or new columns). Larger example:

```javascript
schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [
        // ...
      ],
    },
    {
      toVersion: 3,
      steps: [
        createTable({
          name: 'comments',
          columns: [
            {name: 'post_id', type: 'string', isIndexed: true},
            {name: 'body', type: 'string'},
          ],
        }),
        addColumns({
          table: 'posts',
          columns: [
            {name: 'subtitle', type: 'string', isOptional: true},
            {name: 'is_pinned', type: 'boolean'},
          ],
        }),
      ],
    },
  ],
});
```

#### Migration steps:

- `createTable({ name: 'table_name', columns: [ ... ] })` - same API as `tableSchema()`
- `addColumns({ table: 'table_name', columns: [ ... ] })` - you can add one or multiple columns to an existing table. The columns table has the same format as in schema definitions
- Other types of migrations (e.g. deleting or renaming tables and columns) are not yet implemented.
