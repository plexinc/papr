import type { ObjectId } from 'mongodb';
import { expectType, TypeEqual } from 'ts-expect';

import type { DeepPick } from '../DeepPick';

expectType<TypeEqual<DeepPick<{ a: 0; b: 0 }, 'a'>, { a: 0 }>>(true);
expectType<TypeEqual<DeepPick<{ a: 0; b: 0 }, 'b'>, { b: 0 }>>(true);

// nested fields
expectType<TypeEqual<DeepPick<{ a: { b: 0 } }, 'a'>, { a: { b: 0 } }>>(true);
expectType<TypeEqual<DeepPick<{ a: { b: 0; c: 0 }; b: 0 }, 'a.c'>, { a: { c: 0 } }>>(true);
expectType<
  TypeEqual<DeepPick<{ a: { b: { c: 0; d: 0 }; e: 0 } }, 'a.b.c'>, { a: { b: { c: 0 } } }>
>(true);
expectType<TypeEqual<DeepPick<{ a: { b: { c: 0; d: 0 }; e: 0 } }, 'a.e'>, { a: { e: 0 } }>>(true);
expectType<
  TypeEqual<
    DeepPick<{ a: { b: { c: 0; d: 0 }; e: 0 } }, 'a.b.c' | 'a.e'>,
    { a: { b: { c: 0 }; e: 0 } }
  >
>(true);

// optional
expectType<TypeEqual<DeepPick<{ a?: 0; b: 0 }, 'a'>, { a?: 0 }>>(true);

// arrays
expectType<TypeEqual<DeepPick<{ a: { b: 0; c: 0 }[] }, 'a.0.b'>, { a: { b: 0 }[] }>>(true);

// custom primitives
expectType<TypeEqual<DeepPick<{ a: Date; b: 0 }, 'a'>, { a: Date }>>(true);
expectType<TypeEqual<DeepPick<{ a: ObjectId; b: 0 }, 'a'>, { a: ObjectId }>>(true);

test('ignore empty test for jest', () => {
  // ignore
});
