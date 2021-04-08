<!-- THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY! -->

# Papr



## `Papr`

Returns a new instance of `Papr`.

It may be called with some options for before and after hooks and a maximum execution time for queries.

**Parameters:**

| Name | Type | Attribute |
| --- | --- | --- |
| `options` | `ModelOptions` | optional |
| `options.hooks` | `Hooks` | optional |
| `options.maxTime` | `number` | optional |

**Example:**

```ts
const papr = new Papr();

const paprWithOptions = new Papr({
  hooks: {
    after: [afterHook],
    before: [beforeHook]
  },
  maxTime: 1000
});
```


## `initialize`

Initialize existing and future registered models with a mongo db instance

**Parameters:**

| Name | Type | Attribute |
| --- | --- | --- |
| `db` | `mongodb.Db` | required |

**Example:**

```ts
const connection = await mongodb.MongoClient.connect('mongodb://localhost:27017');

papr.initialize(connection.db('test'));
```


## `model`

Builds a model instance and associates its collection name and schema.

**Parameters:**

| Name | Type | Attribute |
| --- | --- | --- |
| `collectionName` | `string` | required |
| `collectionSchema` | `TSchema` | required |

**Returns:**

`Model<TSchema, TDefaults>` 

**Example:**

```ts
const User = papr.model('users', userSchema);
```


## `updateSchema`

Updates the validation schema and validation options on the MongoDB collection used by a model.

It uses the [`createCollection`](https://docs.mongodb.com/manual/reference/method/db.createCollection/)
method for new collections, and the [`collMod`](https://docs.mongodb.com/manual/reference/command/collMod/#dbcmd.collMod)
command for existing collections.

**Parameters:**

| Name | Type | Attribute |
| --- | --- | --- |
| `model` | `Model<TSchema, TDefaults>` | required |

**Returns:**

`Promise<void>` 

**Example:**

```ts
await papr.updateSchema(User);
```


## `updateSchemas`

Updates the validation schemas and validation options on all the MongoDB collections registered by models.

**Returns:**

`Promise<void>` 

**Example:**

```ts
await papr.updateSchemas();
```
