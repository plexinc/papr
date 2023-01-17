/* eslint-disable no-use-before-define */

import type {
  AlternativeType,
  BitwiseFilter,
  BSONRegExp,
  BSONType,
  BSONTypeAlias,
  Document,
  Join,
  NestedPaths,
  PropertyType,
  WithId,
} from 'mongodb';

// Some MonogDB types are too permissive when merging their type definitions with `Document`,
// which is just an alias for `Record<string, any>`.
// This type merge is preventing important type checks that can be done on the filter queries:
// e.g. checking for undefined attributes in the schema being used inside a query

export type PaprFilter<TSchema> =
  | Partial<TSchema>
  | (PaprRootFilterOperators<WithId<TSchema>> & {
      [Property in Join<NestedPaths<WithId<TSchema>, []>, '.'>]?: PaprCondition<
        PropertyType<WithId<TSchema>, Property>
      >;
    });

export interface PaprRootFilterOperators<TSchema> {
  $and?: PaprFilter<TSchema>[];
  $nor?: PaprFilter<TSchema>[];
  $or?: PaprFilter<TSchema>[];
  $text?: {
    $search: string;
    $language?: string;
    $caseSensitive?: boolean;
    $diacriticSensitive?: boolean;
  };
  $where?: string | ((this: TSchema) => boolean);
  $comment?: string;
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
  $all?: readonly any[];
  $elemMatch?: Document;
  $size?: TValue extends readonly any[] ? number : never;
  $bitsAllClear?: BitwiseFilter;
  $bitsAllSet?: BitwiseFilter;
  $bitsAnyClear?: BitwiseFilter;
  $bitsAnySet?: BitwiseFilter;
  $rand?: Record<string, never>;
}
