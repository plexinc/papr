# Getting Started

_Prerequisites:_ [MongoDB](https://www.mongodb.com/) server (v3.6+) and [NodeJS](https://nodejs.org/) (v14+) installed.

## Install

First, we want to install `papr` in our project:

```
$ npm install --save papr
```

or

```
$ yarn add papr
```

## Connect

Next, we need to connect to mongodb first and initialize the library instance with a mongodb database object:

```ts
// papr.ts

import { MongoClient } from 'mongodb';
import Papr from 'papr';

export let client: MongoClient;

const papr = new Papr();

export async function connect() {
  client = await MongoClient.connect('mongodb://localhost:27017');

  papr.initialize(client.db('test'));

  await papr.updateSchemas();
}

export async function disconnect() {
  await client.close();
}

export default papr;
```

We will need to call `connect()` from our startup flow and `disconnect()` from our shutdown flow.

## Define a model

Then, we define a simple user model:

```ts
// User.ts

import { types, schema } from 'papr';
import papr from './papr';

const userSchema = schema({
  age: types.number(),
  firstName: types.string({ required: true }),
  lastName: types.string({ required: true }),
});

export type UserDocument = typeof userSchema[0];

const User = papr.model('users', userSchema);

export default User;
```

This code defines a [schema](api/schema.md) for our model, exports the generated TypeScript type from the schema and exports the model instance.

Papr supports with a wide varity of [types](api/types.md).

## Insert documents

Now we can start inserting documents using our new model:

```ts
// insert.ts

import { connect, disconnect } from './papr';
import User from './User';

await connect();

const user = await User.insertOne({
  firstName: 'John',
  lastName: 'Wick',
});
console.log(user);

await disconnect();
```

The object argument used in `insertOne()` will be checked by TypeScript and verify that it matches the schema type and will flag any deviation from the expected type. At runtime, MongoDB will check the document according to the schema as well and throw any error if there are data incosistencies.

Running this module would print out the following:

```
{ firstName: 'John', lastName: 'Wick', _id: 606ac819fa14e243e66ec4f4 }
```

## Query documents

Lastly, we can query documents using our new model:

```ts
// find.ts

import { connect, disconnect } from './papr';
import User from './User';

await connect();

const users = await User.find({ firstName: 'John' });
console.log(users);

await disconnect();
```

Running this module would result in the following:

```
[
  {
    _id: 606ac819fa14e243e66ec4f4,
    firstName: 'John',
    lastName: 'Wick'
  }
]
```

---

To understand more about `Papr` read about the [schema](schema.md) and explore the full [API](api/papr.md) and [Types](api/types.md) reference.
