<!-- THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY! -->

# Schema

A schema is what defines a Model and the validation performed on the collection associated with the Model.

## `schema`

Creates a schema for a model and define validation options for it.

Read more about the validation [options](https://docs.mongodb.com/manual/core/schema-validation/index.html#behavior)
in the MongoDB docs.

Under the hood it is just a wrapper around the [`object`](api/types.md#object) type with some default properties
(e.g. `_id` and timestamps properties).

While the default `_id` property is added with an `ObjectId` type, its type can be customized into a `string` or a `number`.

The options are exported as a result type (the second value in the return tuple).

The `defaults` option can be a static object, a function that returns an object or an async function that returns an object.

**Parameters:**

| Name                       | Type                          | Attribute |
| -------------------------- | ----------------------------- | --------- |
| `properties`               | `Record<string, unknown>`     | required  |
| `options`                  | `SchemaOptions`               | optional  |
| `options.defaults`         | `DefaultsOption<TProperties>` | optional  |
| `options.timestamps`       | `TimestampSchemaOptions`      | optional  |
| `options.validationAction` | `VALIDATION_ACTIONS`          | optional  |
| `options.validationLevel`  | `VALIDATION_LEVEL`            | optional  |

**Returns:**

`Array` The return type is `[TSchema, TOptions]`

**Example:**

```ts
import { schema, types } from 'papr';

const userSchema = schema({
  active: types.boolean(),
  age: types.number(),
  firstName: types.string({ required: true }),
  lastName: types.string({ required: true }),
});

export type UserDocument = (typeof userSchema)[0];
export type UserOptions = (typeof userSchema)[1];
```

**Example:**

```ts
// Example with static defaults, timestamps and validation options

import { schema, types, VALIDATION_ACTIONS, VALIDATION_LEVEL } from 'papr';

const orderSchema = schema(
  {
    _id: types.number({ required: true }),
    user: types.objectId({ required: true }),
    product: types.string({ required: true }),
  },
  {
    defaults: { product: 'test' },
    timestamps: true,
    validationAction: VALIDATION_ACTIONS.WARN,
    validationLevel: VALIDATION_LEVEL.MODERATE,
  }
);

export type OrderDocument = (typeof orderSchema)[0];
export type OrderOptions = (typeof orderSchema)[1];
```

**Example:**

```ts
// Example with static defaults of const enums

import { schema, types, VALIDATION_ACTIONS, VALIDATION_LEVEL } from 'papr';

const statuses = ['processing', 'shipped'] as const;
type Status = (typeof statuses)[number];

const orderSchema = schema(
  {
    _id: types.number({ required: true }),
    user: types.objectId({ required: true }),
    status: types.enum(statuses, { required: true }),
  },
  {
    defaults: {
      // const enums require the full type cast in defaults
      status: 'processing' as Status,
    },
  }
);

export type OrderDocument = (typeof orderSchema)[0];
export type OrderOptions = (typeof orderSchema)[1];
```

**Example:**

```ts
// Example with dynamic defaults

import { schema, types } from 'papr';

const userSchema = schema({
  active: types.boolean(),
  birthDate: types.date(),
  firstName: types.string({ required: true }),
  lastName: types.string({ required: true }),
}, {
  defaults: () => ({
    birthDate: new Date();
  })
});

export type UserDocument = (typeof userSchema)[0];
export type UserOptions = (typeof userSchema)[1];
```

**Example:**

```ts
// Example with async dynamic defaults

import { schema, types } from 'papr';

function getDateAsync(): Promise<Date> {
  return Promise.resolve(new Date());
}

const userSchema = schema({
  active: types.boolean(),
  birthDate: types.date(),
  firstName: types.string({ required: true }),
  lastName: types.string({ required: true }),
}, {
  defaults: async () => ({
    birthDate: await getDateAsync();
  })
});

export type UserDocument = (typeof userSchema)[0];
export type UserOptions = (typeof userSchema)[1];
```
