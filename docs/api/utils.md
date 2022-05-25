<!-- THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY! -->

# Utilities

## `DocumentForInsert`

This TypeScript type is useful to define an document representation for an insertion operation, where the `_id` and
other properties which have defaults defined are not required.

```ts
import { DocumentForInsert } from 'papr';

import type { OrderDocument, OrderDefaults } from './schema';

const newOrder: DocumentForInsert<OrderDocument, OrderDefaults> = {
  user: 'John',
};

newOrder._id; // ObjectId | undefined
newOrder.user; // string
newOrder.product; // string | undefined
```

## `ProjectionType`

This TypeScript type is useful to compute the sub-document resulting from a `find*` operation which used a projection.

```ts
import { ProjectionType } from 'papr';

const projection = {
  firstName: 1,
};

type UserProjected = ProjectionType<UserDocument, typeof projection>;

const user: UserProjected = await User.findOne({}, { projection });

user?.firstName; // value
user?.lastName; // TypeScript error
```

## `VALIDATION_ACTIONS`

```ts
enum VALIDATION_ACTIONS {
  ERROR = 'error',
  WARN = 'warn',
}
```

## `VALIDATION_LEVEL`

```ts
enum VALIDATION_LEVEL {
  MODERATE = 'moderate',
  OFF = 'off',
  STRICT = 'strict',
}
```
