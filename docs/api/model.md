<!-- THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY! -->

# Model

A model is the public interface in `papr` for working with a MongoDB collection.

All the examples here are using the following schema and model:

```js
const userSchema = schema({
  active: types.boolean(),
  age: types.number(),
  firstName: types.string({ required: true }),
  lastName: types.string({ required: true }),
});
const User = papr.model('users', userSchema);
```

## `aggregate`

Calls the MongoDB [`aggregate()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#aggregate) method.

The MongoDB aggregation pipeline syntax is very rich and powerful, however providing full typed support for the results is out of the scope of `papr`.

We provide a generic type to this method `TAggregate`, defaulted to the `TSchema` of the model, which can be used to customize the return type of the results.

**Parameters:**

| Name       | Type                             | Attribute |
| ---------- | -------------------------------- | --------- |
| `pipeline` | `Array<Record<string, unknown>>` | required  |
| `options`  | `AggregateOptions`               | optional  |

**Returns:**

`Promise<Array<TAggregate>>` A custom data type based on the pipeline steps

**Example:**

```ts
// The default results type is UserDocument
const results = await User.aggregate([{ $sortByCount: '$age' }, { $limit: 5 }]);

// Use custom results type
const results = await User.aggregate<{ age: number }>([
  { $sortByCount: '$age' },
  { $projection: { age: 1 } },
]);
```

## `bulkWrite`

Calls the MongoDB [`bulkWrite()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#bulkWrite) method.

**Parameters:**

| Name         | Type                                           | Attribute |
| ------------ | ---------------------------------------------- | --------- |
| `operations` | `Array<BulkWriteOperation<TSchema, TOptions>>` | required  |
| `options`    | `BulkWriteOptions`                             | optional  |

**Returns:**

[`Promise<BulkWriteResult>`](https://mongodb.github.io/node-mongodb-native/4.1/classes/BulkWriteResult.html)

**Example:**

```ts
const results = await User.bulkWrite([
  {
    insertOne: {
      document: {
        firstName: 'John',
        lastName: 'Wick',
      },
    },
  },
  {
    updateOne: {
      filter: { lastName: 'Wick' },
      update: {
        $set: { age: 40 },
      },
    },
  },
]);
```

## `countDocuments`

Calls the MongoDB [`countDocuments()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#countDocuments) method.

**Parameters:**

| Name      | Type                    | Attribute |
| --------- | ----------------------- | --------- |
| `filter`  | `Filter<TSchema>`       | required  |
| `options` | `CountDocumentsOptions` | optional  |

**Returns:**

`Promise<number>`

**Example:**

```ts
const countAll = await User.countDocuments({});
const countWicks = await User.countDocuments({ lastName: 'Wick' });
```

## `deleteMany`

Calls the MongoDB [`deleteMany()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#deleteMany) method.

**Parameters:**

| Name      | Type              | Attribute |
| --------- | ----------------- | --------- |
| `filter`  | `Filter<TSchema>` | required  |
| `options` | `DeleteOptions`   | optional  |

**Returns:**

[`Promise<DeleteResult>`](https://mongodb.github.io/node-mongodb-native/4.1/interfaces/DeleteResult.html)

**Example:**

```ts
await User.deleteMany({ lastName: 'Wick' });
```

## `deleteOne`

Calls the MongoDB [`deleteOne()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#deleteOne) method.

**Parameters:**

| Name      | Type              | Attribute |
| --------- | ----------------- | --------- |
| `filter`  | `Filter<TSchema>` | required  |
| `options` | `DeleteOptions`   | optional  |

**Returns:**

[`Promise<DeleteResult>`](https://mongodb.github.io/node-mongodb-native/4.1/interfaces/DeleteResult.html)

**Example:**

```ts
await User.deleteOne({ lastName: 'Wick' });
```

## `distinct`

Calls the MongoDB [`distinct()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#distinct) method.

**Parameters:**

| Name      | Type              | Attribute |
| --------- | ----------------- | --------- |
| `key`     | `keyof TSchema`   | required  |
| `filter`  | `Filter<TSchema>` | optional  |
| `options` | `DistinctOptions` | optional  |

**Returns:**

`Promise<Array<TValue>>` `TValue` is the type of the `key` field in the schema

**Example:**

```ts
const ages = await User.distinct('age');
```

## `exists`

Performs an optimized `find` to test for the existence of any document matching the filter criteria.

**Parameters:**

| Name      | Type                                                                        | Attribute |
| --------- | --------------------------------------------------------------------------- | --------- |
| `filter`  | `Filter<TSchema>`                                                           | required  |
| `options` | `Omit<FindOptions<TSchema>, ("projection" \| "limit" \| "sort" \| "skip")>` | optional  |

**Returns:**

`Promise<boolean>`

**Example:**

```ts
const isAlreadyActive = await User.exists({
  firstName: 'John',
  lastName: 'Wick',
  active: true,
});
```

## `find`

Calls the MongoDB [`find()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#find) method.

The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly. See also [`ProjectionType`](api/utils.md#ProjectionType).

**Parameters:**

| Name      | Type                   | Attribute |
| --------- | ---------------------- | --------- |
| `filter`  | `Filter<TSchema>`      | required  |
| `options` | `FindOptions<TSchema>` | optional  |

**Returns:**

`Promise<Array<TProjected>>`

**Example:**

```ts
const users = await User.find({ firstName: 'John' });
users[0]?.firstName; // valid
users[0]?.lastName; // valid

const usersProjected = await User.find({ firstName: 'John' }, { projection: { lastName: 1 } });
usersProjected[0]?.firstName; // TypeScript error
usersProjected[0]?.lastName; // valid
```

## `findById`

Calls the MongoDB [`findOne()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#findOne) method.

The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly. See also [`ProjectionType`](api/utils.md#ProjectionType).

**Parameters:**

| Name      | Type                    | Attribute |
| --------- | ----------------------- | --------- |
| `id`      | `string \| TSchema._id` | required  |
| `options` | `FindOptions<TSchema>`  | optional  |

**Returns:**

`Promise<(TProjected | null)>`

**Example:**

```ts
const user = await User.findById('606ac819fa14e243e66ec4f4');
user.firstName; // valid
user.lastName; // valid

const userProjected = await User.findById(new ObjectId('606ac819fa14e243e66ec4f4'), {
  projection: { lastName: 1 },
});
userProjected.firstName; // TypeScript error
userProjected.lastName; // valid
```

## `findOne`

Calls the MongoDB [`findOne()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#findOne) method.

The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly. See also [`ProjectionType`](api/utils.md#ProjectionType).

**Parameters:**

| Name      | Type                   | Attribute |
| --------- | ---------------------- | --------- |
| `filter`  | `Filter<TSchema>`      | required  |
| `options` | `FindOptions<TSchema>` | optional  |

**Returns:**

`Promise<(TProjected | null)>`

**Example:**

```ts
const user = await User.findOne({ firstName: 'John' });
user.firstName; // valid
user.lastName; // valid

const userProjected = await User.findOne({ firstName: 'John' }, { projection: { lastName: 1 } });
userProjected.firstName; // TypeScript error
userProjected.lastName; // valid
```

## `findOneAndDelete`

Calls the MongoDB [`findOneAndDelete()`](http://mongodb.github.io/node-mongodb-native/4.1/classes/collection.html#findoneanddelete) method and returns the document found before removal.

The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly. See also [`ProjectionType`](api/utils.md#ProjectionType).

**Parameters:**

| Name      | Type                      | Attribute |
| --------- | ------------------------- | --------- |
| `filter`  | `Filter<TSchema>`         | required  |
| `options` | `FindOneAndUpdateOptions` | optional  |

**Returns:**

`Promise<(TProjected | null)>`

**Example:**

```ts
const user = await User.findOneAndDelete({ firstName: 'John' });
```

## `findOneAndUpdate`

Calls the MongoDB [`findOneAndUpdate()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#findOneAndUpdate) method.

The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly. See also [`ProjectionType`](api/utils.md#ProjectionType).

**Parameters:**

| Name      | Type                      | Attribute |
| --------- | ------------------------- | --------- |
| `filter`  | `Filter<TSchema>`         | required  |
| `update`  | `UpdateFilter<TSchema>`   | required  |
| `options` | `FindOneAndUpdateOptions` | optional  |

**Returns:**

`Promise<(TProjected | null)>`

**Example:**

```ts
const user = await User.findOneAndUpdate({ firstName: 'John' }, { $set: { age: 40 } });
user.firstName; // valid
user.lastName; // valid

const userProjected = await User.findOneAndUpdate(
  { firstName: 'John' },
  { $set: { age: 40 } },
  { projection: { lastName: 1 } }
);
userProjected.firstName; // TypeScript error
userProjected.lastName; // valid
```

## `insertMany`

Calls the MongoDB [`insertMany()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#insertMany) method.

**Parameters:**

| Name        | Type                                          | Attribute |
| ----------- | --------------------------------------------- | --------- |
| `documents` | `Array<DocumentForInsert<TSchema, TOptions>>` | required  |
| `options`   | `BulkWriteOptions`                            | optional  |

**Returns:**

`Promise<Array<TSchema>>`

**Example:**

```ts
const users = await User.insertMany([
  { firstName: 'John', lastName: 'Wick' },
  { firstName: 'John', lastName: 'Doe' },
]);
```

## `insertOne`

Calls the MongoDB [`insertOne()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#insertOne) method.

**Parameters:**

| Name       | Type                                   | Attribute |
| ---------- | -------------------------------------- | --------- |
| `document` | `DocumentForInsert<TSchema, TOptions>` | required  |
| `options`  | `InsertOneOptions`                     | optional  |

**Returns:**

`Promise<TSchema>`

**Example:**

```ts
const users = await User.insertOne([
  { firstName: 'John', lastName: 'Wick' },
  { firstName: 'John', lastName: 'Doe' },
]);
```

## `updateMany`

Calls the MongoDB [`updateMany()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#updateMany) method.

**Parameters:**

| Name      | Type                    | Attribute |
| --------- | ----------------------- | --------- |
| `filter`  | `Filter<TSchema>`       | required  |
| `update`  | `UpdateFilter<TSchema>` | required  |
| `options` | `UpdateOptions`         | optional  |

**Returns:**

[`Promise<UpdateResult>`](https://mongodb.github.io/node-mongodb-native/4.1/interfaces/UpdateResult.html)

**Example:**

```ts
const result = await User.updateMany({ firstName: 'John' }, { $set: { age: 40 } });
```

## `updateOne`

Calls the MongoDB [`updateOne()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#updateOne) method.

**Parameters:**

| Name      | Type                    | Attribute |
| --------- | ----------------------- | --------- |
| `filter`  | `Filter<TSchema>`       | required  |
| `update`  | `UpdateFilter<TSchema>` | required  |
| `options` | `UpdateOptions`         | optional  |

**Returns:**

[`Promise<UpdateResult>`](https://mongodb.github.io/node-mongodb-native/4.1/interfaces/UpdateResult.html)

**Example:**

```ts
const result = await User.updateOne({ firstName: 'John' }, { $set: { age: 40 } });
```

## `upsert`

Calls the MongoDB [`findOneAndUpdate()`](https://mongodb.github.io/node-mongodb-native/4.1/classes/Collection.html#findOneAndUpdate) method with the `upsert` option enabled.

**Parameters:**

| Name     | Type                    | Attribute |
| -------- | ----------------------- | --------- |
| `filter` | `Filter<TSchema>`       | required  |
| `update` | `UpdateFilter<TSchema>` | required  |

**Returns:**

`Promise<TSchema>`

**Example:**

```ts
const user = await User.upsert({ firstName: 'John', lastName: 'Wick' }, { $set: { age: 40 } });
```
