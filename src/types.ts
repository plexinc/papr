import { Binary, ObjectId } from 'mongodb';
import { Flatten } from './utils';

// These options are based on the available keywords from:
// https://docs.mongodb.com/manual/reference/operator/query/jsonSchema/#json-schema

interface RequiredOptions {
  required: boolean;
}

type GenericOptions = Partial<RequiredOptions>;

interface ArrayOptions extends GenericOptions {
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
}

interface NumberOptions extends GenericOptions {
  enum?: number[];
  exclusiveMaximum?: boolean;
  exclusiveMinimum?: boolean;
  maximum?: number;
  minimum?: number;
  multipleOf?: number;
}

interface ObjectOptions extends GenericOptions {
  additionalProperties?: boolean;
  dependencies?: Record<string, unknown>;
  maxProperties?: number;
  minProperties?: number;
  patternProperties?: Record<string, unknown>;
}

interface StringOptions extends GenericOptions {
  enum?: string[];
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}

type BSONType =
  | 'array'
  | 'binData'
  | 'boolean'
  | 'date'
  | 'number'
  | 'object'
  | 'objectId'
  | 'string';

type GetType<Type, Options> = Options extends RequiredOptions
  ? Options['required'] extends true
    ? Type
    : Type | undefined
  : Type | undefined;

export type RequiredProperties<Properties> = {
  [Prop in keyof Properties]: undefined extends Properties[Prop] ? never : Prop;
}[keyof Properties];

export type OptionalProperties<Properties> = Exclude<
  keyof Properties,
  RequiredProperties<Properties>
>;

// We define properties which extend `undefined` as true optional properties `[Prop]?: Value`
export type ObjectType<Properties> = Flatten<
  Pick<Properties, NonNullable<RequiredProperties<Properties>>> & {
    [Prop in OptionalProperties<Properties>]?: Properties[Prop];
  }
>;

/**
 * @module intro
 * @description
 *
 * Types are the building blocks of `papr` [schemas](schema.md), which provide TypeScript type definitions,
 * as well as the ability to generate [JSON schema](https://docs.mongodb.com/manual/core/schema-validation/#json-schema)
 * for validators in MongoDB collections.
 *
 * Some types have additional options, based on the available options from JSON schema for that data type.
 *
 * The following data types are available to define the schemas of your `papr` models:
 */

/**
 * The following type creator functions return valid JSON schema definitions at runtime,
 * however for TypeScript they return actual TypeScript types.
 *
 * To workaround this difference between runtime and type-checking, we use the pattern `return X as unknown as Y`;
 *
 * All type creator functions below return a `$required` attribute, which is used only internally
 * to compute the `required` keys array in the containing parent object.
 *
 * This `$required` value is removed in the `createSchemaType` function.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function any<Options extends GenericOptions>(options?: Options): any {
  const { required, ...otherOptions } = options || {};

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    ...(required ? { $required: true } : {}),
    // bsonType uses `bool` instead of the native JSON schema `boolean` type
    bsonType: [
      'array',
      'binData',
      'bool',
      'date',
      'null',
      'number',
      'object',
      'objectId',
      'string',
    ],
    ...otherOptions,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as unknown as any;
}

function array<Item, Options extends ArrayOptions>(
  items: Item,
  options?: Options
): GetType<NonNullable<Item>[], Options> {
  const { required, ...otherOptions } = options || {};

  return {
    ...(required ? { $required: true } : {}),
    items,
    type: 'array',
    ...otherOptions,
  } as unknown as GetType<NonNullable<Item>[], Options>;
}

function enumType<Enum, Options extends GenericOptions>(
  values: Enum[],
  options?: Options
): GetType<Enum, Options> {
  return {
    ...(options?.required ? { $required: true } : {}),
    enum: values,
  } as unknown as GetType<Enum, Options>;
}

function number<Options extends NumberOptions>(options?: Options): GetType<number, Options> {
  const { required, ...otherOptions } = options || {};

  return {
    ...(required ? { $required: true } : {}),
    type: 'number',
    ...otherOptions,
  } as unknown as GetType<number, Options>;
}

export function object<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Properties extends Record<string, any>,
  Options extends ObjectOptions
>(properties: Properties, options?: Options): GetType<ObjectType<Properties>, Options> {
  const { required, ...otherOptions } = options || {};

  const requiredKeys = Object.entries(properties)
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    .filter(([_property, propertyOptions]) => propertyOptions.$required)
    .map(([property]) => property);

  return {
    ...(required ? { $required: true } : {}),
    additionalProperties: false,
    properties,
    type: 'object',
    ...(requiredKeys.length ? { required: requiredKeys } : {}),
    ...otherOptions,
  } as unknown as GetType<ObjectType<Properties>, Options>;
}

export function objectGeneric<Property, Options extends ObjectOptions>(
  property: Property,
  pattern = '.+',
  options?: Options
): GetType<Record<string, Property>, Options> {
  const { required, ...otherOptions } = options || {};

  return {
    ...(required ? { $required: true } : {}),
    additionalProperties: false,
    patternProperties: {
      [pattern]: property,
    },
    type: 'object',
    ...otherOptions,
  } as unknown as GetType<Record<string, Property>, Options>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function oneOf<Types extends any[], Options extends GenericOptions>(
  types: Types,
  options?: Options
): GetType<NonNullable<Types[number]>, Options> {
  const { required } = options || {};

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return {
    oneOf: required
      ? // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        types.map((type) => ({
          ...type,
          $required: true,
        }))
      : types,
  } as unknown as GetType<NonNullable<Types[number]>, Options>;
}

function createSimpleType<Type>(type: BSONType) {
  return <Options extends GenericOptions>(options?: Options) => {
    return {
      ...(options?.required ? { $required: true } : {}),
      ...(type === 'date' || type === 'objectId' || type === 'binData'
        ? { bsonType: type }
        : { type }),
    } as unknown as GetType<Type, Options>;
  };
}

function string<Options extends StringOptions>(options?: Options): GetType<string, Options> {
  const { required, ...otherOptions } = options || {};

  return {
    ...(required ? { $required: true } : {}),
    type: 'string',
    ...otherOptions,
  } as unknown as GetType<string, Options>;
}

function unknown<Options extends GenericOptions>(options?: Options): unknown {
  return any(options) as unknown;
}

export default {
  /**
   * Creates an array consisting of items of a single type.
   *
   * @param item {TItem}
   * @param [options] {ArrayOptions}
   * @param [options.maxItems] {number}
   * @param [options.minItems] {number}
   * @param [options.required] {boolean}
   * @param [options.uniqueItems] {boolean}
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   requiredList: types.array(types.number(), { required: true }),
   *   optionalList: types.array(types.number()),
   *   // All inner types are `required` by default, so optionalList and anotherOptionalList
   *   // are equivalent types
   *   anotherOptionalList: types.array(types.number({ required: true }))
   *   listWithAllOptions: types.array(types.number(), {
   *     maxItems: 10,
   *     minItems: 1,
   *     required: true,
   *     uniqueItems: true,
   *   }),
   * });
   *
   */
  array,

  /**
   * Creates a binary type. Useful for storing `Buffer` or any other binary data.
   *
   * @param [options] {GenericOptions}
   * @param [options.required] {boolean}
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   requiredBinary: types.binary({ required: true }),
   *   optionalBinary: types.binary(),
   * });
   */
  binary: createSimpleType<Binary>('binData'),

  /**
   * Creates a boolean type.
   *
   * @param [options] {GenericOptions}
   * @param [options.required] {boolean}
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   requiredBoolean: types.boolean({ required: true }),
   *   optionalBoolean: types.boolean(),
   * });
   */
  boolean: createSimpleType<boolean>('boolean'),

  /**
   * Creates a date type.
   *
   * @param [options] {GenericOptions}
   * @param [options.required] {boolean}
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   requiredDate: types.date({ required: true }),
   *   optionalDate: types.date(),
   * });
   */
  date: createSimpleType<Date>('date'),

  /**
   * With `enum` you can create an enum type either:
   *
   * - based on a TypeScript `enum` structure
   * - based on an array of `const`
   *
   * Enum types may contain `null` as well.
   *
   * @param values {Array<TValue>}
   * @param [options] {GenericOptions}
   * @param [options.required] {boolean}
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * enum SampleEnum {
   *   foo = 'foo',
   *   bar = 'bar'
   * }
   *
   * const SampleArray = ['foo' as const, 'bar' as const];
   *
   * schema({
   *   // type: SampleEnum
   *   requiredEnum: types.enum(Object.values(SampleEnum), { required: true }),
   *   // type: SampleEnum | undefined
   *   optionalEnum: types.enum(Object.values(SampleEnum)),
   *   // type: SampleEnum | null | undefined
   *   optionalEnumWithNull: types.enum([...Object.values(SampleEnum), null]),
   *   // type: 'foo' | 'bar'
   *   requiredEnumAsConstArray: types.enum(SampleArray, { required: true }),
   *   // type: 'foo' | 'bar' | undefined
   *   optionalEnumAsConstArray: types.enum(SampleArray),
   * });
   */
  enum: enumType,

  /**
   * Creates a number type.
   *
   * @param [options] {NumberOptions}
   * @param [options.enum] {Array<number>}
   * @param [options.exclusiveMaximum] {boolean}
   * @param [options.exclusiveMinimum] {boolean}
   * @param [options.maximum] {number}
   * @param [options.minimum] {number}
   * @param [options.mulitpleOf] {number}
   * @param [options.required] {boolean}
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   optionalNumber: types.number(),
   *   requiredNumber: types.number({ required: true }),
   *   numberWithAllOptions: types.number({
   *     enum: [1, 2, 3, 5, 8, 13],
   *     exclusiveMaximum: true,
   *     exclusiveMinimum: true,
   *     maximum: 0,
   *     minimum: 14,
   *     multipleOf: 1,
   *     required: true,
   *   }),
   * });
   */
  number,

  /**
   * Creates an object type specifying all the known properties upfront.
   *
   * @param properties {TProperties}
   * @param [options] {ObjectOptions}
   * @param [options.additionalProperties] {boolean}
   * @param [options.dependencies] {Record<string, Array<string>>}
   * @param [options.maxProperties] {number}
   * @param [options.minProperties] {number}
   * @param [options.patternProperties] {Record<string, unknown>}
   * @param [options.required] {boolean}
   *
   * The advanced JSON schema options for this type (e.g. `patternProperties`) are also available, but these will not get type checked.
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   optionalObject: types.object({
   *     foo: types.number(),
   *     bar: types.string(),
   *   }),
   *   requiredObject: types.object(
   *     {
   *       foo: types.number(),
   *       bar: types.string(),
   *     },
   *     { required: true }
   *   ),
   *   objectWithAllOptions: types.object(
   *     {
   *       foo: types.number(),
   *       bar: types.string(),
   *     },
   *     {
   *       additionalProperties: true,
   *       dependencies: {
   *         foo: ['bar'],
   *       },
   *       maxProperties: 10,
   *       minProperties: 2,
   *       patternProperties: {
   *         '^f.+': { type: 'string' },
   *       },
   *       required: true,
   *     }
   *   ),
   * });
   */
  object,

  /**
   * Creates an object type without any upfront properties defined, instead you define only a pattern for the properties names. All properties will expect the same type as value (`TValue`).
   *
   * Note: It's recommended to avoid using such a type. It might throw a TypeScript error (TS2589) in the projection logic due to the looseness of the type definition.
   *
   * @param value {TValue}
   * @param [pattern=.+] {string}
   * @param [options] {ObjectOptions}
   * @param [options.additionalProperties] {boolean}
   * @param [options.dependencies] {Record<string, Array<string>>}
   * @param [options.maxProperties] {number}
   * @param [options.minProperties] {number}
   * @param [options.required] {boolean}
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   // This accepts any property name with the value as a number
   *   optionalObjectGeneric: types.objectGeneric(types.number()),
   *   // This accepts only objects with properties starting with `foo`
   *   requiredObjectGeneric: types.objectGeneric(
   *     types.number(),
   *     '^foo.+',
   *     { required: true }
   *   ),
   * });
   */
  objectGeneric,

  /**
   * Creates an `ObjectId` type.
   *
   * @param [options] {GenericOptions}
   * @param [options.required] {boolean}
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   optionalObjectId: types.objectId(),
   *   requiredObjectId: types.objectId({ required: true }),
   * });
   */
  objectId: createSimpleType<ObjectId>('objectId'),

  /**
   * Creates a union type of multiple other types.
   *
   * This is useful when combined with `objectGeneric`.
   *
   * @param types {Type[]}
   * @param [options] {StringOptions}
   * @param [options.required] {boolean}
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   optionalStringOrNumber: types.oneOf([types.string(), types.number()]),
   *   requiredStringOrNumber: types.oneOf([types.string(), types.number()], { required: true }),
   * });
   */
  oneOf,

  /**
   * Creates a string type.
   *
   * @param [options] {StringOptions}
   * @param [options.enum] {Array<string>}
   * @param [options.maxLength] {number}
   * @param [options.minLength] {number}
   * @param [options.pattern] {string}
   * @param [options.required] {boolean}
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   optionalString: types.string(),
   *   requiredString: types.string({ required: true }),
   *   stringWithAllOptions: types.number({
   *     enum: ['foo', 'bar'],
   *     maxLength: 3,
   *     minLength: 1,
   *     pattern: '^\\w+$',
   *     required: true,
   *   }),
   * });
   */
  string,

  /**
   * We recommend avoiding this type. It only exists as an escape hatch for unknown data.
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   unknownData: types.any(),
   * });
   */
  // eslint-disable-next-line sort-keys
  any,

  /**
   * This allows any value to be assigned, but is typed as unknown to force assertions
   * before relying on the data. Like with `any`, we recommend avoiding this type.
   * It only exists as an escape hatch for unknown data.
   *
   * @example
   * import { schema, types } from 'papr';
   *
   * schema({
   *   unknownData: types.unknown(),
   * });
   */
  unknown,
};
