import { expectType, TypeEqual } from 'ts-expect';

import type { TupleItems } from '../TupleItems';

// with required properties
expectType<
  TypeEqual<
    TupleItems<readonly ['a', 'b', 'c' | undefined, 'd' | undefined]>,
    ['a', 'b'] | ['a', 'b', 'c'] | ['a', 'b', 'c', 'd']
  >
>(true);

// with required properties and preceding optional properties
expectType<
  TypeEqual<
    TupleItems<readonly ['a' | undefined, 'b', 'c' | undefined, 'd' | undefined]>,
    ['a', 'b'] | ['a', 'b', 'c'] | ['a', 'b', 'c', 'd']
  >
>(true);

// with only optional properties
expectType<
  TypeEqual<
    TupleItems<readonly ['a' | undefined, 'b' | undefined, 'c' | undefined]>,
    [] | ['a'] | ['a', 'b'] | ['a', 'b', 'c']
  >
>(true);

// with only required properties
expectType<TypeEqual<TupleItems<readonly ['a', 'b', 'c']>, ['a', 'b', 'c']>>(true);

// with no properties
expectType<TypeEqual<TupleItems<readonly []>, []>>(true);

test('ignore empty test for jest', () => {
  // ignore
});
