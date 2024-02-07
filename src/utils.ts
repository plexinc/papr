/* eslint-disable no-use-before-define */

import { ObjectId } from 'mongodb';
import type { Join, KeysOfAType, OptionalId, WithId } from 'mongodb';
import type { DeepPick } from './DeepPick';
import type { Hooks } from './hooks';
import type { PaprBulkWriteOperation, PaprUpdateFilter } from './mongodbTypes';
import type { DefaultsOption, SchemaOptions, SchemaTimestampOptions } from './schema';

// Some of the types are adapted from originals at: https://github.com/mongodb/node-mongodb-native/blob/v5.0.1/src/mongo_types.ts
// licensed under Apache License 2.0: https://github.com/mongodb/node-mongodb-native/blob/v5.0.1/LICENSE.md

export enum VALIDATION_ACTIONS {
  ERROR = 'error',
  WARN = 'warn',
}

export enum VALIDATION_LEVEL {
  MODERATE = 'moderate',
  OFF = 'off',
  STRICT = 'strict',
}

export interface BaseSchema {
  _id: ObjectId | number | string;
}

type TimestampSchemaProperty<
  TProperty extends keyof Exclude<SchemaTimestampOptions, boolean>,
  TOptions extends SchemaTimestampOptions | undefined,
> = TOptions extends object
  ? TOptions[TProperty] extends string
    ? TOptions[TProperty]
    : TProperty
  : TOptions extends false
    ? never
    : TProperty;

export type TimestampSchema<TOptions extends SchemaTimestampOptions | undefined> = {
  [key in
    | TimestampSchemaProperty<'createdAt', TOptions>
    | TimestampSchemaProperty<'updatedAt', TOptions>]: Date;
};

export interface ModelOptions {
  hooks?: Hooks;
  maxTime?: number;
}

export type DocumentForInsertWithoutDefaults<TSchema, TDefaults extends Partial<TSchema>> = Omit<
  OptionalId<TSchema>,
  keyof TDefaults
> &
  Partial<Pick<TSchema, keyof TDefaults & keyof TSchema>>;

export type SchemaDefaultValues<
  TSchema,
  TOptions extends SchemaOptions<TSchema>,
> = TOptions['defaults'] extends () => infer ReturnDefaults
  ? Awaited<ReturnDefaults>
  : TOptions['defaults'];

export type DocumentForInsert<
  TSchema,
  TOptions extends SchemaOptions<TSchema>,
  TDefaults extends NonNullable<SchemaDefaultValues<TSchema, TOptions>> = NonNullable<
    SchemaDefaultValues<TSchema, TOptions>
  >,
> = TOptions['timestamps'] extends SchemaTimestampOptions
  ? TOptions['timestamps'] extends false
    ? DocumentForInsertWithoutDefaults<TSchema, TDefaults>
    : Omit<
        DocumentForInsertWithoutDefaults<TSchema, TDefaults>,
        keyof TimestampSchema<TOptions['timestamps']>
      > &
        Partial<TimestampSchema<TOptions['timestamps']>>
  : DocumentForInsertWithoutDefaults<TSchema, TDefaults>;

export type Identity<Type> = Type;

export type Flatten<Type extends object> = Identity<{
  [Key in keyof Type]: Type[Key];
}>;

/**
 * Returns tuple of strings (keys to be joined on '.') that represent every path into a schema
 *
 * https://docs.mongodb.com/manual/tutorial/query-embedded-documents/
 *
 * @remarks
 * Through testing we determined that a depth of 6 is safe for the typescript compiler
 * and provides reasonable compilation times. This number is otherwise not special and
 * should be changed if issues are found with this level of checking. Beyond this
 * depth any helpers that make use of NestedPaths should devolve to not asserting any
 * type safety on the input.
 */
export type NestedPaths<Type, Depth extends number[]> = Depth['length'] extends 6
  ? []
  : Type extends
        | Buffer
        | Date
        | RegExp
        | Uint8Array
        | boolean
        | number
        | string
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        | ((...args: any[]) => any)
        | {
            _bsontype: string;
          }
    ? []
    : Type extends readonly (infer ArrayType)[]
      ? // This returns the non-indexed dot-notation path: e.g. `foo.bar`
        | [...NestedPaths<ArrayType, [...Depth, 1]>]
          // This returns the array parent itself: e.g. `foo`
          | []
          // This returns the indexed dot-notation path: e.g. `foo.0.bar`
          | [number, ...NestedPaths<ArrayType, [...Depth, 1]>]
          // This returns the indexed element path: e.g. `foo.0`
          | [number]
      : // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Type extends Map<string, any>
        ? [string]
        : Type extends object
          ? {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              [Key in Extract<keyof Type, string>]: Type[Key] extends readonly any[]
                ? [Key, ...NestedPaths<Type[Key], [...Depth, 1]>] // child is not structured the same as the parent
                : [Key, ...NestedPaths<Type[Key], [...Depth, 1]>] | [Key];
            }[Extract<keyof Type, string>]
          : [];

type FilterProperties<TObject, TValue> = Pick<TObject, KeysOfAType<TObject, TValue>>;

export type ProjectionType<
  TSchema extends BaseSchema,
  Projection extends
    | Partial<Record<Join<NestedPaths<WithId<TSchema>, []>, '.'>, number>>
    | undefined,
> = undefined extends Projection
  ? WithId<TSchema>
  : keyof FilterProperties<Projection, 0 | 1> extends never
    ? WithId<DeepPick<TSchema, '_id' | (string & keyof Projection)>>
    : keyof FilterProperties<Projection, 1> extends never
      ? Omit<WithId<TSchema>, keyof FilterProperties<Projection, 0>>
      : Omit<
          WithId<DeepPick<TSchema, '_id' | (string & keyof Projection)>>,
          keyof FilterProperties<Projection, 0>
        >;

export type Projection<TSchema> = Partial<
  Record<Join<NestedPaths<WithId<TSchema>, []>, '.'>, number>
>;

export type PropertyNestedType<
  Type,
  Property extends string,
> = Property extends `${infer Key}.${infer Rest}`
  ? Key extends `${number}`
    ? // indexed array nested properties
      NonNullable<Type> extends readonly (infer ArrayType)[]
      ? PropertyType<ArrayType, Rest>
      : unknown
    : // object nested properties & non-indexed array nested properties
      Key extends keyof Type
      ? Type[Key] extends Map<string, infer MapType>
        ? MapType
        : PropertyType<NonNullable<Type[Key]>, Rest>
      : unknown
  : unknown;

export type PropertyType<Type, Property extends string> = string extends Property
  ? unknown
  : // object properties
    Property extends keyof Type
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      Type extends Record<string, any>
      ? Property extends `${string}.${string}`
        ? PropertyNestedType<NonNullable<Type>, Property>
        : Type[Property]
      : Type[Property]
    : Type extends readonly (infer ArrayType)[]
      ? // indexed array properties
        Property extends `${number}`
        ? ArrayType
        : // non-indexed array properties
          Property extends keyof ArrayType
          ? PropertyType<ArrayType, Property>
          : PropertyNestedType<NonNullable<Type>, Property>
      : PropertyNestedType<NonNullable<Type>, Property>;

export type RequireAtLeastOne<TObj, Keys extends keyof TObj = keyof TObj> = {
  [Key in Keys]-?: Partial<Pick<TObj, Exclude<Keys, Key>>> & Required<Pick<TObj, Key>>;
}[Keys] &
  Pick<TObj, Exclude<keyof TObj, Keys>>;

export function getIds(ids: Set<string> | readonly (ObjectId | string)[]): ObjectId[] {
  return [...ids].map((id) => new ObjectId(id));
}

/**
 * @module intro
 * @description
 *
 * ## `DocumentForInsert`
 *
 * This TypeScript type is useful to define an document representation for an insertion operation, where the `_id` and
 * other properties which have defaults defined are not required.
 *
 * ```ts
 * import { DocumentForInsert } from 'papr';
 *
 * import type { OrderDocument, OrderOptions } from './schema';
 *
 * const newOrder: DocumentForInsert<OrderDocument, OrderOptions> = {
 *   user: 'John',
 * };
 *
 * newOrder._id; // ObjectId | undefined
 * newOrder.user; // string
 * newOrder.product; // string | undefined
 * ```
 *
 * ## `ProjectionType`
 *
 * This TypeScript type is useful to compute the sub-document resulting from a `find*` operation which used a projection.
 *
 * ```ts
 * import { ProjectionType } from 'papr';
 *
 * const projection = {
 *   firstName: 1
 * };
 *
 * type UserProjected = ProjectionType<UserDocument, typeof projection>;
 *
 * const user: UserProjected = await User.findOne({}, { projection });
 *
 * user?._id; // value
 * user?.firstName; // value
 * user?.lastName; // TypeScript error
 * user?.age; // TypeScript error
 * ```
 *
 * When this type is used in conjunction with `as const`, it allows projections with excluding fields.
 *
 * ```ts
 * import { ProjectionType } from 'papr';
 *
 * const projection = {
 *   firstName: 0,
 * } as const;
 *
 * type UserProjected = ProjectionType<UserDocument, typeof projection>;
 *
 * const user: UserProjected = await User.findOne({}, { projection });
 *
 * user?._id; // value
 * user?.firstName; // TypeScript error
 * user?.lastName; // value
 * user?.age; // value
 * ```
 *
 * ## `VALIDATION_ACTIONS`
 *
 * ```ts
 * enum VALIDATION_ACTIONS {
 *   ERROR = 'error',
 *   WARN = 'warn',
 * }
 * ```
 *
 * ## `VALIDATION_LEVEL`
 *
 * ```ts
 * enum VALIDATION_LEVEL {
 *   MODERATE = 'moderate',
 *   OFF = 'off',
 *   STRICT = 'strict',
 * }
 * ```
 */

// Checks the type of the model defaults property and if a function, returns
// the result of the function call, otherwise returns the object
export async function getDefaultValues<TSchema extends BaseSchema>(
  defaults?: DefaultsOption<TSchema>
): Promise<Partial<TSchema>> {
  if (typeof defaults === 'function') {
    return await defaults();
  }
  if (typeof defaults === 'object') {
    return defaults;
  }
  return {};
}

// Returns either the default timestamp property or the value supplied in timestamp options
export function getTimestampProperty<
  TProperty extends keyof Exclude<SchemaTimestampOptions, boolean>,
  TOptions extends SchemaTimestampOptions | undefined,
>(property: TProperty, options: TOptions): keyof Exclude<SchemaTimestampOptions, boolean> {
  if (typeof options === 'object') {
    return (options[property] ?? property) as keyof Exclude<SchemaTimestampOptions, boolean>;
  }
  return property;
}

// Creates new update object so the original doesn't get mutated
export function timestampUpdateFilter<TSchema, TOptions extends SchemaOptions<TSchema>>(
  update: PaprUpdateFilter<TSchema>,
  timestamps: TOptions['timestamps']
): PaprUpdateFilter<TSchema> {
  const updatedAtProperty = getTimestampProperty('updatedAt', timestamps);

  const $currentDate = {
    ...update.$currentDate,
    // @ts-expect-error Ignore dynamic string property access
    ...(!update.$set?.[updatedAtProperty] &&
      !update.$unset?.[updatedAtProperty] && {
        [updatedAtProperty]: true,
      }),
  };

  // @ts-expect-error `TSchema` is a `TimestampSchema`, but we can't extend that base type
  return {
    ...update,
    ...(Object.keys($currentDate).length > 0 && { $currentDate }),
  };
}

// Creates new operation objects so the original operations don't get mutated
export function timestampBulkWriteOperation<TSchema, TOptions extends SchemaOptions<TSchema>>(
  operation: PaprBulkWriteOperation<TSchema, TOptions>,
  timestamps: TOptions['timestamps']
): PaprBulkWriteOperation<TSchema, TOptions> {
  const createdAtProperty = getTimestampProperty('createdAt', timestamps);
  const updatedAtProperty = getTimestampProperty('updatedAt', timestamps);

  if ('insertOne' in operation) {
    return {
      insertOne: {
        document: {
          [createdAtProperty]: new Date(),
          [updatedAtProperty]: new Date(),
          ...operation.insertOne.document,
        },
      },
    };
  }

  if ('updateOne' in operation) {
    const { update } = operation.updateOne;

    // Skip aggregation pipeline updates
    if (Array.isArray(update)) {
      return operation;
    }

    const $currentDate = {
      ...update.$currentDate,
      // @ts-expect-error Ignore dynamic string property access
      ...(!update.$set?.[updatedAtProperty] &&
        !update.$unset?.[updatedAtProperty] && {
          [updatedAtProperty]: true,
        }),
    };
    const $setOnInsert = {
      ...update.$setOnInsert,
      // @ts-expect-error Ignore dynamic string property access
      ...(!update.$set?.[createdAtProperty] &&
        !update.$unset?.[createdAtProperty] && {
          [createdAtProperty]: new Date(),
        }),
    };

    return {
      updateOne: {
        ...operation.updateOne,
        // @ts-expect-error `TSchema` is a `TimestampSchema`, but we can't extend that base type
        update: {
          ...update,
          ...(Object.keys($currentDate).length > 0 && { $currentDate }),
          ...(Object.keys($setOnInsert).length > 0 && { $setOnInsert }),
        },
      },
    };
  }

  if ('updateMany' in operation) {
    const { update } = operation.updateMany;

    // Skip aggregation pipeline updates
    if (Array.isArray(update)) {
      return operation;
    }

    const $currentDate = {
      ...update.$currentDate,
      // @ts-expect-error Ignore dynamic string property access
      ...(!update.$set?.[updatedAtProperty] &&
        !update.$unset?.[updatedAtProperty] && {
          [updatedAtProperty]: true,
        }),
    };
    const $setOnInsert = {
      ...update.$setOnInsert,
      // @ts-expect-error Ignore dynamic string property access
      ...(!update.$set?.[createdAtProperty] &&
        !update.$unset?.[createdAtProperty] && {
          [createdAtProperty]: new Date(),
        }),
    };

    return {
      updateMany: {
        ...operation.updateMany,
        // @ts-expect-error `TSchema` is a `TimestampSchema`, but we can't extend that base type
        update: {
          ...update,
          ...(Object.keys($currentDate).length > 0 && { $currentDate }),
          ...(Object.keys($setOnInsert).length > 0 && { $setOnInsert }),
        },
      },
    };
  }

  if ('replaceOne' in operation) {
    return {
      replaceOne: {
        ...operation.replaceOne,
        replacement: {
          [createdAtProperty]: new Date(),
          [updatedAtProperty]: new Date(),
          ...operation.replaceOne.replacement,
        },
      },
    };
  }

  return operation;
}

// Clean defaults if properties are present in $set, $push, $inc or $unset
// Note: typing the `$setOnInsert` parameter as `NonNullable<PaprUpdateFilter<TSchema>['$setOnInsert']>`
// triggers a stack overflow error in `tsc`, so we choose a simple `Record` type here.
export function cleanSetOnInsert<TSchema>(
  $setOnInsert: Record<string, unknown>,
  update: PaprUpdateFilter<TSchema>
): NonNullable<PaprUpdateFilter<TSchema>['$setOnInsert']> {
  for (const key of Object.keys($setOnInsert)) {
    if (
      key in (update.$set || {}) ||
      key in (update.$push || {}) ||
      key in (update.$inc || {}) ||
      key in (update.$unset || {})
    ) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete $setOnInsert[key];
    }
  }

  return $setOnInsert as NonNullable<PaprUpdateFilter<TSchema>['$setOnInsert']>;
}
