import { MongoError, ObjectId } from 'mongodb';
import type {
  AggregateOptions,
  AnyBulkWriteOperation,
  BulkWriteOptions,
  BulkWriteResult,
  Collection,
  CountDocumentsOptions,
  DeleteOptions,
  DeleteResult,
  DistinctOptions,
  Filter,
  FindCursor,
  FindOneAndDeleteOptions,
  FindOneAndUpdateOptions,
  FindOptions,
  Flatten,
  InsertOneOptions,
  OptionalUnlessRequiredId,
  StrictMatchKeysAndValues,
  UpdateFilter,
  UpdateOptions,
  UpdateResult,
  WithId,
} from 'mongodb';
import { serializeArguments } from './hooks';
import type { PaprBulkWriteOperation, PaprFilter, PaprUpdateFilter } from './mongodbTypes';
import { DefaultsOption, SchemaOptions, SchemaTimestampOptions } from './schema';
import {
  BaseSchema,
  cleanSetOnInsert,
  DocumentForInsert,
  getDefaultValues,
  getTimestampProperty,
  ModelOptions,
  Projection,
  ProjectionType,
  timestampBulkWriteOperation,
  timestampUpdateFilter,
} from './utils';

export interface Model<TSchema extends BaseSchema, TOptions extends SchemaOptions<TSchema>> {
  collection: Collection<TSchema>;
  defaults?: DefaultsOption<TSchema>;
  defaultOptions: {
    ignoreUndefined?: boolean;
    maxTimeMS?: number;
  };
  timestamps?: SchemaTimestampOptions;
  options?: ModelOptions;
  schema: TSchema;
  type: 'plex';

  aggregate: <TResult = TSchema>(
    pipeline: Record<string, unknown>[],
    options?: AggregateOptions
  ) => Promise<TResult[]>;

  bulkWrite: (
    operations: PaprBulkWriteOperation<TSchema, TOptions>[],
    options?: BulkWriteOptions
  ) => Promise<BulkWriteResult | void>;

  countDocuments: (filter: PaprFilter<TSchema>, options?: CountDocumentsOptions) => Promise<number>;

  deleteMany: (filter: PaprFilter<TSchema>, options?: DeleteOptions) => Promise<DeleteResult>;

  deleteOne: (filter: PaprFilter<TSchema>, options?: DeleteOptions) => Promise<DeleteResult>;

  distinct: <TKey extends keyof WithId<TSchema>>(
    key: TKey,
    filter: PaprFilter<TSchema>,
    options?: DistinctOptions
  ) => Promise<Flatten<WithId<TSchema>[TKey]>[]>;

  exists: (
    filter: PaprFilter<TSchema>,
    options?: Omit<FindOptions<TSchema>, 'limit' | 'projection' | 'skip' | 'sort'>
  ) => Promise<boolean>;

  find: <TProjection extends Projection<TSchema> | undefined>(
    filter: PaprFilter<TSchema>,
    options?: Omit<FindOptions<TSchema>, 'projection'> & { projection?: TProjection }
  ) => Promise<ProjectionType<TSchema, TProjection>[]>;

  findById: <TProjection extends Projection<TSchema> | undefined>(
    id: TSchema['_id'] | string,
    options?: Omit<FindOptions<TSchema>, 'projection'> & { projection?: TProjection }
  ) => Promise<ProjectionType<TSchema, TProjection> | null>;

  findCursor: <TProjection extends Projection<TSchema> | undefined>(
    filter: PaprFilter<TSchema>,
    options?: Omit<FindOptions<TSchema>, 'projection'> & { projection?: TProjection }
  ) => Promise<FindCursor<ProjectionType<TSchema, TProjection>>>;

  findOne: <TProjection extends Projection<TSchema> | undefined>(
    filter: PaprFilter<TSchema>,
    options?: Omit<FindOptions<TSchema>, 'projection'> & { projection?: TProjection }
  ) => Promise<ProjectionType<TSchema, TProjection> | null>;

  findOneAndDelete: <TProjection extends Projection<TSchema> | undefined>(
    filter: PaprFilter<TSchema>,
    options?: Omit<FindOneAndDeleteOptions, 'projection'> & { projection?: TProjection }
  ) => Promise<ProjectionType<TSchema, TProjection> | null>;

  findOneAndUpdate: <TProjection extends Projection<TSchema> | undefined>(
    filter: PaprFilter<TSchema>,
    update: PaprUpdateFilter<TSchema>,
    options?: Omit<FindOneAndUpdateOptions, 'projection'> & { projection?: TProjection }
  ) => Promise<ProjectionType<TSchema, TProjection> | null>;

  insertOne: (
    doc: DocumentForInsert<TSchema, TOptions>,
    options?: InsertOneOptions
  ) => Promise<TSchema>;

  insertMany: (
    docs: DocumentForInsert<TSchema, TOptions>[],
    options?: BulkWriteOptions
  ) => Promise<TSchema[]>;

  updateOne: (
    filter: PaprFilter<TSchema>,
    update: PaprUpdateFilter<TSchema>,
    options?: Omit<UpdateOptions, 'upsert'>
  ) => Promise<UpdateResult>;

  updateMany: (
    filter: PaprFilter<TSchema>,
    update: PaprUpdateFilter<TSchema>,
    options?: UpdateOptions
  ) => Promise<UpdateResult>;

  upsert: <TProjection extends Projection<TSchema> | undefined>(
    filter: PaprFilter<TSchema>,
    update: PaprUpdateFilter<TSchema>,
    options?: Omit<FindOneAndUpdateOptions, 'projection' | 'upsert'> & { projection?: TProjection }
  ) => Promise<ProjectionType<TSchema, TProjection>>;
}

/* eslint-disable @typescript-eslint/ban-types */
type ModelMethodsNames = NonNullable<
  {
    [P in keyof Model<BaseSchema, Object>]: Model<BaseSchema, Object>[P] extends Function
      ? P
      : never;
  }[keyof Model<BaseSchema, Object>]
>;
/* eslint-enable @typescript-eslint/ban-types */

// `upsert` is a custom method, which is not wrapped with hooks.
export type HookMethodsNames = Exclude<ModelMethodsNames, 'upsert'>;

function abstractMethod(): void {
  throw new Error('Collection is not initialized!');
}

export function abstract<TSchema extends BaseSchema, TOptions extends SchemaOptions<TSchema>>(
  schema: [TSchema, TOptions]
): unknown {
  return {
    aggregate: abstractMethod,
    bulkWrite: abstractMethod,
    countDocuments: abstractMethod,
    deleteMany: abstractMethod,
    deleteOne: abstractMethod,
    find: abstractMethod,
    findById: abstractMethod,
    findCursor: abstractMethod,
    findOne: abstractMethod,
    findOneAndDelete: abstractMethod,
    findOneAndUpdate: abstractMethod,
    insertMany: abstractMethod,
    insertOne: abstractMethod,
    schema,
    updateMany: abstractMethod,
    updateOne: abstractMethod,
    upsert: abstractMethod,
  };
}

function wrap<TArgs, TResult>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any, any>,
  method: (...args: TArgs[]) => Promise<TResult>
): (...args: TArgs[]) => Promise<TResult> {
  return async function modelWrapped(...args) {
    const { collectionName } = model.collection;
    const { after = [], before = [] } = model.options?.hooks || {};
    const context = {};

    for (const hook of before) {
      await hook({
        args,
        collectionName,
        context,
        // @ts-expect-error We can't get the proper method name type here
        methodName: method.name,
      });
    }

    let result: TResult;
    try {
      result = await method(...args);

      for (const hook of after) {
        await hook({
          args,
          collectionName,
          context,
          // @ts-expect-error We can't get the proper method name type here
          methodName: method.name,
          result,
        });
      }
    } catch (err) {
      if (err instanceof Error) {
        // MaxTimeMSExpired error
        if (err instanceof MongoError && err.code === 50) {
          err.message = `Query exceeded maxTime: ${collectionName}.${
            method.name
          }(${serializeArguments(args, false)})`;
        }

        for (const hook of after) {
          await hook({
            args,
            collectionName,
            context,
            error: err,
            // @ts-expect-error We can't get the proper method name type here
            methodName: method.name,
          });
        }
      }

      throw err;
    }

    return result;
  };
}

/**
 * @module intro
 * @description
 *
 * A model is the public interface in `papr` for working with a MongoDB collection.
 *
 * All the examples here are using the following schema and model:
 *
 * ```js
 * const userSchema = schema({
 *   active: types.boolean(),
 *   age: types.number(),
 *   firstName: types.string({ required: true }),
 *   lastName: types.string({ required: true }),
 * });
 * const User = papr.model('users', userSchema);
 * ```
 */

export function build<TSchema extends BaseSchema, TOptions extends SchemaOptions<TSchema>>(
  schema: [TSchema, TOptions],
  model: Model<TSchema, TOptions>,
  collection: Collection<TSchema>,
  options?: ModelOptions
): void {
  // Sanity check for already built models
  // @ts-expect-error Ignore type mismatch error
  if (model.collection && model.aggregate !== abstractMethod) {
    return;
  }

  // @ts-expect-error We're accessing runtime property on the schema
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  model.defaults = schema.$defaults;
  model.collection = collection;

  // @ts-expect-error We're accessing runtime property on the schema
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  model.timestamps = schema.$timestamps;

  model.options = options;

  model.defaultOptions = {
    ignoreUndefined: true,
    ...(options &&
      'maxTime' in options && {
        maxTimeMS: options.maxTime,
      }),
  };

  // @ts-expect-error We're storing the runtime schema object
  model.schema = schema;

  /**
   * @description
   *
   * Calls the MongoDB [`aggregate()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#aggregate) method.
   *
   * The MongoDB aggregation pipeline syntax is very rich and powerful, however providing full typed support for the results is out of the scope of `papr`.
   *
   * We provide a generic type to this method `TAggregate`, defaulted to the `TSchema` of the model, which can be used to customize the return type of the results.
   *
   * @param pipeline {Array<Record<string, unknown>>}
   * @param [options] {AggregateOptions}
   *
   * @returns {Promise<Array<TAggregate>>} A custom data type based on the pipeline steps
   *
   * @example
   * // The default results type is UserDocument
   * const results = await User.aggregate([
   *  { $sortByCount: '$age' },
   *  { $limit: 5 }
   * ]);
   *
   * // Use custom results type
   * const results = await User.aggregate<{ age: number; }>([
   *  { $sortByCount: '$age' },
   *  { $projection: { age: 1 } }
   * ]);
   */
  // prettier-ignore
  // @ts-expect-error :shrug: not sure why TS sees this as an error - probably due to the generic TResult type
  model.aggregate = wrap(
    model,
    async function aggregate<TResult = TSchema>(
      pipeline: Record<string, unknown>[],
      options?: AggregateOptions
    ): Promise<TResult[]> {
      // We're casing to `unknown` and then to `TResult`, because `TResult` can be very different than `TSchema`,
      // due to all the possible aggregation operations that can be applied
      return (model.collection
        .aggregate(pipeline, {
          ...model.defaultOptions,
          ...options,
        })
        .toArray() as unknown) as Promise<TResult[]>;
    }
  );

  /**
   * @description
   *
   * Calls the MongoDB [`bulkWrite()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#bulkWrite) method.
   *
   * If no operations are provided this method acts as a no-op and returns
   * nothing.
   *
   * @param operations {Array<BulkWriteOperation<TSchema, TOptions>>}
   * @param [options] {BulkWriteOptions}
   *
   * @returns {Promise<BulkWriteResult | void>} https://mongodb.github.io/node-mongodb-native/5.0/classes/BulkWriteResult.html
   *
   * @example
   * const results = await User.bulkWrite([
   *    {
   *      insertOne: {
   *        document: {
   *          firstName: 'John',
   *          lastName: 'Wick'
   *        },
   *      },
   *    },
   *    {
   *      updateOne: {
   *        filter: { lastName: 'Wick' },
   *        update: {
   *          $set: { age: 40 },
   *        },
   *      },
   *    },
   * ]);
   */
  model.bulkWrite = wrap(
    model,
    async function bulkWrite(
      operations: PaprBulkWriteOperation<TSchema, TOptions>[],
      options?: BulkWriteOptions
    ): Promise<BulkWriteResult | void> {
      if (operations.length === 0) {
        return;
      }

      const finalOperations = [];
      for (const op of operations) {
        let operation = op;
        if ('insertOne' in op) {
          operation = {
            insertOne: {
              document: {
                ...(await getDefaultValues(model.defaults)),
                ...op.insertOne.document,
              },
            },
          };
        } else if (
          'updateOne' in op &&
          op.updateOne.upsert &&
          !Array.isArray(op.updateOne.update)
        ) {
          const { update } = op.updateOne;
          operation = {
            updateOne: {
              ...op.updateOne,
              update: {
                ...update,
                $setOnInsert: cleanSetOnInsert(
                  {
                    ...(await getDefaultValues(model.defaults)),
                    ...update.$setOnInsert,
                  },
                  update
                ) as NonNullable<UpdateFilter<TSchema>['$setOnInsert']>,
              },
            },
          };
        }

        finalOperations.push(
          model.timestamps ? timestampBulkWriteOperation(operation, model.timestamps) : operation
        );
      }

      const result = await model.collection.bulkWrite(
        finalOperations as AnyBulkWriteOperation<TSchema>[],
        {
          ...model.defaultOptions,
          ...options,
        } as BulkWriteOptions
      );

      return result;
    }
  );

  /**
   * @description
   * Calls the MongoDB [`countDocuments()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#countDocuments) method.
   *
   * @param filter {PaprFilter<TSchema>}
   * @param [options] {CountDocumentsOptions}
   *
   * @returns {Promise<number>}
   *
   * @example
   * const countAll = await User.countDocuments({});
   * const countWicks = await User.countDocuments({ lastName: 'Wick' });
   */
  model.countDocuments = wrap(
    model,
    async function countDocuments(
      filter: PaprFilter<TSchema>,
      options?: CountDocumentsOptions
    ): Promise<number> {
      return model.collection.countDocuments(filter as Filter<TSchema>, {
        ...model.defaultOptions,
        ...options,
      });
    }
  );

  /**
   * @description
   * Calls the MongoDB [`deleteMany()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#deleteMany) method.
   *
   * @param filter {PaprFilter<TSchema>}
   * @param [options] {DeleteOptions}
   *
   * @returns {Promise<DeleteResult>} https://mongodb.github.io/node-mongodb-native/5.0/interfaces/DeleteResult.html
   *
   * @example
   * await User.deleteMany({ lastName: 'Wick' });
   */
  model.deleteMany = wrap(
    model,
    async function deleteMany(
      filter: PaprFilter<TSchema>,
      options?: DeleteOptions
    ): Promise<DeleteResult> {
      return model.collection.deleteMany(
        filter as Filter<TSchema>,
        {
          ...model.defaultOptions,
          ...options,
        } as DeleteOptions
      );
    }
  );

  /**
   * @description
   * Calls the MongoDB [`deleteOne()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#deleteOne) method.
   *
   * @param filter {PaprFilter<TSchema>}
   * @param [options] {DeleteOptions}
   *
   * @returns {Promise<DeleteResult>} https://mongodb.github.io/node-mongodb-native/5.0/interfaces/DeleteResult.html
   *
   * @example
   * await User.deleteOne({ lastName: 'Wick' });
   */
  model.deleteOne = wrap(
    model,
    async function deleteOne(
      filter: PaprFilter<TSchema>,
      options?: DeleteOptions
    ): Promise<DeleteResult> {
      return model.collection.deleteOne(
        filter as Filter<TSchema>,
        {
          ...model.defaultOptions,
          ...options,
        } as DeleteOptions
      );
    }
  );

  /**
   * @description
   * Calls the MongoDB [`distinct()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#distinct) method.
   *
   * @param key {"keyof TSchema"}
   * @param [filter] {PaprFilter<TSchema>}
   * @param [options] {DistinctOptions}
   *
   * @returns {Promise<Array<TValue>>} `TValue` is the type of the `key` field in the schema
   *
   * @example
   * const ages = await User.distinct('age');
   */
  // prettier-ignore
  model.distinct = wrap(
    model,
    // @ts-expect-error Ignore error due to `wrap` arguments
    async function distinct<TKey extends keyof WithId<TSchema>>(
      key: TKey,
      filter?: PaprFilter<TSchema>,
      options?: DistinctOptions
    ): Promise<Flatten<WithId<TSchema>[TKey]>[]> {
      return model.collection.distinct(
        key,
        filter as Filter<TSchema>,
        {
          ...model.defaultOptions,
          ...options,
        } as DistinctOptions
      ) as unknown as Flatten<WithId<TSchema>[TKey]>[];
    }
  );

  /**
   * @description
   * Performs an optimized `find` to test for the existence of any document matching the filter criteria.
   *
   * @param filter {PaprFilter<TSchema>}
   * @param [options] {Omit<FindOptions<TSchema>, "projection" | "limit" | "sort" | "skip">}
   *
   * @returns {Promise<boolean>}
   *
   * @example
   * const isAlreadyActive = await User.exists({
   *   firstName: 'John',
   *   lastName: 'Wick',
   *   active: true
   * });
   */
  model.exists = async function exists(
    filter: PaprFilter<TSchema>,
    options?: Omit<FindOptions<TSchema>, 'limit' | 'projection' | 'skip' | 'sort'>
  ): Promise<boolean> {
    // If there are any entries in the filter, we project out the value from
    // only one of them.  In this way, if there is an index that spans all the
    // parts of the filter, this can be a "covered" query.
    // @see https://www.mongodb.com/docs/manual/core/query-optimization/#covered-query
    //
    // Note that we must explicitly remove `_id` from the projection; it is often not
    // present in compound indexes, and mongo will automatically include it in the
    // result unless you explicitly exclude it from the projection.
    //
    // If you don't pass any filter option, we instead project out the primary
    // key, `_id` (which will override the earlier exclusion).
    //
    // @ts-expect-error Ignore `string` type mismatched to `keyof TSchema`
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const key: keyof TSchema = Object.keys(filter)[0] || '_id';

    const result = await model.findOne(filter, {
      projection: {
        // @ts-expect-error `_id` is not found in the projection type
        _id: 0,
        [key]: 1,
      } as const,
      ...options,
    });

    return !!result;
  };

  /**
   * @description
   * Calls the MongoDB [`find()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#find) method.
   *
   * The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly. See also [`ProjectionType`](api/utils.md#ProjectionType).
   *
   * @param filter {PaprFilter<TSchema>}
   * @param [options] {FindOptions<TSchema>}
   *
   * @returns {Promise<Array<TProjected>>}
   *
   * @example
   * const users = await User.find({ firstName: 'John' });
   * users[0]?.firstName; // valid
   * users[0]?.lastName; // valid
   *
   * const usersProjected = await User.find(
   *   { firstName: 'John' },
   *   { projection: { lastName: 1 } }
   * );
   * usersProjected[0]?.firstName; // TypeScript error
   * usersProjected[0]?.lastName; // valid
   *
   */
  // prettier-ignore
  model.find = wrap(
    model,
    async function find<TProjection extends Projection<TSchema> | undefined>(
      filter: PaprFilter<TSchema>,
      options?: Omit<FindOptions<TSchema>, 'projection'> & { projection?: TProjection }
    ): Promise<ProjectionType<TSchema, TProjection>[]> {
      return model.collection
        .find(
          filter as Filter<TSchema>,
          {
            ...model.defaultOptions,
            ...options,
          } as FindOptions<TSchema>
        )
        .toArray() as unknown as ProjectionType<TSchema, TProjection>[];
    }
  );

  /**
   * @description
   * Calls the MongoDB [`findOne()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#findOne) method.
   *
   * The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly. See also [`ProjectionType`](api/utils.md#ProjectionType).
   *
   * @param id {string|TSchema._id}
   * @param [options] {FindOptions<TSchema>}
   *
   * @returns {Promise<TProjected|null>}
   *
   * @example
   * const user = await User.findById('606ac819fa14e243e66ec4f4');
   * user.firstName; // valid
   * user.lastName; // valid
   *
   * const userProjected = await User.findById(
   *   new ObjectId('606ac819fa14e243e66ec4f4'),
   *   { projection: { lastName: 1 } }
   * );
   * userProjected.firstName; // TypeScript error
   * userProjected.lastName; // valid
   */
  // prettier-ignore
  model.findById = wrap(
    model,
    async function findById<TProjection extends Projection<TSchema> | undefined>(
      id: TSchema['_id'] | string,
      options?: Omit<FindOptions<TSchema>, 'projection'> & { projection?: TProjection }
    ): Promise<ProjectionType<TSchema, TProjection> | null> {
      // @ts-expect-error We're accessing runtime properties on the schema to determine id type
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const _id = model.schema.properties._id?.bsonType === 'objectId' ? new ObjectId(id) : id;

      return model.collection.findOne(
        { _id } as Filter<TSchema>,
        {
          ...model.defaultOptions,
          ...options,
        } as FindOptions<TSchema>
      ) as unknown as ProjectionType<TSchema, TProjection> | null;
    }
  );

  /**
   * @description
   * Calls the MongoDB [`find()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#find) method and returns the cursor.
   *
   * Useful when you want to process many records without loading them all into
   * memory at once.
   *
   * @param filter {PaprFilter<TSchema>}
   * @param [options] {FindOptions<TSchema>}
   *
   * @example
   * const cursor = await User.findCursor(
   *   { active: true, email: { $exists: true } },
   *   { projection: { email: 1 } }
   * )
   *
   * for await (const user of cursor) {
   *   await notify(user.email);
   * }
   */
  model.findCursor = wrap(model, async function findCursor<
    TProjection extends Projection<TSchema> | undefined,
  >(filter: PaprFilter<TSchema>, options?: Omit<FindOptions<TSchema>, 'projection'> & { projection?: TProjection }): Promise<
    FindCursor<ProjectionType<TSchema, TProjection>>
  > {
    return model.collection.find(
      filter as Filter<TSchema>,
      {
        ...model.defaultOptions,
        ...options,
      } as FindOptions<TSchema>
    ) as FindCursor<ProjectionType<TSchema, TProjection>>;
  });

  /**
   * @description
   * Calls the MongoDB [`findOne()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#findOne) method.
   *
   * The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly. See also [`ProjectionType`](api/utils.md#ProjectionType).
   *
   * @param filter {PaprFilter<TSchema>}
   * @param [options] {FindOptions<TSchema>}
   *
   * @returns {Promise<TProjected | null>}
   *
   * @example
   * const user = await User.findOne({ firstName: 'John' });
   * user.firstName; // valid
   * user.lastName; // valid
   *
   * const userProjected = await User.findOne(
   *   { firstName: 'John' },
   *   { projection: { lastName: 1 } }
   * );
   * userProjected.firstName; // TypeScript error
   * userProjected.lastName; // valid
   */
  // prettier-ignore
  model.findOne = wrap(
    model,
    async function findOne<TProjection extends Projection<TSchema> | undefined>(
      filter: PaprFilter<TSchema>,
      options?: Omit<FindOptions<TSchema>, 'projection'> & { projection?: TProjection }
    ): Promise<ProjectionType<TSchema, TProjection> | null> {
      return model.collection.findOne(
        filter as Filter<TSchema>,
        options as FindOptions<TSchema>
      ) as unknown as ProjectionType<TSchema, TProjection> | null;
    }
  );

  /**
   * @description
   * Calls the MongoDB [`findOneAndDelete()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#findOneAndDelete) method and returns the document found before removal.
   *
   * The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly. See also [`ProjectionType`](api/utils.md#ProjectionType).
   *
   * @param filter {PaprFilter<TSchema>}
   * @param [options] {FindOneAndUpdateOptions}
   *
   * @returns {Promise<TProjected | null>}
   *
   * @example
   * const user = await User.findOneAndDelete({ firstName: 'John' });
   */
  // prettier-ignore
  model.findOneAndDelete = wrap(model, async function findOneAndDelete<TProjection extends Projection<TSchema> | undefined>(
    filter: PaprFilter<TSchema>,
    options?: Omit<FindOneAndDeleteOptions, 'projection'> & { projection?: TProjection }
  ): Promise<ProjectionType<TSchema, TProjection> | null> {
    const result = await model.collection.findOneAndDelete(
      filter as Filter<TSchema>,
      {
        ...model.defaultOptions,
        ...options,
      } as FindOneAndDeleteOptions
    );

    return result as ProjectionType<TSchema, TProjection>;
  });

  /**
   * @description
   * Calls the MongoDB [`findOneAndUpdate()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#findOneAndUpdate) method.
   *
   * The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly. See also [`ProjectionType`](api/utils.md#ProjectionType).
   *
   * @param filter {PaprFilter<TSchema>}
   * @param update {PaprUpdateFilter<TSchema>}
   * @param [options] {FindOneAndUpdateOptions}
   *
   * @returns {Promise<TProjected | null>}
   *
   * @example
   * const user = await User.findOneAndUpdate(
   *   { firstName: 'John' },
   *   { $set: { age: 40 } }
   * );
   * user.firstName; // valid
   * user.lastName; // valid
   *
   * const userProjected = await User.findOneAndUpdate(
   *   { firstName: 'John' },
   *   { $set: { age: 40 } },
   *   { projection: { lastName: 1 } }
   * );
   * userProjected.firstName; // TypeScript error
   * userProjected.lastName; // valid
   */
  // prettier-ignore
  model.findOneAndUpdate = wrap(model, async function findOneAndUpdate<TProjection extends Projection<TSchema> | undefined>(
    filter: PaprFilter<TSchema>,
    update: PaprUpdateFilter<TSchema>,
    options?: Omit<FindOneAndUpdateOptions, 'projection'> & { projection?: TProjection }
  ): Promise<ProjectionType<TSchema, TProjection> | null> {
    const finalUpdate = model.timestamps ? timestampUpdateFilter(update, model.timestamps) : update;

    // @ts-expect-error We can't let TS know that the current schema has timestamps attributes
    const created: StrictMatchKeysAndValues<TSchema> = {
      ...(model.timestamps && {
        [getTimestampProperty('createdAt', model.timestamps)]: new Date()
      })
    };

    const $setOnInsert = cleanSetOnInsert({
      ...await getDefaultValues(model.defaults),
      ...finalUpdate.$setOnInsert,
      ...created,
    }, finalUpdate);

    const result = await model.collection.findOneAndUpdate(
      filter as Filter<TSchema>,
      {
        ...finalUpdate,
        ...(options?.upsert && Object.keys($setOnInsert).length > 0 && { $setOnInsert }),
      } as UpdateFilter<TSchema>,
      {
        returnDocument: 'after',
        ...model.defaultOptions,
        ...options,
      } as FindOneAndUpdateOptions
    );

    return result as ProjectionType<TSchema, TProjection>;
  });

  /**
   * @description
   * Calls the MongoDB [`insertMany()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#insertMany) method.
   *
   * @param documents {Array<DocumentForInsert<TSchema, TOptions>>}
   * @param [options] {BulkWriteOptions}
   *
   * @returns {Promise<Array<TSchema>>}
   *
   * @example
   * const users = await User.insertMany([
   *   { firstName: 'John', lastName: 'Wick' },
   *   { firstName: 'John', lastName: 'Doe' }
   * ]);
   */
  model.insertMany = wrap(
    model,
    async function insertMany(
      docs: DocumentForInsert<TSchema, TOptions>[],
      options?: BulkWriteOptions
    ): Promise<TSchema[]> {
      const documents = [];
      for (const doc of docs) {
        documents.push({
          ...(model.timestamps && {
            [getTimestampProperty('createdAt', model.timestamps)]: new Date(),
            [getTimestampProperty('updatedAt', model.timestamps)]: new Date(),
          }),
          ...(await getDefaultValues(model.defaults)),
          ...doc,
        });
      }

      const result = await model.collection.insertMany(
        documents as unknown as OptionalUnlessRequiredId<TSchema>[],
        {
          ...model.defaultOptions,
          ...options,
        } as InsertOneOptions
      );

      if (result.acknowledged && result.insertedCount === docs.length) {
        return documents.map((doc, index) => ({
          ...doc,
          _id: result.insertedIds[index],
        })) as unknown as TSchema[];
      }

      throw new Error('insertMany failed');
    }
  );

  /**
   * @description
   * Calls the MongoDB [`insertOne()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#insertOne) method.
   *
   * @param document {DocumentForInsert<TSchema, TOptions>}
   * @param [options] {InsertOneOptions}
   *
   * @returns {Promise<TSchema>}
   *
   * @example
   * const users = await User.insertOne([
   *   { firstName: 'John', lastName: 'Wick' },
   *   { firstName: 'John', lastName: 'Doe' }
   * ]);
   */
  model.insertOne = wrap(
    model,
    async function insertOne(
      doc: DocumentForInsert<TSchema, TOptions>,
      options?: InsertOneOptions
    ): Promise<TSchema> {
      const data = {
        ...(model.timestamps && {
          [getTimestampProperty('createdAt', model.timestamps)]: new Date(),
          [getTimestampProperty('updatedAt', model.timestamps)]: new Date(),
        }),
        ...(await getDefaultValues(model.defaults)),
        ...doc,
      };

      // Casting to unknown first because TS complains here
      const result = await model.collection.insertOne(
        data as unknown as OptionalUnlessRequiredId<TSchema>,
        {
          ...model.defaultOptions,
          ...options,
        } as InsertOneOptions
      );

      if (result.acknowledged) {
        return {
          ...data,
          _id: result.insertedId,
        } as unknown as TSchema;
      }

      throw new Error('insertOne failed');
    }
  );

  /**
   * @description
   * Calls the MongoDB [`updateMany()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#updateMany) method.
   *
   * @param filter {PaprFilter<TSchema>}
   * @param update {PaprUpdateFilter<TSchema>}
   * @param [options] {UpdateOptions}
   *
   * @returns {Promise<UpdateResult>} https://mongodb.github.io/node-mongodb-native/5.0/interfaces/UpdateResult.html
   *
   * @example
   * const result = await User.updateMany(
   *   { firstName: 'John' },
   *   { $set: { age: 40 } }
   * );
   */
  model.updateMany = wrap(
    model,
    async function updateMany(
      filter: PaprFilter<TSchema>,
      update: PaprUpdateFilter<TSchema>,
      options?: UpdateOptions
    ): Promise<UpdateResult> {
      const finalUpdate = model.timestamps
        ? timestampUpdateFilter(update, model.timestamps)
        : update;

      return model.collection.updateMany(
        filter as Filter<TSchema>,
        finalUpdate as UpdateFilter<TSchema>,
        {
          ...model.defaultOptions,
          ...options,
        } as UpdateOptions
      ) as unknown as UpdateResult;
    }
  );

  /**
   * @description
   * Calls the MongoDB [`updateOne()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#updateOne) method.
   *
   * @param filter {PaprFilter<TSchema>}
   * @param update {PaprUpdateFilter<TSchema>}
   * @param [options] {UpdateOptions}
   *
   * @returns {Promise<UpdateResult>} https://mongodb.github.io/node-mongodb-native/5.0/interfaces/UpdateResult.html
   *
   * @example
   * const result = await User.updateOne(
   *   { firstName: 'John' },
   *   { $set: { age: 40 } }
   * );
   */
  model.updateOne = wrap(
    model,
    async function updateOne(
      filter: PaprFilter<TSchema>,
      update: PaprUpdateFilter<TSchema>,
      options?: Omit<UpdateOptions, 'upsert'>
    ): Promise<UpdateResult> {
      const finalUpdate = model.timestamps
        ? timestampUpdateFilter(update, model.timestamps)
        : update;
      // @ts-expect-error removing the upsert from options at runtime
      const { upsert, ...finalOptions } = options || {};

      return model.collection.updateOne(
        filter as Filter<TSchema>,
        finalUpdate as UpdateFilter<TSchema>,
        {
          ...model.defaultOptions,
          ...finalOptions,
        } as UpdateOptions
      ) as unknown as UpdateResult;
    }
  );

  /**
   * @description
   * Calls the MongoDB [`findOneAndUpdate()`](https://mongodb.github.io/node-mongodb-native/5.0/classes/Collection.html#findOneAndUpdate) method with the `upsert` option enabled.
   *
   * @param filter {PaprFilter<TSchema>}
   * @param update {PaprUpdateFilter<TSchema>}
   * @param [options] {FindOneAndUpdateOptions}
   *
   * @returns {Promise<TSchema>}
   *
   * @example
   * const user = await User.upsert(
   *   { firstName: 'John', lastName: 'Wick' },
   *   { $set: { age: 40 } }
   * );
   *
   * const userProjected = await User.upsert(
   *   { firstName: 'John', lastName: 'Wick' },
   *   { $set: { age: 40 } },
   *   { projection: { lastName: 1 } }
   * );
   * userProjected.firstName; // TypeScript error
   * userProjected.lastName; // valid
   */
  model.upsert = async function upsert<TProjection extends Projection<TSchema> | undefined>(
    filter: PaprFilter<TSchema>,
    update: PaprUpdateFilter<TSchema>,
    options?: Omit<FindOneAndUpdateOptions, 'projection' | 'upsert'> & { projection?: TProjection }
  ): Promise<ProjectionType<TSchema, TProjection>> {
    const item = await model.findOneAndUpdate(filter, update, {
      ...options,
      upsert: true,
    });

    if (!item) {
      throw new Error('upsert failed');
    }

    return item;
  };
}
