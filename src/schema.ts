import { WithId } from 'mongodb';
import types, { ObjectType } from './types';
import {
  TimestampSchema,
  RequireAtLeastOne,
  VALIDATION_ACTIONS,
  VALIDATION_LEVEL,
  getTimestampProperty,
} from './utils';

export type SchemaTimestampOptions =
  | RequireAtLeastOne<{
      createdAt?: string;
      updatedAt?: string;
    }>
  | boolean;

export type DefaultsOption<TProperties> =
  | Partial<TProperties>
  | (() => Partial<TProperties>)
  | (() => Promise<Partial<TProperties>>);

export interface SchemaOptions<TProperties> {
  defaults?: DefaultsOption<TProperties>;
  timestamps?: SchemaTimestampOptions;
  validationAction?: VALIDATION_ACTIONS;
  validationLevel?: VALIDATION_LEVEL;
}

type TimestampsOptions = Required<Pick<SchemaOptions<unknown>, 'timestamps'>>;

export type SchemaType<
  TProperties extends Record<string, unknown>,
  TOptions extends SchemaOptions<unknown>,
> = TOptions extends TimestampsOptions
  ? ObjectType<TimestampSchema<TOptions['timestamps']> & WithId<TProperties>>
  : ObjectType<WithId<TProperties>>;

// This removes the artificial `$required` attributes added in the object schemas
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sanitize(value: any): void {
  if (!value || typeof value !== 'object') {
    return;
  }

  if ('$required' in value) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete value.$required;
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  for (const key of Object.keys(value)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    sanitize(value[key]);
  }
}

/**
 * @module intro
 * @description
 *
 * A schema is what defines a Model and the validation performed on the collection associated with the Model.
 */

/**
 * Creates a schema for a model and define validation options for it.
 *
 * Read more about the validation [options](https://docs.mongodb.com/manual/core/schema-validation/index.html#behavior)
 * in the MongoDB docs.
 *
 * Under the hood it is just a wrapper around the [`object`](api/types.md#object) type with some default properties
 * (e.g. `_id` and timestamps properties).
 *
 * While the default `_id` property is added with an `ObjectId` type, its type can be customized into a `string` or a `number`.
 *
 * The options are exported as a result type (the second value in the return tuple).
 *
 * The `defaults` option can be a static object, a function that returns an object or an async function that returns an object.
 *
 * @name schema
 *
 * @param properties {Record<string, unknown>}
 * @param [options] {SchemaOptions}
 * @param [options.defaults] {DefaultsOption<TProperties>}
 * @param [options.timestamps=false] {TimestampSchemaOptions}
 * @param [options.validationAction=VALIDATION_ACTIONS.ERROR] {VALIDATION_ACTIONS}
 * @param [options.validationLevel=VALIDATION_LEVEL.STRICT] {VALIDATION_LEVEL}
 *
 * @returns {Array} The return type is `[TSchema, TOptions]`
 *
 * @example
 * import { schema, types } from 'papr';
 *
 * const userSchema = schema({
 *   active: types.boolean(),
 *   age: types.number(),
 *   firstName: types.string({ required: true }),
 *   lastName: types.string({ required: true }),
 * });
 *
 * export type UserDocument = typeof userSchema[0];
 * export type UserOptions = typeof userSchema[1];
 *
 * @example
 * // Example with static defaults, timestamps and validation options
 *
 * import { schema, types, VALIDATION_ACTIONS, VALIDATION_LEVEL } from 'papr';
 *
 * const orderSchema = schema({
 *   _id: types.number({ required: true }),
 *   user: types.objectId({ required: true }),
 *   product: types.string({ required: true })
 * }, {
 *   defaults: { product: 'test' },
 *   timestamps: true,
 *   validationAction: VALIDATION_ACTIONS.WARN,
 *   validationLevel: VALIDATION_LEVEL.MODERATE
 * });
 *
 * export type OrderDocument = typeof orderSchema[0];
 * export type OrderOptions = typeof orderSchema[1];
 *
 * @example
 * // Example with static defaults of const enums
 *
 * import { schema, types, VALIDATION_ACTIONS, VALIDATION_LEVEL } from 'papr';
 *
 * const statuses = ['processing', 'shipped'] as const;
 * type Status = (typeof statuses)[number];
 *
 * const orderSchema = schema({
 *   _id: types.number({ required: true }),
 *   user: types.objectId({ required: true }),
 *   status: types.enum(statuses, { required: true })
 * }, {
 *   defaults: {
 *     // const enums require the full type cast in defaults
 *     status: 'processing' as Status
 *   }
 * });
 *
 * export type OrderDocument = typeof orderSchema[0];
 * export type OrderOptions = typeof orderSchema[1];
 *
 * @example
 * // Example with dynamic defaults
 *
 * import { schema, types } from 'papr';
 *
 * const userSchema = schema({
 *   active: types.boolean(),
 *   birthDate: types.date(),
 *   firstName: types.string({ required: true }),
 *   lastName: types.string({ required: true }),
 * }, {
 *   defaults: () => ({
 *     birthDate: new Date();
 *   })
 * });
 *
 * export type UserDocument = (typeof userSchema)[0];
 * export type UserOptions = (typeof userSchema)[1];
 *
 * @example
 * // Example with async dynamic defaults
 *
 * import { schema, types } from 'papr';
 *
 * function getDateAsync(): Promise<Date> {
 *   return Promise.resolve(new Date());
 * }
 *
 * const userSchema = schema({
 *   active: types.boolean(),
 *   birthDate: types.date(),
 *   firstName: types.string({ required: true }),
 *   lastName: types.string({ required: true }),
 * }, {
 *   defaults: async () => ({
 *     birthDate: await getDateAsync();
 *   })
 * });
 *
 * export type UserDocument = (typeof userSchema)[0];
 * export type UserOptions = (typeof userSchema)[1];
 */
export function schema<
  TProperties extends Record<string, unknown>,
  TOptions extends SchemaOptions<TProperties>,
>(properties: TProperties, options?: TOptions): [SchemaType<TProperties, TOptions>, TOptions] {
  const {
    defaults,
    timestamps = false,
    validationAction = VALIDATION_ACTIONS.ERROR,
    validationLevel = VALIDATION_LEVEL.STRICT,
  } = options || {};

  const createdAtProperty = getTimestampProperty('createdAt', timestamps);
  const updatedAtProperty = getTimestampProperty('updatedAt', timestamps);

  const value = types.object(
    {
      _id: types.objectId({ required: true }),
      ...properties,
      ...(timestamps && {
        [createdAtProperty]: types.date({ required: true }),
        [updatedAtProperty]: types.date({ required: true }),
      }),
    },
    { required: true }
  );

  sanitize(value);

  if (defaults) {
    // @ts-expect-error We're defining these defaults now and removing them later in `updateSchema()`
    value.$defaults = defaults;
  }
  if (timestamps) {
    // @ts-expect-error We're defining this option now and removing them later in `updateSchema()`
    value.$timestamps = timestamps;
  }
  // @ts-expect-error We're defining this option now and removing it later in `updateSchema()`
  value.$validationAction = validationAction;
  // @ts-expect-error We're defining this option now and removing it later in `updateSchema()`
  value.$validationLevel = validationLevel;

  return value as unknown as [SchemaType<TProperties, TOptions>, TOptions];
}
