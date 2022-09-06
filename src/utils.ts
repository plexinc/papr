import { ObjectId } from 'mongodb';
import type {
  DeleteManyModel,
  DeleteOneModel,
  Join,
  NestedPaths,
  OptionalId,
  ReplaceOneModel,
  UpdateFilter,
  UpdateManyModel,
  UpdateOneModel,
  WithId,
} from 'mongodb';
import { DeepPick } from './DeepPick';
import { Hooks } from './hooks';
import { SchemaOptions, SchemaTimestampOptions } from './schema';

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
  _id: ObjectId | string | number;
}

type TimestampSchemaProperty<
  TProperty extends keyof Exclude<SchemaTimestampOptions, boolean>,
  TOptions extends SchemaTimestampOptions | undefined
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

export type DocumentForInsert<
  TSchema,
  TOptions extends SchemaOptions<TSchema>,
  TDefaults extends NonNullable<TOptions['defaults']> = NonNullable<TOptions['defaults']>
> = TOptions['timestamps'] extends SchemaTimestampOptions
  ? TOptions['timestamps'] extends false
    ? DocumentForInsertWithoutDefaults<TSchema, TDefaults>
    : Omit<
        DocumentForInsertWithoutDefaults<TSchema, TDefaults>,
        keyof TimestampSchema<TOptions['timestamps']>
      > &
        Partial<TimestampSchema<TOptions['timestamps']>>
  : DocumentForInsertWithoutDefaults<TSchema, TDefaults>;

export type BulkWriteOperation<TSchema, TOptions extends SchemaOptions<TSchema>> =
  | {
      insertOne: {
        document: DocumentForInsert<TSchema, TOptions>;
      };
    }
  | {
      // @ts-expect-error Type expects a Document extended type, but Document is too generic
      replaceOne: ReplaceOneModel<TSchema>;
    }
  | {
      // @ts-expect-error Type expects a Document extended type, but Document is too generic
      updateOne: UpdateOneModel<TSchema>;
    }
  | {
      // @ts-expect-error Type expects a Document extended type, but Document is too generic
      updateMany: UpdateManyModel<TSchema>;
    }
  | {
      // @ts-expect-error Type expects a Document extended type, but Document is too generic
      deleteOne: DeleteOneModel<TSchema>;
    }
  | {
      // @ts-expect-error Type expects a Document extended type, but Document is too generic
      deleteMany: DeleteManyModel<TSchema>;
    };

export type ProjectionType<
  TSchema extends BaseSchema,
  Projection extends Partial<Record<Join<NestedPaths<WithId<TSchema>>, '.'>, number>> | undefined
> = undefined extends Projection
  ? WithId<TSchema>
  : WithId<DeepPick<TSchema, keyof Projection & string>>;

export type Projection<TSchema> = Partial<Record<Join<NestedPaths<WithId<TSchema>>, '.'>, number>>;

export type Identity<Type> = Type;

export type Flatten<Type extends object> = Identity<{
  [Key in keyof Type]: Type[Key];
}>;

export type RequireAtLeastOne<TObj, Keys extends keyof TObj = keyof TObj> = Pick<
  TObj,
  Exclude<keyof TObj, Keys>
> &
  {
    [Key in Keys]-?: Required<Pick<TObj, Key>> & Partial<Pick<TObj, Exclude<Keys, Key>>>;
  }[Keys];

export function getIds(ids: (string | ObjectId)[] | Set<string>): ObjectId[] {
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
 * user?.firstName; // value
 * user?.lastName; // TypeScript error
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

// Returns either the default timestamp property or the value supplied in timestamp options
export function getTimestampProperty<
  TProperty extends keyof Exclude<SchemaTimestampOptions, boolean>,
  TOptions extends SchemaTimestampOptions | undefined
>(property: TProperty, options: TOptions) {
  if (typeof options === 'object') {
    return options[property] ?? property;
  }
  return property;
}

// Creates new update object so the original doesn't get mutated
export function timestampUpdateFilter<TSchema, TOptions extends SchemaOptions<TSchema>>(
  update: UpdateFilter<TSchema>,
  timestamps: TOptions['timestamps']
): UpdateFilter<TSchema> {
  const updatedAtProperty = getTimestampProperty('updatedAt', timestamps);

  const $currentDate = {
    ...update.$currentDate,
    // @ts-expect-error `TSchema` is a `TimestampSchema`, but we can't extend that base type
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
  operation: BulkWriteOperation<TSchema, TOptions>,
  timestamps: TOptions['timestamps']
): BulkWriteOperation<TSchema, TOptions> {
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
      // @ts-expect-error `TSchema` is a `TimestampSchema`, but we can't extend that base type
      ...(!update.$set?.[updatedAtProperty] &&
        !update.$unset?.[updatedAtProperty] && {
          [updatedAtProperty]: true,
        }),
    };
    const $setOnInsert = {
      ...update.$setOnInsert,
      // @ts-expect-error `TSchema` is a `TimestampSchema`, but we can't extend that base type
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
      // @ts-expect-error `TSchema` is a `TimestampSchema`, but we can't extend that base type
      ...(!update.$set?.[updatedAtProperty] &&
        !update.$unset?.[updatedAtProperty] && {
          [updatedAtProperty]: true,
        }),
    };
    const $setOnInsert = {
      ...update.$setOnInsert,
      // @ts-expect-error `TSchema` is a `TimestampSchema`, but we can't extend that base type
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
export function cleanSetOnInsert<TSchema>(
  $setOnInsert: NonNullable<UpdateFilter<TSchema>['$setOnInsert']>,
  update: UpdateFilter<TSchema>
): NonNullable<UpdateFilter<TSchema>['$setOnInsert']> {
  for (const key of Object.keys($setOnInsert)) {
    if (
      key in (update.$set || {}) ||
      key in (update.$push || {}) ||
      key in (update.$inc || {}) ||
      key in (update.$unset || {})
    ) {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete $setOnInsert[key as keyof typeof $setOnInsert];
    }
  }
  return $setOnInsert;
}
