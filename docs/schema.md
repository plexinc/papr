# Schema

Schemas are the foundation of `papr`, providing type safety at runtime (via generated JSON Schemas) and compile time (via generated TypeScript types).

## Defining a Schema

The first step to interacting with `papr` is to define a schema, which describes the expected shape of documents in a particular collection.
(Throughout these examples, the `papr` object is an instance of `Papr` used for connecting to MongoDB. See [Getting Started](docs/getting-started.md))

```ts
import { schema, types } from 'papr';

// Create a new instance of Papr
const papr = new Papr();

const userSchema = schema({
  age: types.number(),
  firstName: types.string({ required: true }),
  lastName: types.string({ required: true }),
});
```

To interact with your collection using this schema, create two important derived types, the model type and the document type:

```ts
const UserDocument = typeof userSchema[0];
const UserModel = papr.model('users', userSchema);
```

## TypeScript Types

The Document type defined above can be used to type any documents returned from the collection, e.g.

```ts
const user = await UserModel.findOne({ firstName: 'Alice' });
user; // UserDocument
user.age; // number | undefined
user.firstName; // string
user.foo; // TypeScript error
```

Schemas also give models the power to understand projections:

```ts
const user = await UserModel.findOne({ firstName: 'Alice' }, { projection: { age: 1 } });
user; // Pick<UserDocument, 'age'>
user.age; // number | undefined
user.firstName; // TypeScript error
```

## JSON Schema

`papr` schemas provide an easy short-hand for creating JSON Schemas for validating documents on the MongoDB server using [JSON schema validation](https://docs.mongodb.com/manual/core/schema-validation/#json-schema):

```ts
papr.updateSchema(UserModel);
```

Calling this method will issue a [`collMod` command](https://docs.mongodb.com/manual/reference/command/collMod/#dbcmd.collMod) to MongoDB with a custom validator that is defined by your schema. In this case, it will look like:

```json
{
  "$jsonSchema": {
    "additionalProperties": false,
    "properties": {
      "_id": {
        "bsonType": "objectId"
      },
      "age": {
        "type": "number"
      },
      "firstName": {
        "type": "string"
      },
      "lastName": {
        "type": "string"
      }
    },
    "type": "object",
    "required": ["_id", "firstName", "lastName"]
  }
}
```

See the documentation for more examples and all supported [schema / validator options](api/schema.md).

With this validator applied to the collection, the following update would either fail (if `validationAction` is `error`) or output an error in the MongoDB server logs (if `validationAction` is `warn`) :

<!-- prettier-ignore -->
```ts
const result = await UserModel.update(
  { firstName: 'Alice' },
  { $set: { alias: 'Bob' } }
);
```

## Schema Updates

Whenever a change is made to a `papr` schema, [`updateSchema`](api/papr.md#updateschema) will need to be called in order to update the JSON Schema validator on the collection.

`papr` also provides a convenience method [`updateSchemas`](api/papr.md#updateschemas), to update all available schemas defined in the application.

---

Explore the full [API](api/papr.md) and [Types](api/types.md) reference.
