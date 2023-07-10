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

**Parameters:**

| Name                       | Type                      | Attribute |
| -------------------------- | ------------------------- | --------- |
| `properties`               | `Record<string, unknown>` | required  |
| `options`                  | `SchemaOptions`           | optional  |
| `options.defaults`         | `Partial<TProperties>`    | optional  |
| `options.timestamps`       | `TimestampSchemaOptions`  | optional  |
| `options.validationAction` | `VALIDATION_ACTIONS`      | optional  |
| `options.validationLevel`  | `VALIDATION_LEVEL`        | optional  |

**Returns:**

`Array` The return type is `[TSchema, TOptions]`

**Example:**

```ts
import { schema, types, VALIDATION_ACTIONS, VALIDATION_LEVEL } from 'papr';

const userSchema = schema({
  active: types.boolean(),
  age: types.number(),
  firstName: types.string({ required: true }),
  lastName: types.string({ required: true }),
});

export type UserDocument = (typeof userSchema)[0];
export type UserOptions = (typeof userSchema)[1];

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
