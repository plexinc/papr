/* eslint-disable no-use-before-define */
// Code adapted from https://gitlab.com/soul-codes/ts-deep-pick

import type { Binary, ObjectId } from 'mongodb';

import { ObjectType } from './types';

type UnionKeyOf<Type> = Type extends infer T ? keyof T : never;

type HeadPaths<Paths extends string> = Paths extends `${infer Head}.${string}` ? Head : Paths;

type InnerKeys<HeadKey extends string, Paths extends string> = [
  Extract<Paths, `${HeadKey}.${string}`>
] extends [`${HeadKey}.${infer RestKey}`]
  ? RestKey
  : never;

type InnerPick<Type, Paths extends string> = ObjectType<{
  [HeadKey in UnionKeyOf<Type>]: DeepPick<Type[HeadKey], InnerKeys<HeadKey, Paths>>;
}>;

type ArrayItemKeys<Paths extends string> = InnerKeys<`${number}`, Paths>;

type Primitive = number | boolean | string | symbol | null | undefined;

export type DeepPick<Type, Paths extends string> = Type extends Primitive | Binary | Date | ObjectId
  ? Type
  : Type extends (infer ArrayItem)[]
  ? DeepPick<ArrayItem, ArrayItemKeys<Paths>>[]
  : Pick<InnerPick<Type, Paths>, HeadPaths<Paths> & UnionKeyOf<Type>>;
