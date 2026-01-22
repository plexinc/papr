import { Db } from 'mongodb';
import { abstract, build } from './model.ts';
import types from './types.ts';

import type { Model } from './model.ts';
import type { SchemaOptions } from './schema.ts';
import type { BaseSchema, ModelOptions } from './utils.ts';

export default class Papr {
  db?: Db;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  models: Map<string, Model<any, any>> = new Map<string, Model<any, any>>();
  options?: ModelOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schemas: Map<string, [BaseSchema, any]> = new Map<string, [BaseSchema, any]>();

  /**
   * Returns a new instance of `Papr`.
   *
   * It may be called with some options for before and after [hooks](api/hooks.md) and a maximum execution time for queries.
   *
   * @name Papr
   *
   * @param [options] {ModelOptions}
   * @param [options.hooks] {Hooks}
   * @param [options.maxTime] {number}
   *
   * @example
   * const papr = new Papr();
   *
   * const paprWithOptions = new Papr({
   *   hooks: {
   *     after: [afterHook],
   *     before: [beforeHook]
   *   },
   *   maxTime: 1000
   * });
   */
  constructor(options?: ModelOptions) {
    this.options = options;
  }

  /**
   * Initialize existing and future registered models with a mongo db instance.
   *
   * @param db {mongodb.Db}
   *
   * @example
   * import { MongoClient } from 'mongodb';
   *
   * const connection = await MongoClient.connect('mongodb://localhost:27017');
   *
   * papr.initialize(connection.db('test'));
   */
  initialize(db: Db): void {
    if (this.db) {
      return;
    }

    this.db = db;

    // If we have models defined before initializing a database, we build them now
    for (const [collectionName, collectionSchema] of this.schemas.entries()) {
      const model = this.models.get(collectionName);
      if (model && !model.collection) {
        build(collectionSchema, model, this.db.collection(collectionName), this.options);
      }
    }
  }

  /**
   * Builds a model instance and associates its collection name and schema.
   *
   * @param collectionName {string}
   * @param collectionSchema {TSchema}
   *
   * @returns {Model<TSchema, TOptions>}
   *
   * @example
   * const User = papr.model('users', userSchema);
   */
  model<TSchema extends BaseSchema, TOptions extends SchemaOptions<TSchema>>(
    collectionName: string,
    collectionSchema: [TSchema, TOptions]
  ): Model<TSchema, TOptions> {
    const model = abstract(collectionSchema) as Model<TSchema, TOptions>;

    if (this.db) {
      build(collectionSchema, model, this.db.collection(collectionName), this.options);
    }

    this.models.set(collectionName, model);
    this.schemas.set(collectionName, collectionSchema);

    return model;
  }

  /**
   * Updates the validation schema and validation options on the MongoDB collection used by a model.
   *
   * It uses the [`createCollection`](https://docs.mongodb.com/manual/reference/method/db.createCollection/)
   * method for new collections, and the [`collMod`](https://docs.mongodb.com/manual/reference/command/collMod/#dbcmd.collMod)
   * command for existing collections.
   *
   * @param model {Model<TSchema, TOptions>}
   *
   * @returns {Promise<void>}
   *
   * @example
   * await papr.updateSchema(User);
   */
  async updateSchema<TSchema extends BaseSchema, TOptions extends SchemaOptions<TSchema>>(
    model: Model<TSchema, TOptions>
  ): Promise<void> {
    if (!this.db) {
      throw new Error('The DB is not connected');
    }
    if (!model.collection) {
      throw new Error('The model collection is not initialized');
    }

    const { collectionName } = model.collection;

    const {
      // @ts-expect-error We're defining the defaults in the JSON Schema object, but TS sees these as `any`
      $defaults,
      // @ts-expect-error We're defining these timestamp options in the JSON Schema object, but TS sees these as `any`
      $timestamps,
      // @ts-expect-error We're defining these validation options in the JSON Schema object, but TS sees these as `any`
      $validationAction: validationAction,
      // @ts-expect-error We're defining these validation options in the JSON Schema object, but TS sees these as `any`
      $validationLevel: validationLevel,
      ...schema
    } = model.schema;

    const options = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validationAction,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      validationLevel,
      validator: {
        $jsonSchema: schema,
      },
    };

    const collections = await this.db.collections();
    const exists = collections.find((item) => item.collectionName === collectionName);

    if (exists) {
      await this.db.command({
        collMod: collectionName,
        ...options,
      });
      return;
    }

    await this.db.createCollection(collectionName, options);
  }

  /**
   * Updates the validation schemas and validation options on all the MongoDB collections registered by models.
   *
   * @returns {Promise<void>}
   *
   * @example
   * await papr.updateSchemas();
   */
  async updateSchemas(): Promise<void> {
    if (!this.db) {
      throw new Error('The DB is not connected');
    }

    // prettier-ignore
    await Promise.all(
      [...this.models.values()].map(model => this.updateSchema(model))
    );
  }
}

export { types, types as Types };
export * from './hooks.ts';
export * from './model.ts';
export * from './mongodbTypes.ts';
export * from './schema.ts';
export * from './utils.ts';
