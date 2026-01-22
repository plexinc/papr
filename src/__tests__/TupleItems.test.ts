import { test } from 'node:test';
import { expectType } from 'ts-expect';

import type { TypeEqual } from 'ts-expect';
import type { TupleItems } from '../TupleItems.ts';

// with required properties
expectType<
  TypeEqual<
    TupleItems<readonly ['a', 'b', 'c' | undefined, 'd' | undefined]>,
    ['a', 'b', 'c', 'd'] | ['a', 'b', 'c'] | ['a', 'b']
  >
>(true);

// with required properties and preceding optional properties
expectType<
  TypeEqual<
    TupleItems<readonly ['a' | undefined, 'b', 'c' | undefined, 'd' | undefined]>,
    ['a', 'b', 'c', 'd'] | ['a', 'b', 'c'] | ['a', 'b']
  >
>(true);

// with only optional properties
expectType<
  TypeEqual<
    TupleItems<readonly ['a' | undefined, 'b' | undefined, 'c' | undefined]>,
    ['a', 'b', 'c'] | ['a', 'b'] | ['a'] | []
  >
>(true);

// with only required properties
expectType<TypeEqual<TupleItems<readonly ['a', 'b', 'c']>, ['a', 'b', 'c']>>(true);

// with no properties
expectType<TypeEqual<TupleItems<readonly []>, []>>(true);

test('ignore empty test', () => {
  // ignore
});
