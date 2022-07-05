<!-- THIS FILE IS AUTO-GENERATED. DO NOT EDIT MANUALLY! -->

# Hooks

All the methods of the `Model` which call native MongoDB driver methods have hooks support.
The only exception is the custom `upsert` method.

## `Hook<TArgs>`

```
export type Hook<TArgs> = (params: {
  args: TArgs[];
  collectionName: string;
  context: Record<string, unknown>;
  error?: Error;
  methodName: HookMethodsNames;
  result?: unknown;
}) => Promise<void>;
```

The `context` parameter is an object which allows the `before` and `after` hooks to share
custom data between each other for a given operation (e.g. tracing ID, etc.).

The `result` parameter is only populated in the `after` hooks, and only for operations
which have a return value.

## `logHook`

Papr provides a basic logging hook creator, which returns a hook method, which in turn will print
the methods called on a collection with all its arguments.

This hook creator method takes in a single argument consisting of a basic logger function
which accepts one string argument, similar to `console.log`.

**Parameters:**

| Name  | Type  | Attribute |
| ----- | ----- | --------- |
| `log` | `Log` | required  |

**Returns:**

`Hook<TArgs>`

**Example:**

```ts
import Papr, { logHook } from 'papr';

const papr = new Papr({
  hooks: {
    before: [logHook(console.log)],
  },
});
```
