import { Join, NestedPaths, ObjectId, WithId } from 'mongodb';
import type { AnyBulkWriteOperation, OptionalId, UpdateFilter } from 'mongodb';
import { DeepPick } from './DeepPick';
import { Hooks } from './hooks';

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

export interface TimestampSchema {
  createdAt: Date;
  updatedAt: Date;
}

export interface ModelOptions {
  hooks?: Hooks;
  maxTime?: number;
}

export type DocumentForInsertWithoutDefaults<TSchema, TDefaults extends Partial<TSchema>> = Omit<
  OptionalId<TSchema>,
  keyof TDefaults
> &
  Partial<Pick<TSchema, keyof TDefaults & keyof TSchema>>;

export type DocumentForInsert<TSchema, TDefaults extends Partial<TSchema>> = Extract<
  keyof TSchema,
  'createdAt'
> extends 'createdAt'
  ? Omit<DocumentForInsertWithoutDefaults<TSchema, TDefaults>, 'createdAt' | 'updatedAt'> &
      Partial<TimestampSchema>
  : DocumentForInsertWithoutDefaults<TSchema, TDefaults>;

export type ProjectionType<
  TSchema extends BaseSchema,
  Projection extends Partial<Record<Join<NestedPaths<WithId<TSchema>>, '.'>, number>> | undefined
> = undefined extends Projection
  ? WithId<TSchema>
  : WithId<DeepPick<TSchema, keyof Projection & string>>;

export function getIds(ids: (string | ObjectId)[] | Set<string>): ObjectId[] {
  return [...ids].map((id) => new ObjectId(id));
}

/**
 * @module intro
 * @description
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
// Creates new update object so the original doesn't get mutated
export function timestampUpdateFilter<TSchema>(
  update: UpdateFilter<TSchema>
): UpdateFilter<TSchema> {
  const $currentDate = {
    ...update.$currentDate,
    ...(!update.$set?.updatedAt &&
      !update.$unset?.updatedAt && {
        updatedAt: true,
      }),
  };

  // @ts-expect-error We can't let TS know that the current schema has timestamps attributes
  return {
    ...update,
    ...(Object.keys($currentDate).length > 0 && { $currentDate }),
  };
}

// Creates new operation objects so the original operations don't get mutated
export function timestampBulkWriteOperation<TSchema>(
  operation: AnyBulkWriteOperation<TSchema>
): AnyBulkWriteOperation<TSchema> {
  if ('insertOne' in operation) {
    return {
      insertOne: {
        document: {
          createdAt: new Date(),
          updatedAt: new Date(),
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
      ...(!update.$set?.updatedAt &&
        !update.$unset?.updatedAt && {
          updatedAt: true,
        }),
    };
    const $setOnInsert = {
      ...update.$setOnInsert,
      ...(!update.$set?.createdAt &&
        !update.$unset?.createdAt && {
          createdAt: new Date(),
        }),
    };

    return {
      updateOne: {
        ...operation.updateOne,
        // @ts-expect-error We can't let TS know that the current schema has timestamps attributes
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
      ...(!update.$set?.updatedAt &&
        !update.$unset?.updatedAt && {
          updatedAt: true,
        }),
    };
    const $setOnInsert = {
      ...update.$setOnInsert,
      ...(!update.$set?.createdAt &&
        !update.$unset?.createdAt && {
          createdAt: new Date(),
        }),
    };

    return {
      updateMany: {
        ...operation.updateMany,
        // @ts-expect-error We can't let TS know that the current schema has timestamps attributes
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
          createdAt: new Date(),
          updatedAt: new Date(),
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
      delete $setOnInsert[key];
    }
  }
  return $setOnInsert;
}
