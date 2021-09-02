import { Db } from 'mongodb';
import { abstract, build, Model } from './model';
import schema from './schema';
import types from './types';
import { BaseSchema, ModelOptions } from './utils';

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
   * It may be called with some options for before and after hooks and a maximum execution time for queries.
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
   * Initialize existing and future registered models with a mongo db instance
   *
   * @param db {mongodb.Db}
   *
   * @example
   * const connection = await mongodb.MongoClient.connect('mongodb://localhost:27017');
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
   * @returns {Model<TSchema, TDefaults>}
   *
   * @example
   * const User = papr.model('users', userSchema);
   */
  model<
    TSchema extends BaseSchema,
    TDefaults extends Partial<TSchema>,
    // We're using `ExternalModel` as a return type here, which extends a `Model<TSchema>` in order to allow
    // custom static methods to be applied to the resulting model.
    ExternalModel extends Model<TSchema, TDefaults> = Model<TSchema, TDefaults>
  >(collectionName: string, collectionSchema: [TSchema, TDefaults]): ExternalModel {
    // We're casting to `ExternalModel` here we need to return `ExternalModel` as a type,
    // which is not guaranteed to be equal to `Model`.
    const model = abstract(collectionSchema) as ExternalModel;

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
   * @param model {Model<TSchema, TDefaults>}
   *
   * @returns {Promise<void>}
   *
   * @example
   * await papr.updateSchema(User);
   */
  async updateSchema<TSchema extends BaseSchema, TDefaults>(
    model: Model<TSchema, TDefaults>
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
      [...this.models.values()].map((model) => this.updateSchema(model))
    );
  }
}

export { schema, types, types as Types };
export * from './hooks';
export * from './model';
export * from './utils';
