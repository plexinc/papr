# Recipes

## Transactions

Because Papr model methods are simple wrappers around the official MongoDB driver methods,
they can be easily used with [MongoDB transactions](https://www.mongodb.com/docs/manual/core/transactions/).

```ts
import { MongoClient } from 'mongodb';
import Papr, { schema, types } from 'papr';

const papr = new Papr();

const client = await MongoClient.connect('mongodb://localhost:27017');

papr.initialize(connection.db('test'));

const User = papr.model(
  'users',
  schema({
    age: types.number(),
    firstName: types.string({ required: true }),
    lastName: types.string({ required: true }),
  })
);

await papr.updateSchemas();

const session = client.startSession();

try {
  await session.withTransaction(async () => {
    await User.insertOne(
      {
        firstName: 'John',
        lastName: 'Wick',
      },
      { session }
    );
    await User.insertOne(
      {
        firstName: 'John',
        lastName: 'Doe',
      },
      { session }
    );
  });
} finally {
  await session.endSession();
}
```

## Mongoose Migration

Migrating your Mongoose models to Papr is straightforward, but it's important to remember that Papr is not an ORM, so some of the functionality baked into your Mongoose models will need to be handled separately. This includes custom instance or static methods, query helpers, and index definitions.

### Timestamps

Timestamp support with Papr is exactly the same as Mongoose. You can define custom timestamp property names in the config options the same as you would with Mongoose. An example of this can be seen below.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const exampleSchema = new Schema(
  {
    name: { type: String },
  },
  {
    timestamps: true,
  }
);
```

```ts
import { schema, types } from 'papr';

const exampleSchema = schema(
  {
    name: types.string(),
  },
  {
    timestamps: true,
  }
);
```

### Default Values

Unlike Mongoose where default values are defined in the individual property options, Papr defines defaults in the schema options.

Note: Default values are only applied to paths where no value is set at the time of insert.

#### Static Default Values

To set defaults you can supply an object in your schema with static values.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const exampleSchema = new Schema({
  hidden: { type: Boolean, default: false, required: true },
});
```

```ts
import { schema, types } from 'papr';

const exampleSchema = schema(
  {
    switch: types.boolean({ required: true }),
  },
  {
    defaults: {
      switch: false,
    },
  }
);
```

#### Dynamic Default Values

Rather than supplying an object with your default values you can supply a function which will be executed at the time of insert and the returned values used as defaults.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const exampleSchema = new Schema({
  birthday: { type: Date, default: Date.now, required: true },
});
```

```ts
import { schema, types } from 'papr';

const exampleSchema = schema(
  {
    birthday: types.date({ required: true }),
  },
  {
    defaults: () => ({
      birthday: new Date(),
    }),
  }
);
```

### Version Key

Mongoose automatically adds a `versionKey` to all of your schemas - you will need to either remove that value from your collections or include the matching key in your Papr schema when migrating. The default value for this property is `__v`, but may be changed in your Mongoose schema options. An example of this can be seen below.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const exampleSchema = new Schema({
  name: { type: String },
});
```

```ts
import { schema, types } from 'papr';

const exampleSchema = schema({
  __v: types.number(),
  name: types.string(),
});
```

### Complete Example

This is an example of a complete schema migration from Mongoose to Papr with all of the above considerations taken into account.

```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    title: { type: String, required: true },
    author: { type: String, required: true },
    body: { type: String, required: true },
    comments: [{ body: String, date: Date }],
    hidden: { type: Boolean, default: false, required: true },
    meta: {
      votes: Number,
      favs: Number,
    },
    deletedAt: { type: Date },
  },
  { timestamps: true }
);
```

```ts
import { schema, types } from 'papr';

const postSchema = schema(
  {
    __v: types.number(),
    title: types.string({ required: true }),
    author: types.string({ required: true }),
    body: types.string({ required: true }),
    comments: types.array(
      types.object({
        body: types.string(),
        date: types.date(),
      })
    ),
    hidden: types.boolean({ required: true }),
    meta: types.object({
      votes: types.number(),
      favs: types.number(),
    }),
    deletedAt: types.date(),
  },
  {
    timestamps: true,
    defaults: {
      hidden: false,
    },
  }
);
```

## Filter Types

`mongodb` exposes two important TypeScript types for the most common operations you can do with the driver: the `Filter` (used for querying documents) and `UpdateFilter` (used for updating documents) types.

Starting with `mongodb` v4.3.0, these types were enhanced to support dot notation field access and type checking.

However, `mongodb` v5.0.0 [removed these types](https://github.com/mongodb/node-mongodb-native/blob/main/etc/notes/CHANGES_5.0.0.md#dot-notation-typescript-support-removed-by-default) as the default ones used in their methods and reverted to the old ones without dot notation support. The previous enhanced types were not removed, instead they were renamed to `StrictFilter` and `StrictUpdateFilter`, but they aren't referenced in any of their methods.

Papr v11 has adopted and enhanced these strict types to provide type safety for all query and update filters.

This comes with a caveat: whenever you need to interact with the `mongodb` driver collections, you need to cast filter types to their simple counterparts, since `Filter` is not compatible with `PaprFilter`.

```ts
import { Filter } from 'mongodb';
import { PaprFilter } from 'papr';
import User, { UserDocument } from './user';

const filter: PaprFilter<UserDocument> = {
  firstName: 'John',
};

await User.find(filter);

await User.collection.find(filter as Filter<UserDocument>);
```

## Integrations

There are community-maintained integrations with popular frameworks:

- [NestJS integration](https://github.com/vitaliy-grusha/nestjs-papr)
- [Fastify integration](https://github.com/inaiat/fastify-papr)
