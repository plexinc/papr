/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
  AlternativeType,
  ArrayElement,
  BSONRegExp,
  BSONType,
  BSONTypeAlias,
  BitwiseFilter,
  DeleteManyModel,
  DeleteOneModel,
  Document,
  IntegerType,
  Join,
  KeysOfAType,
  NumericType,
  OnlyFieldsOfType,
  PullAllOperator,
  PullOperator,
  PushOperator,
  ReplaceOneModel,
  SetFields,
  Timestamp,
  UpdateManyModel,
  UpdateOneModel,
  WithId,
} from 'mongodb';

import type { SchemaOptions } from './schema.ts';
import type { DocumentForInsert, NestedPaths, PropertyType, RequiredProperties } from './utils.ts';

// Some of the types are adapted from originals at: https://github.com/mongodb/node-mongodb-native/blob/v5.0.1/src/mongo_types.ts
// licensed under Apache License 2.0: https://github.com/mongodb/node-mongodb-native/blob/v5.0.1/LICENSE.md

// The strict MongoDB types (`StrictFilter` and `StrictUpdateFilter` and their dependencies)
// are too permissive due to merging their type definitions with `Document`,
// which is just an alias for `Record<string, any>`.
//
// This type merge is preventing important type checks that can be done on the filter queries:
// e.g. checking for undefined attributes in the schema being used inside a query
//
// We've adopted these types in this repository and made some improvements to them.
// See: https://github.com/plexinc/papr/issues/410

// These bulk operation types need our own `PaprFilter` and `PaprUpdateFilter` in their definition
export type PaprBulkWriteOperation<TSchema, TOptions extends SchemaOptions<TSchema>> =
  | {
      // @ts-expect-error Type expects a Document extended type, but Document is too generic
      deleteMany: Omit<DeleteManyModel<TSchema>, 'filter'> & { filter: PaprFilter<TSchema> };
    }
  | {
      // @ts-expect-error Type expects a Document extended type, but Document is too generic
      deleteOne: Omit<DeleteOneModel<TSchema>, 'filter'> & { filter: PaprFilter<TSchema> };
    }
  | {
      // @ts-expect-error Type expects a Document extended type, but Document is too generic
      replaceOne: Omit<ReplaceOneModel<TSchema>, 'filter'> & { filter: PaprFilter<TSchema> };
    }
  | {
      // @ts-expect-error Type expects a Document extended type, but Document is too generic
      updateMany: Omit<UpdateManyModel<TSchema>, 'filter' | 'update'> & {
        filter: PaprFilter<TSchema>;
        update: PaprUpdateFilter<TSchema>;
      };
    }
  | {
      // @ts-expect-error Type expects a Document extended type, but Document is too generic
      updateOne: Omit<UpdateOneModel<TSchema>, 'filter' | 'update'> & {
        filter: PaprFilter<TSchema>;
        update: PaprUpdateFilter<TSchema>;
      };
    }
  | {
      insertOne: {
        document: DocumentForInsert<TSchema, TOptions>;
      };
    };

export type PaprFilter<TSchema> =
  | Partial<WithId<TSchema>>
  | (PaprFilterConditions<WithId<TSchema>> & PaprRootFilterOperators<WithId<TSchema>>);

export type PaprFilterConditions<TSchema> = {
  [Property in Join<NestedPaths<TSchema, []>, '.'>]?: PaprCondition<
    PropertyType<TSchema, Property>
  >;
};

export interface PaprRootFilterOperators<TSchema> {
  $and?: PaprFilter<TSchema>[];
  $nor?: PaprFilter<TSchema>[];
  $or?: PaprFilter<TSchema>[];
  $expr?: Record<string, any>;
  $text?: {
    $search: string;
    $language?: string;
    $caseSensitive?: boolean;
    $diacriticSensitive?: boolean;
  };
  $where?: string | ((this: TSchema) => boolean);
  $comment?: Document | string;
}

export type PaprCondition<Type> =
  AlternativeType<Type> | PaprFilterOperators<AlternativeType<Type>>;

export interface PaprFilterOperators<TValue> {
  $eq?: TValue;
  $gt?: TValue;
  $gte?: TValue;
  $in?: readonly TValue[];
  $lt?: TValue;
  $lte?: TValue;
  $ne?: TValue;
  $nin?: readonly TValue[];
  $not?: TValue extends string ? PaprFilterOperators<TValue> | RegExp : PaprFilterOperators<TValue>;
  /**
   * When `true`, `$exists` matches the documents that contain the field,
   * including documents where the field value is null.
   */
  $exists?: boolean;
  $type?: BSONType | BSONTypeAlias;
  $expr?: Record<string, any>;
  $jsonSchema?: Record<string, any>;
  $mod?: TValue extends number ? [number, number] : never;
  $regex?: TValue extends string ? BSONRegExp | RegExp | string : never;
  $options?: TValue extends string ? string : never;
  $geoIntersects?: {
    $geometry: Document;
  };
  $geoWithin?: Document;
  $near?: Document;
  $nearSphere?: Document;
  $maxDistance?: number;
  $all?: TValue extends readonly any[] ? readonly any[] : never;
  $elemMatch?: TValue extends readonly any[] ? Document : never;
  $size?: TValue extends readonly any[] ? number : never;
  $bitsAllClear?: BitwiseFilter;
  $bitsAllSet?: BitwiseFilter;
  $bitsAnyClear?: BitwiseFilter;
  $bitsAnySet?: BitwiseFilter;
  $rand?: Record<string, never>;
}

/**
 * Returns all dot-notation properties of a schema with their corresponding types.
 *
 * @example
 * {
 *   foo: string;
 *   'nested.field': number;
 * }
 */
export type PaprAllProperties<TSchema> = {
  [Property in Join<NestedPaths<TSchema, []>, '.'>]?: PropertyType<TSchema, Property>;
};

/**
 * Returns all array-specific element dot-notation properties of a schema with their corresponding types.
 *
 * https://www.mongodb.com/docs/v5.3/reference/operator/update/positional/#update-values-in-an-array
 * https://www.mongodb.com/docs/v5.3/reference/operator/update/positional-all/#update-all-elements-in-an-array
 * https://www.mongodb.com/docs/v5.3/reference/operator/update/positional-filtered/#update-all-array-elements-that-match-arrayfilters
 *
 * @example
 * {
 *   'numbersList.$': number;
 *   'numbersList.$[]': number;
 *   'numbersList.$[element]': number;
 * }
 */
export type PaprArrayElementsProperties<TSchema> = {
  [
    Property in `${KeysOfAType<PaprAllProperties<TSchema>, any[]>}.$${'' | `[${string}]`}`
  ]?: ArrayElement<PropertyType<TSchema, Property extends `${infer Key}.$${string}` ? Key : never>>;
};

/**
 * Returns all array-specific nested dot-notation properties of a schema without type lookup.
 *
 * https://www.mongodb.com/docs/v5.3/reference/operator/update/positional/#update-documents-in-an-array
 * https://www.mongodb.com/docs/v5.3/reference/operator/update/positional-all/#update-all-documents-in-an-array
 * https://www.mongodb.com/docs/v5.3/reference/operator/update/positional-filtered/#update-all-documents-that-match-arrayfilters-in-an-array
 *
 * @example
 * {
 *   'objectList.$.foo': any;
 *   'objectList.$[].foo': any;
 *   'objectList.$[element].foo': any;
 * }
 */
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export type PaprArrayNestedProperties<TSchema> = {
  [
    Property in `${KeysOfAType<PaprAllProperties<TSchema>, Record<string, any>[]>}.$${
      '' | `[${string}]`}.${string}`
  ]?: any;
};

// We want the most common case (`PaprAllProperties`) to be the first member in this union,
// since it's faster to compute and check against.
export type PaprMatchKeysAndValues<TSchema> = PaprAllProperties<TSchema> &
  PaprArrayElementsProperties<TSchema> &
  PaprArrayNestedProperties<TSchema>;

/**
 * Extracts the root property name from a (possibly dot-notation) key.
 *
 * @example
 * 'nestedObject.direct' -> 'nestedObject'
 * 'foo' -> 'foo'
 */
type RootProperty<Property> = Property extends `${infer Root}.${string}` ? Root : Property;

/**
 * Returns the root properties of the top-level equality fields in a filter,
 * including the fields inside top-level `$and` clauses (one level deep).
 *
 * During an upsert operation these fields are included in the newly inserted document:
 * https://www.mongodb.com/docs/manual/reference/method/db.collection.update/#upsert-behavior
 *
 * Note: Fields using comparison operators (e.g. `{ foo: { $gt: 1 } }`) are not equality fields
 * and are not included in the inserted document, but they are intentionally treated here
 * as provided properties, because telling them apart from direct object values is unreliable.
 */
type PaprFilterProvidedProperties<TFilter> =
  | Exclude<RootProperty<string & keyof TFilter>, `$${string}`>
  | (TFilter extends { $and: readonly (infer TClause)[] }
      ? TClause extends unknown
        ? Exclude<RootProperty<string & keyof TClause>, `$${string}`>
        : never
      : never);

/**
 * Returns the root properties referenced by an update operator's fields.
 */
type PaprUpdateOperatorProperties<TOperator> = TOperator extends object
  ? RootProperty<string & keyof TOperator>
  : never;

/**
 * Returns the root properties created on the inserted document during an upsert operation
 * by the update operators which create missing fields.
 *
 * https://www.mongodb.com/docs/manual/reference/operator/update/#fields
 */
type PaprUpdateProvidedProperties<TSchema, TUpdate extends PaprUpdateFilter<TSchema>> =
  | PaprUpdateOperatorProperties<TUpdate['$addToSet']>
  | PaprUpdateOperatorProperties<TUpdate['$bit']>
  | PaprUpdateOperatorProperties<TUpdate['$currentDate']>
  | PaprUpdateOperatorProperties<TUpdate['$inc']>
  | PaprUpdateOperatorProperties<TUpdate['$max']>
  | PaprUpdateOperatorProperties<TUpdate['$min']>
  | PaprUpdateOperatorProperties<TUpdate['$mul']>
  | PaprUpdateOperatorProperties<TUpdate['$push']>
  | PaprUpdateOperatorProperties<TUpdate['$set']>
  | PaprUpdateOperatorProperties<TUpdate['$setOnInsert']>;

/**
 * Returns the required properties in the schema which are not provided by any of the sources
 * contributing to the document created by the insert branch of an upsert operation:
 *
 * - the filter equality fields;
 * - the update operator fields;
 * - the schema defaults and timestamps (via `DocumentForInsert`).
 */
type PaprUpsertMissingProperties<
  TSchema,
  TOptions extends SchemaOptions<TSchema>,
  TFilter extends PaprFilter<TSchema>,
  TUpdate extends PaprUpdateFilter<TSchema>,
> = Exclude<
  NonNullable<RequiredProperties<DocumentForInsert<TSchema, TOptions>>> & string,
  PaprFilterProvidedProperties<TFilter> | PaprUpdateProvidedProperties<TSchema, TUpdate>
>;

/**
 * Checks that the document created by the insert branch of an upsert operation
 * contains all the required properties in the schema.
 *
 * Resolves to `unknown` when all required properties are provided by the filter equality fields,
 * the update operators, the schema defaults or the timestamps.
 * Otherwise, it requires the missing properties in the `$setOnInsert` operator.
 *
 * Non-literal filter or update types (e.g. `PaprFilter<TSchema>`) provide all their properties,
 * so they skip this check.
 */
export type PaprUpsertUpdateFilter<
  TSchema,
  TOptions extends SchemaOptions<TSchema>,
  TFilter extends PaprFilter<TSchema>,
  TUpdate extends PaprUpdateFilter<TSchema>,
> = [PaprUpsertMissingProperties<TSchema, TOptions, TFilter, TUpdate>] extends [never]
  ? unknown
  : {
      $setOnInsert: {
        [
          Property in PaprUpsertMissingProperties<TSchema, TOptions, TFilter, TUpdate>
        ]: PropertyType<TSchema, Property>;
      };
    };

export interface PaprUpdateFilter<TSchema> {
  $currentDate?: OnlyFieldsOfType<
    TSchema,
    Date | Timestamp,
    | true
    | {
        $type: 'date' | 'timestamp';
      }
  >;
  $inc?: OnlyFieldsOfType<TSchema, NumericType | undefined>;
  $min?: PaprMatchKeysAndValues<TSchema>;
  $max?: PaprMatchKeysAndValues<TSchema>;
  $mul?: OnlyFieldsOfType<TSchema, NumericType | undefined>;
  $rename?: Record<string, string>;
  $set?: PaprMatchKeysAndValues<TSchema>;
  $setOnInsert?: PaprMatchKeysAndValues<TSchema>;
  $unset?: OnlyFieldsOfType<TSchema, any, '' | 1 | true>;
  $addToSet?: SetFields<TSchema>;
  $pop?: OnlyFieldsOfType<TSchema, readonly any[], -1 | 1>;
  $pull?: PullOperator<TSchema>;
  $push?: PushOperator<TSchema>;
  $pullAll?: PullAllOperator<TSchema>;
  $bit?: OnlyFieldsOfType<
    TSchema,
    NumericType | undefined,
    | {
        and: IntegerType;
      }
    | {
        or: IntegerType;
      }
    | {
        xor: IntegerType;
      }
  >;
}
