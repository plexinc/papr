/* eslint-disable no-use-before-define */

import type {
  AlternativeType,
  ArrayElement,
  BitwiseFilter,
  BSONRegExp,
  BSONType,
  BSONTypeAlias,
  DeleteManyModel,
  DeleteOneModel,
  Document,
  IntegerType,
  Join,
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
import { SchemaOptions } from './schema';
import { DocumentForInsert, NestedPaths, NestedPathsOfType, PropertyType } from './utils';

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

// These buik operation types need our own `PaprFilter` and `PaprUpdateFilter` in their definition
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
  | AlternativeType<Type>
  | PaprFilterOperators<AlternativeType<Type>>;

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

export type PaprMatchKeysAndValues<TSchema> = {
  [Property in `${NestedPathsOfType<TSchema, any[]>}.$${'' | `[${string}]`}`]?: ArrayElement<
    PropertyType<TSchema, Property extends `${infer Key}.$${string}` ? Key : never>
  >;
} & {
  [Property in `${NestedPathsOfType<TSchema, Record<string, any>[]>}.$${
    | ''
    | `[${string}]`}.${string}`]?: any;
} & {
  [Property in Join<NestedPaths<TSchema, []>, '.'>]?: PropertyType<TSchema, Property>;
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
