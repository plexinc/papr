import mongodb from 'mongodb';
import type {
  BulkWriteOpResultObject,
  BulkWriteOperation,
  Collection,
  CollectionAggregationOptions,
  CollectionBulkWriteOptions,
  CollectionInsertOneOptions,
  CollectionInsertManyOptions,
  CommonOptions,
  DeleteWriteOpResultObject,
  FilterQuery,
  FindOneAndUpdateOption,
  FindOneOptions,
  MatchKeysAndValues,
  MongoCountPreferences,
  MongoDistinctPreferences,
  ObjectId,
  OptionalId,
  UpdateManyOptions,
  UpdateOneOptions,
  UpdateQuery,
  UpdateWriteOpResult,
  WithId,
  WithoutProjection,
} from 'mongodb';
import { serializeArguments } from './hooks';
import {
  BaseSchema,
  DocumentForInsert,
  FlattenIfArray,
  ModelOptions,
  ProjectionType,
  timestampBulkWriteOperation,
  timestampUpdateQuery,
} from './utils';

export interface Model<TSchema, TDefaults extends Partial<TSchema>> {
  collection: Collection<TSchema>;
  defaults?: TDefaults;
  defaultOptions: {
    ignoreUndefined?: boolean;
    maxTimeMS?: number;
  };
  hasTimestamps: boolean;
  options?: ModelOptions;
  schema: TSchema;
  type: 'plex';

  aggregate: <TResult = TSchema>(
    pipeline: Record<string, unknown>[],
    options?: CollectionAggregationOptions
  ) => Promise<TResult[]>;

  bulkWrite: (
    operations: BulkWriteOperation<TSchema>[],
    options?: CollectionBulkWriteOptions
  ) => Promise<BulkWriteOpResultObject>;

  countDocuments: (
    filter: FilterQuery<TSchema>,
    options?: MongoCountPreferences
  ) => Promise<number>;

  deleteMany: (
    filter: FilterQuery<TSchema>,
    options?: CommonOptions
  ) => Promise<DeleteWriteOpResultObject>;

  deleteOne: (
    filter: FilterQuery<TSchema>,
    options?: CommonOptions
  ) => Promise<DeleteWriteOpResultObject>;

  distinct: <TKey extends keyof WithId<TSchema>>(
    key: TKey,
    filter: FilterQuery<TSchema>,
    options?: MongoDistinctPreferences
  ) => Promise<FlattenIfArray<WithId<TSchema>[TKey]>[]>;

  find: <Projection>(
    filter: FilterQuery<TSchema>,
    options?: Omit<FindOneOptions<TSchema>, 'projection'> & { projection?: Projection }
  ) => Promise<ProjectionType<TSchema, Projection>[]>;

  findById: <Projection>(
    id: string | ObjectId,
    options?: Omit<FindOneOptions<TSchema>, 'projection'> & { projection?: Projection }
  ) => Promise<ProjectionType<TSchema, Projection> | null>;

  findOne: <Projection>(
    filter: FilterQuery<TSchema>,
    options?: Omit<FindOneOptions<TSchema>, 'projection'> & { projection?: Projection }
  ) => Promise<ProjectionType<TSchema, Projection> | null>;

  findOneAndUpdate: <Projection>(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema>,
    options?: Omit<FindOneAndUpdateOption<TSchema>, 'projection'> & { projection?: Projection }
  ) => Promise<ProjectionType<TSchema, Projection> | null>;

  insertOne: (
    doc: DocumentForInsert<TSchema, TDefaults>,
    options?: CollectionInsertOneOptions
  ) => Promise<TSchema>;

  insertMany: (
    docs: DocumentForInsert<TSchema, TDefaults>[],
    options?: CollectionInsertManyOptions
  ) => Promise<TSchema[]>;

  updateOne: (
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema>,
    options?: Omit<UpdateOneOptions, 'upsert'>
  ) => Promise<UpdateWriteOpResult>;

  updateMany: (
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema>,
    options?: UpdateManyOptions
  ) => Promise<UpdateWriteOpResult>;

  upsert: (filter: FilterQuery<TSchema>, update: UpdateQuery<TSchema>) => Promise<TSchema>;
}

function abstractMethod(): void {
  throw new Error('Collection is not initialized!');
}

export function abstract<TSchema>(schema: TSchema): unknown {
  return {
    aggregate: abstractMethod,
    bulkWrite: abstractMethod,
    countDocuments: abstractMethod,
    deleteMany: abstractMethod,
    deleteOne: abstractMethod,
    find: abstractMethod,
    findById: abstractMethod,
    findOne: abstractMethod,
    findOneAndUpdate: abstractMethod,
    insertMany: abstractMethod,
    insertOne: abstractMethod,
    schema,
    updateMany: abstractMethod,
    updateOne: abstractMethod,
    upsert: abstractMethod,
  };
}

function wrap<A, R>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: Model<any, any>,
  method: (...args: A[]) => Promise<R>
): (...args: A[]) => Promise<R> {
  return async function modelWrapped(...args) {
    const { collectionName } = model.collection;
    const { after = [], before = [] } = model.options?.hooks || {};
    const context = {};

    for (const hook of before) {
      await hook(collectionName, method.name, args, context);
    }

    let result: R;
    try {
      result = await method(...args);

      for (const hook of after) {
        await hook(collectionName, method.name, args, context);
      }
    } catch (err) {
      // MaxTimeMSExpired error
      if (err instanceof mongodb.MongoError && err.code === 50) {
        err.message = `Query exceeded maxTime: ${collectionName}.${
          method.name
        }(${serializeArguments(args, false)})`;
      }

      for (const hook of after) {
        await hook(collectionName, method.name, args, context, err);
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

export function build<TSchema extends BaseSchema, TDefaults extends Partial<TSchema>>(
  schema: [TSchema, TDefaults],
  model: Model<TSchema, TDefaults>,
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
  model.defaults = schema.$defaults || {};
  model.collection = collection;

  /* eslint-disable @typescript-eslint/no-unsafe-member-access */
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  model.hasTimestamps =
    // @ts-expect-error We're accessing runtime properties on the schema to determine timestamps availability
    schema.properties.createdAt &&
    // @ts-expect-error We're accessing runtime properties on the schema to determine timestamps availability
    schema.properties.createdAt.bsonType === 'date' &&
    // @ts-expect-error We're accessing runtime properties on the schema to determine timestamps availability
    schema.properties.updatedAt &&
    // @ts-expect-error We're accessing runtime properties on the schema to determine timestamps availability
    schema.properties.updatedAt.bsonType === 'date';
  /* eslint-enable @typescript-eslint/no-unsafe-assignment */

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
   * Calls the MongoDB [`aggregate()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#aggregate) method.
   *
   * @param pipeline {Array<Record<string, unknown>>}
   * @param [options] {CollectionAggregationOptions}
   *
   * @returns {Promise<Array<Aggregate>>} A custom data type based on the pipeline steps
   *
   * @example
   * const results = await User.aggregate([
   *  { $sortByCount: '$age' },
   *  { $limit: 5 }
   * ]);
   */
  // prettier-ignore
  // @ts-expect-error :shrug: not sure why TS sees this as an error - probably due to the generic TResult type
  model.aggregate = wrap(
    model,
    async function aggregate<TResult = TSchema>(
      pipeline: Record<string, unknown>[],
      options?: CollectionAggregationOptions
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
   * Calls the MongoDB [`bulkWrite()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#bulkWrite) method.
   *
   * @param operations {Array<BulkWriteOperation<TSchema>>}
   * @param [options] {CollectionBulkWriteOptions}
   *
   * @returns {Promise<BulkWriteOpResultObject>} https://mongodb.github.io/node-mongodb-native/3.1/api/Collection.html#~BulkWriteOpResult
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
      operations: BulkWriteOperation<TSchema>[],
      options?: CollectionBulkWriteOptions
    ): Promise<BulkWriteOpResultObject> {
      const finalOperations = operations.map((op) => {
        let operation = op;
        if ('insertOne' in op) {
          operation = {
            insertOne: {
              document: {
                ...model.defaults,
                ...op.insertOne.document,
              },
            },
          };
        }
        return model.hasTimestamps ? timestampBulkWriteOperation(operation) : operation;
      });

      const result = await model.collection.bulkWrite(finalOperations, {
        ...model.defaultOptions,
        ...options,
      } as CollectionBulkWriteOptions);

      return result;
    }
  );

  /**
   * @description
   * Calls the MongoDB [`countDocuments()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#countDocuments) method.
   *
   * @param filter {FilterQuery<TSchema>}
   * @param [options] {MongoCountPreferences}
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
      filter: FilterQuery<TSchema>,
      options?: MongoCountPreferences
    ): Promise<number> {
      return model.collection.countDocuments(filter, {
        ...model.defaultOptions,
        ...options,
      });
    }
  );

  /**
   * @description
   * Calls the MongoDB [`deleteMany()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteMany) method.
   *
   * @param filter {FilterQuery<TSchema>}
   * @param [options] {CommonOptions}
   *
   * @returns {Promise<DeleteWriteOpResultObject>} https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~deleteWriteOpResult
   *
   * @example
   * await User.deleteMany({ lastName: 'Wick' });
   */
  model.deleteMany = wrap(
    model,
    async function deleteMany(
      filter: FilterQuery<TSchema>,
      options?: CommonOptions
    ): Promise<DeleteWriteOpResultObject> {
      return model.collection.deleteMany(filter, {
        ...model.defaultOptions,
        ...options,
      } as CommonOptions);
    }
  );

  /**
   * @description
   * Calls the MongoDB [`deleteOne()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteOne) method.
   *
   * @param filter {FilterQuery<TSchema>}
   * @param [options] {CommonOptions}
   *
   * @returns {Promise<DeleteWriteOpResultObject>} https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~deleteWriteOpResult
   *
   * @example
   * await User.deleteOne({ lastName: 'Wick' });
   */
  model.deleteOne = wrap(
    model,
    async function deleteOne(
      filter: FilterQuery<TSchema>,
      options?: CommonOptions
    ): Promise<DeleteWriteOpResultObject> {
      return model.collection.deleteOne(filter, {
        ...model.defaultOptions,
        ...options,
      } as CommonOptions);
    }
  );

  /**
   * @description
   * Calls the MongoDB [`distinct()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#distinct) method.
   *
   * @param key {"keyof TSchema"}
   * @param [filter] {FilterQuery<TSchema>}
   * @param [options] {MongoDistinctPreferences}
   *
   * @returns {Promise<Array<TValue>>} `TValue` is the type of the `key` field in the schema
   *
   * @example
   * const ages = await User.distinct('age');
   */
  // prettier-ignore
  model.distinct = wrap(
    model,
    // @ts-expect-error Ignore erorr due to `wrap` arguments
    async function distinct<
      TKey extends keyof WithId<TSchema>
    >(
      key: TKey,
      filter?: FilterQuery<TSchema>,
      options?: MongoDistinctPreferences
    ): Promise<FlattenIfArray<WithId<TSchema>[TKey]>[]> {
      return model.collection.distinct(key, filter, {
        ...model.defaultOptions,
        ...options,
      });
    }
  );

  /**
   * @description
   * Calls the MongoDB [`find()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#find) method.
   *
   * The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly.
   *
   * @param filter {FilterQuery<TSchema>}
   * @param [options] {FindOneOptions<TSchema>}
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
    async function find<Projection>(
      filter: FilterQuery<TSchema>,
      options?: Omit<FindOneOptions<TSchema>, 'projection'> & { projection?: Projection }
    ): Promise<ProjectionType<TSchema, Projection>[]> {
      return model.collection
        .find(filter, {
          ...model.defaultOptions,
          ...options,
        } as WithoutProjection<FindOneOptions<TSchema>>)
        .toArray() as Promise<ProjectionType<TSchema, Projection>[]>;
    }
  );

  /**
   * @description
   * Calls the MongoDB [`findOne()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOne) method.
   *
   * The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly.
   *
   * @param id {string|ObjectId}
   * @param [options] {FindOneOptions<TSchema>}
   *
   * @returns {Promise<TProjected|null>}
   *
   * @example
   * const user = await User.findById('606ac819fa14e243e66ec4f4');
   * user.firstName; // valid
   * user.lastName; // valid
   *
   * const userProjected = await User.find(
   *   new ObjectId('606ac819fa14e243e66ec4f4'),
   *   { projection: { lastName: 1 } }
   * );
   * userProjected.firstName; // TypeScript error
   * userProjected.lastName; // valid
   */
  // prettier-ignore
  model.findById = wrap(
    model,
    async function findById<Projection>(
      id: string | ObjectId,
      options?: Omit<FindOneOptions<TSchema>, 'projection'> & { projection?: Projection }
    ): Promise<ProjectionType<TSchema, Projection> | null> {
      return model.collection.findOne(
        { _id: new mongodb.ObjectId(id) } as FilterQuery<TSchema>,
        {
          ...model.defaultOptions,
          ...options,
        } as WithoutProjection<FindOneOptions<TSchema>>
      );
    }
  );

  /**
   * @description
   * Calls the MongoDB [`findOne()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOne) method.
   *
   * The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly.
   *
   * @param filter {FilterQuery<TSchema>}
   * @param [options] {FindOneOptions<TSchema>}
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
    async function findOne<Projection>(
      filter: FilterQuery<TSchema>,
      options?: Omit<FindOneOptions<TSchema>, 'projection'> & { projection?: Projection }
    ): Promise<ProjectionType<TSchema, Projection> | null> {
      return model.collection.findOne(filter, options as WithoutProjection<FindOneOptions<TSchema>>);
    }
  );

  /**
   * @description
   * Calls the MongoDB [`findOneAndUpdate()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOneAndUpdate) method.
   *
   * The result type (`TProjected`) takes into account the projection for this query and reduces the original `TSchema` type accordingly.
   *
   * @param filter {FilterQuery<TSchema>}
   * @param update {UpdateQuery<TSchema>}
   * @param [options] {FindOneAndUpdateOption<TSchema>}
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
  model.findOneAndUpdate = wrap(model, async function findOneAndUpdate<Projection>(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema>,
    options?: Omit<FindOneAndUpdateOption<TSchema>, 'projection'> & { projection?: Projection }
  ): Promise<ProjectionType<TSchema, Projection> | null> {
    const finalUpdate = model.hasTimestamps ? timestampUpdateQuery(update) : update;

    const created: MatchKeysAndValues<TSchema> = {};

    if (model.hasTimestamps) {
      // @ts-expect-error We can't let TS know that the current schema has timestamps attributes
      created.createdAt = new Date();
    }

    const $setOnInsert = {
      ...(model.defaults || {}),
      ...finalUpdate.$setOnInsert,
      ...created,
    };

    // Do not attempt to set defaults if properties are present in $set, $push, $inc or $unset
    for (const key of Object.keys($setOnInsert)) {
      if (
        Object.prototype.hasOwnProperty.call(finalUpdate.$set || {}, key) ||
        Object.prototype.hasOwnProperty.call(finalUpdate.$push || {}, key) ||
        Object.prototype.hasOwnProperty.call(finalUpdate.$inc || {}, key) ||
        Object.prototype.hasOwnProperty.call(finalUpdate.$unset || {}, key)
      ) {
        // @ts-expect-error This is typed as read-only in `@types/mongodb`, but we can mutate it here
        // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
        delete $setOnInsert[key];
      }
    }

    const result = await model.collection.findOneAndUpdate(
      filter,
      {
        ...finalUpdate,
        ...(options?.upsert && Object.keys($setOnInsert).length > 0 && { $setOnInsert }),
      },
      {
        returnOriginal: false,
        ...model.defaultOptions,
        ...options,
      } as FindOneAndUpdateOption<TSchema>
    );

    if (result.ok === 1) {
      return result.value as ProjectionType<TSchema, Projection>;
    }

    throw new Error('findOneAndUpdate failed');
  });

  /**
   * @description
   * Calls the MongoDB [`insertMany()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertMany) method.
   *
   * @param documents {Array<TSchema>}
   * @param [options] {CollectionInsertManyOptions}
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
      docs: DocumentForInsert<TSchema, TDefaults>[],
      options?: CollectionInsertManyOptions
    ): Promise<TSchema[]> {
      const documents = docs.map((doc) => {
        return {
          ...(model.defaults || {}),
          ...doc,
          ...(model.hasTimestamps && {
            createdAt: new Date(),
            updatedAt: new Date(),
          }),
        };
      });

      const result = await model.collection.insertMany(
        documents as unknown as OptionalId<TSchema>[],
        {
          ...model.defaultOptions,
          ...options,
        } as CollectionInsertOneOptions
      );

      if (
        result.result.ok === 1 &&
        result.result.n === docs.length &&
        result.insertedCount === docs.length &&
        result.ops.length === docs.length
      ) {
        return result.ops as TSchema[];
      }

      throw new Error('insertMany failed');
    }
  );

  /**
   * @description
   * Calls the MongoDB [`insertOne()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#insertOne) method.
   *
   * @param document {TSchema}
   * @param [options] {CollectionInsertOneOptions}
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
      doc: DocumentForInsert<TSchema, TDefaults>,
      options?: CollectionInsertOneOptions
    ): Promise<TSchema> {
      const data = {
        ...(model.defaults || {}),
        ...doc,
        ...(model.hasTimestamps && {
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
      };

      // Casting to unknown first because TS complains here
      const result = await model.collection.insertOne(
        data as unknown as OptionalId<TSchema>,
        {
          ...model.defaultOptions,
          ...options,
        } as CollectionInsertOneOptions
      );

      if (
        result.result.ok === 1 &&
        result.result.n === 1 &&
        result.insertedCount === 1 &&
        result.ops.length === 1
      ) {
        return result.ops[0] as TSchema;
      }

      throw new Error('insertOne failed');
    }
  );

  /**
   * @description
   * Calls the MongoDB [`updateMany()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#updateMany) method.
   *
   * @param filter {FilterQuery<TSchema>}
   * @param update {UpdateQuery<TSchema>}
   * @param [options] {UpdateManyOptions}
   *
   * @returns {Promise<UpdateWriteOpResult>} https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~updateWriteOpResult
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
      filter: FilterQuery<TSchema>,
      update: UpdateQuery<TSchema>,
      options?: UpdateManyOptions
    ): Promise<UpdateWriteOpResult> {
      const finalUpdate = model.hasTimestamps ? timestampUpdateQuery(update) : update;

      return model.collection.updateMany(filter, finalUpdate, {
        ...model.defaultOptions,
        ...options,
      } as UpdateManyOptions);
    }
  );

  /**
   * @description
   * Calls the MongoDB [`updateOne()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#updateOne) method.
   *
   * @param filter {FilterQuery<TSchema>}
   * @param update {UpdateQuery<TSchema>}
   * @param [options] {UpdateOneOptions}
   *
   * @returns {Promise<UpdateWriteOpResult>} https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#~updateWriteOpResult
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
      filter: FilterQuery<TSchema>,
      update: UpdateQuery<TSchema>,
      options?: Omit<UpdateOneOptions, 'upsert'>
    ): Promise<UpdateWriteOpResult> {
      const finalUpdate = model.hasTimestamps ? timestampUpdateQuery(update) : update;
      // @ts-expect-error removing the upsert from options at runtime
      const { upsert, ...finalOptions } = options || {};

      return model.collection.updateOne(filter, finalUpdate, {
        ...model.defaultOptions,
        ...finalOptions,
      } as UpdateOneOptions);
    }
  );

  /**
   * @description
   * Calls the MongoDB [`findOneAndUpdate()`](https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOneAndUpdate) method with the `upsert` option enabled.
   *
   * @param filter {FilterQuery<TSchema>}
   * @param update {UpdateQuery<TSchema>}
   * @param [options] {UpdateOneOptions}
   *
   * @returns {Promise<TSchema>}
   *
   * @example
   * const user = await User.upsert(
   *   { firstName: 'John', lastName: 'Wick' },
   *   { $set: { age: 40 } }
   * );
   */
  model.upsert = async function upsert(
    filter: FilterQuery<TSchema>,
    update: UpdateQuery<TSchema>
  ): Promise<TSchema> {
    const item = await model.findOneAndUpdate(filter, update, {
      upsert: true,
    });

    if (!item) {
      throw new Error('upsert failed');
    }

    return item;
  };
}
