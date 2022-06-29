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
