<!-- THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY! -->

# Schema

A schema is what defines a Model and the validation performed on the collection associated with the Model.

## `schema`

Creates a schema for a model and define validation options for it.

Read more about the validation [options](https://docs.mongodb.com/manual/core/schema-validation/index.html#behavior)
in the MongoDB docs.

Under the hood it is just a wrapper around the [`object`](api/types.md#object) type with some default properties
(e.g. `_id` and timestamps properties).

**Parameters:**

| Name | Type | Attribute |
| --- | --- | --- |
| `properties` | `Record<string, unknown>` | required |
| `options` | `SchemaOptions` | optional |
| `options.defaults` | `Partial<TProperties>` | optional |
| `options.timestamps` | `boolean` | optional |
| `options.validationAction` | `VALIDATION_ACTION` | optional |
| `options.validationLevel` | `VALIDATION_LEVEL` | optional |

**Returns:**

`TSchema` 

**Example:**

```ts
import { schema, types } from 'papr';

const userSchema = schema({
  active: types.boolean(),
  age: types.number(),
  firstName: types.string({ required: true }),
  lastName: types.string({ required: true }),
});

const orderSchema = schema({
  user: types.objectId(),
  product: types.string()
}, {
  defaults: { product: 'test' },
  timestamps: true,
  validationAction: VALIDATION_ACTION.WARN,
  validationLevel: VALIDATION_LEVEL.MODERATE
});
```
