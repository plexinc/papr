<!-- THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY! -->

# Types

Types are the building blocks of `papr` [schemas](schema.md), which provide TypeScript type definitions,
as well as the ability to generate [JSON schema](https://docs.mongodb.com/manual/core/schema-validation/#json-schema)
for validators in MongoDB collections.

Some types have additional options, based on the available options from JSON schema for that data type.

The following data types are available to define the schemas of your `papr` models:

## `array`

Creates an array consisting of items of a single type.

**Parameters:**

| Name                  | Type           | Attribute |
| --------------------- | -------------- | --------- |
| `item`                | `TItem`        | required  |
| `options`             | `ArrayOptions` | optional  |
| `options.maxItems`    | `number`       | optional  |
| `options.minItems`    | `number`       | optional  |
| `options.required`    | `boolean`      | optional  |
| `options.uniqueItems` | `boolean`      | optional  |

**Example:**

```ts
import { schema, types } from 'papr';

schema({
  requiredList: types.array(types.number(), { required: true }),
  optionalList: types.array(types.number()),
  // All inner types are `required` by default, so optionalList and anotherOptionalList
  // are equivalent types
  anotherOptionalList: types.array(types.number({ required: true }))
  listWithAllOptions: types.array(types.number(), {
    maxItems: 10,
    minItems: 1,
    required: true,
    uniqueItems: true,
  }),
});
```

## `binary`

Creates a binary type. Useful for storing `Buffer` or any other binary data.

**Parameters:**

| Name               | Type             | Attribute |
| ------------------ | ---------------- | --------- |
| `options`          | `GenericOptions` | optional  |
| `options.required` | `boolean`        | optional  |

**Example:**

```ts
import { schema, types } from 'papr';

schema({
  requiredBinary: types.binary({ required: true }),
  optionalBinary: types.binary(),
});
```

## `boolean`

Creates a boolean type.

**Parameters:**

| Name               | Type             | Attribute |
| ------------------ | ---------------- | --------- |
| `options`          | `GenericOptions` | optional  |
| `options.required` | `boolean`        | optional  |

**Example:**

```ts
import { schema, types } from 'papr';

schema({
  requiredBoolean: types.boolean({ required: true }),
  optionalBoolean: types.boolean(),
});
```

## `date`

Creates a date type.

**Parameters:**

| Name               | Type             | Attribute |
| ------------------ | ---------------- | --------- |
| `options`          | `GenericOptions` | optional  |
| `options.required` | `boolean`        | optional  |

**Example:**

```ts
import { schema, types } from 'papr';

schema({
  requiredDate: types.date({ required: true }),
  optionalDate: types.date(),
});
```

## `enum`

With `enum` you can create an enum type either:

- based on a TypeScript `enum` structure
- based on an array of `const`

Enum types may contain `null` as well.

**Parameters:**

| Name               | Type             | Attribute |
| ------------------ | ---------------- | --------- |
| `values`           | `Array<TValue>`  | required  |
| `options`          | `GenericOptions` | optional  |
| `options.required` | `boolean`        | optional  |

**Example:**

```ts
import { schema, types } from 'papr';

enum SampleEnum {
  foo = 'foo',
  bar = 'bar',
}

const SampleArray = ['foo' as const, 'bar' as const];

schema({
  // type: SampleEnum
  requiredEnum: types.enum(Object.values(SampleEnum), { required: true }),
  // type: SampleEnum | undefined
  optionalEnum: types.enum(Object.values(SampleEnum)),
  // type: SampleEnum | null | undefined
  optionalEnumWithNull: types.enum([...Object.values(SampleEnum), null]),
  // type: 'foo' | 'bar'
  requiredEnumAsConstArray: types.enum(SampleArray, { required: true }),
  // type: 'foo' | 'bar' | undefined
  optionalEnumAsConstArray: types.enum(SampleArray),
});
```

## `number`

Creates a number type.

**Parameters:**

| Name                       | Type            | Attribute |
| -------------------------- | --------------- | --------- |
| `options`                  | `NumberOptions` | optional  |
| `options.enum`             | `Array<number>` | optional  |
| `options.exclusiveMaximum` | `boolean`       | optional  |
| `options.exclusiveMinimum` | `boolean`       | optional  |
| `options.maximum`          | `number`        | optional  |
| `options.minimum`          | `number`        | optional  |
| `options.mulitpleOf`       | `number`        | optional  |
| `options.required`         | `boolean`       | optional  |

**Example:**

```ts
import { schema, types } from 'papr';

schema({
  optionalNumber: types.number(),
  requiredNumber: types.number({ required: true }),
  numberWithAllOptions: types.number({
    enum: [1, 2, 3, 5, 8, 13],
    exclusiveMaximum: true,
    exclusiveMinimum: true,
    maximum: 0,
    minimum: 14,
    multipleOf: 1,
    required: true,
  }),
});
```

## `object`

Creates an object type specifying all the known properties upfront.

**Parameters:**

| Name                           | Type                            | Attribute |
| ------------------------------ | ------------------------------- | --------- |
| `properties`                   | `TProperties`                   | required  |
| `options`                      | `ObjectOptions`                 | optional  |
| `options.additionalProperties` | `boolean`                       | optional  |
| `options.dependencies`         | `Record<string, Array<string>>` | optional  |
| `options.maxProperties`        | `number`                        | optional  |
| `options.minProperties`        | `number`                        | optional  |
| `options.patternProperties`    | `Record<string, unknown>`       | optional  |
| `options.required`             | `boolean`                       | optional  |

**Example:**

```ts
import { schema, types } from 'papr';

schema({
  optionalObject: types.object({
    foo: types.number(),
    bar: types.string(),
  }),
  requiredObject: types.object(
    {
      foo: types.number(),
      bar: types.string(),
    },
    { required: true }
  ),
  objectWithAllOptions: types.object(
    {
      foo: types.number(),
      bar: types.string(),
    },
    {
      additionalProperties: true,
      dependencies: {
        foo: ['bar'],
      },
      maxProperties: 10,
      minProperties: 2,
      patternProperties: {
        '^f.+': { type: 'string' },
      },
      required: true,
    }
  ),
});
```

## `objectGeneric`

Creates an object type without any upfront properties defined, instead you define only a pattern for the properties names. All properties will expect the same type as value (`TValue`).

Note: It's recommended to avoid using such a type. It might throw a TypeScript error (TS2589) in the projection logic due to the looseness of the type definition.

**Parameters:**

| Name                           | Type                            | Attribute |
| ------------------------------ | ------------------------------- | --------- |
| `value`                        | `TValue`                        | required  |
| `pattern`                      | `string`                        | optional  |
| `options`                      | `ObjectOptions`                 | optional  |
| `options.additionalProperties` | `boolean`                       | optional  |
| `options.dependencies`         | `Record<string, Array<string>>` | optional  |
| `options.maxProperties`        | `number`                        | optional  |
| `options.minProperties`        | `number`                        | optional  |
| `options.required`             | `boolean`                       | optional  |

**Example:**

```ts
import { schema, types } from 'papr';

schema({
  // This accepts any property name with the value as a number
  optionalObjectGeneric: types.objectGeneric(types.number()),
  // This accepts only objects with properties starting with `foo`
  requiredObjectGeneric: types.objectGeneric(types.number(), '^foo.+', { required: true }),
});
```

## `objectId`

Creates an `ObjectId` type.

**Parameters:**

| Name               | Type             | Attribute |
| ------------------ | ---------------- | --------- |
| `options`          | `GenericOptions` | optional  |
| `options.required` | `boolean`        | optional  |

**Example:**

```ts
import { schema, types } from 'papr';

schema({
  optionalObjectId: types.objectId(),
  requiredObjectId: types.objectId({ required: true }),
});
```

## `string`

Creates a string type.

**Parameters:**

| Name                | Type            | Attribute |
| ------------------- | --------------- | --------- |
| `options`           | `StringOptions` | optional  |
| `options.enum`      | `Array<string>` | optional  |
| `options.maxLength` | `number`        | optional  |
| `options.minLength` | `number`        | optional  |
| `options.pattern`   | `string`        | optional  |
| `options.required`  | `boolean`       | optional  |

**Example:**

```ts
import { schema, types } from 'papr';

schema({
  optionalString: types.string(),
  requiredString: types.string({ required: true }),
  stringWithAllOptions: types.number({
    enum: ['foo', 'bar'],
    maxLength: 3,
    minLength: 1,
    pattern: '^\\w+$',
    required: true,
  }),
});
```

## `any`

We recommend avoiding this type. It only exists as an escape hatch for unknown data.

**Example:**

```ts
import { schema, types } from 'papr';

schema({
  unknownData: types.any(),
});
```
