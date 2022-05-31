# About Papr

`papr` is a lightweight library built around the MongoDB NodeJS driver, written in TypeScript. It supercharges your node.js application’s relationship to the MongoDB driver, providing strong validation of your data via JSON schema validation and type safety with built-in TypeScript types.

`papr` uses MongoDB's [JSON Schema validation](https://docs.mongodb.com/manual/core/schema-validation/#json-schema) feature to enable validation of document writes at runtime.

`papr` has a familiar API - if you have used the raw `mongodb` methods to query and change documents before, then you already know how to use `papr`.

<!-- prettier-ignore -->
```ts
import { MongoClient } from 'mongodb';
import Papr, { schema, types } from 'papr';

const papr = new Papr();

const connection = await MongoClient.connect('mongodb://localhost:27017');
papr.initialize(connection.db('test'));

const User = papr.model('users', schema({
  age: types.number(),
  firstName: types.string({ required: true }),
  lastName: types.string({ required: true }),
}));

await papr.updateSchemas();

const johnWick = await User.find({ firstName: 'John', lastName: 'Wick' });
```

## Declare once, get safety everywhere

With `papr`, you can rest assured that you will know what properties a given document will have, at runtime _and_ at compile time, all from the same simple schema definitions.

`papr` types are declared in your application via schemas. These schemas provide strong Typescript typings (even taking into account query projections) in your code, so you can interact with MongoDB with confidence. Those same types are also used to create a JSON schema, which can then be applied directly to a MongoDB collection, providing strong type safety to your MongoDB data as well. `papr` thus provides typing confidence at runtime and at compile time.

## Why not use Mongoose?

[Mongoose](https://mongoosejs.com/) is by far the most popular, and common, way to interact with MongoDB in node. Mongoose is a great solution for many use-cases. It is certainly the best starter library for new MongoDB users.

Mongoose is fundamentally an ORM. It provides a rich interface for modeling data and for querying and saving data, using a custom API for creating object models for passing mongo data around.

`papr` takes a different approach from Mongoose, and is more appropriate for more advanced usage, especially at scale:

### Simplicity

The feature set of Papr is deliberately small, providing only a paper-thin layer (see what we did there? :D) on top of the MongoDB driver. Features like `populate` (a MongoDB "join" to another collection), conditional default values and virtuals are not available.

### Validation in the MongoDB Server

In Mongoose, validation is implemented by the library itself, so the validation takes place in your application's runtime. By contrast, `papr` provides a simple way to create a JSON schema for your collection, offloading the validation to the MongoDB server.

In addition, `papr` validations run on all operations (inserts, updates, and bulkWrite operations) by default, with no configuration necessary, whereas Mongoose by default does not validate update operations or bulkWrite operations.

The JSON Schema validation feature is available in MongoDB server since version 3.6. MongoDB v5.0 greatly improves the validation errors thrown by the server, for more info read this [blog post from MongoDB](https://developer.mongodb.com/article/mongodb-5-0-schema-validation/).

### Speed

Due to its bare feature set and validation run in the MongoDB server, Papr is _fast_.

```
mongodb.insert ~ 748.81 ops/sec
papr.insert ~ 711.09 ops/sec
mongoose.insert ~ 530.22 ops/sec
---
mongodb.find ~ 598.82 ops/sec
papr.find ~ 589.31 ops/sec
mongoose.find ~ 478.46 ops/sec
---
mongodb.update ~ 755.38 ops/sec
papr.update ~ 696.47 ops/sec
mongoose.update ~ 598.28 ops/sec
```

![](benchmark.svg)

The chart represents operations per second.

The benchmark numbers are from a benchmark with:

- Node.js 14.19.3
- MongoDB server v5.0.2
- `mongodb` v4.6.0
- `papr` v4.0.0
- `mongoose` v6.3.5

This benchmark can be run locally with `yarn benchmark`. Run `yarn benchmark --help` for more information on available arguments.

---

Read how to [get started](getting-started.md) with `Papr`.
