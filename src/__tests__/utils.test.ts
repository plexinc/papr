import { describe, expect, test } from '@jest/globals';
import { ObjectId } from 'mongodb';
import { expectType } from 'ts-expect';
import { ProjectionType, StrictProjectionType, getIds } from '../utils';

describe('utils', () => {
  interface Schema {
    _id: ObjectId;
    foo: string;
    bar: number;
    ham?: Date;
    nestedList: {
      direct: string;
      other?: number;
    }[];
    nestedObject: {
      deep: {
        deeper: string;
        other?: number;
      };
      direct: boolean;
      other?: number;
    };
  }

  test('ProjectionType, required fields', () => {
    const foo = { foo: 1 };

    const testFoo: ProjectionType<Schema, typeof foo> = {
      _id: new ObjectId(),
      foo: 'foo',
    };

    expectType<{
      _id: ObjectId;
      foo: string;
    }>(testFoo);
    expectType<string>(testFoo.foo);
    // @ts-expect-error `bar` should be undefined here
    testFoo.bar;
    // @ts-expect-error `ham` should be undefined here
    testFoo.ham;

    const bar = { bar: 1 };

    const testBar: ProjectionType<Schema, typeof bar> = {
      _id: new ObjectId(),
      bar: 123,
    };

    expectType<{
      _id: ObjectId;
      bar: number;
    }>(testBar);
    // @ts-expect-error `foo` should be undefined here
    testBar.foo;
    expectType<number>(testBar.bar);
    // @ts-expect-error `ham` should be undefined here
    testBar.ham;
  });

  test('ProjectionType, multiple mixed fields', () => {
    const multiple = {
      bar: 1,
      ham: 1,
    };

    const testMultiple: ProjectionType<Schema, typeof multiple> = {
      _id: new ObjectId(),
      bar: 123,
      ham: new Date(),
    };

    expectType<{
      _id: ObjectId;
      bar: number;
      ham?: Date;
    }>(testMultiple);
    // @ts-expect-error `foo` should be undefined here
    testMultiple.foo;
    expectType<number>(testMultiple.bar);
    expectType<Date | undefined>(testMultiple.ham);
  });

  test('ProjectionType, nested fields', () => {
    const nested = {
      foo: 1,
      'nestedList.0.direct': 1,
      'nestedObject.deep.deeper': 1,
      'nestedObject.direct': 1,
    };

    const testNested: ProjectionType<Schema, typeof nested> = {
      _id: new ObjectId(),
      foo: 'foo',
      nestedList: [
        {
          direct: 'in list',
        },
      ],
      nestedObject: {
        deep: {
          deeper: 'in object',
        },
        direct: true,
      },
    };

    expectType<{
      _id: ObjectId;
      foo: string;
      nestedList: {
        direct: string;
      }[];
      nestedObject?: {
        deep?: {
          deeper: string;
        };
        direct: boolean;
      };
    }>(testNested);
    expectType<string>(testNested.foo);
    // @ts-expect-error `bar` should be undefined here
    testNested.bar;
    // @ts-expect-error `ham` should be undefined here
    testNested.ham;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expectType<any[]>(testNested.nestedList);
    expectType<string>(testNested.nestedList[0].direct);
    // @ts-expect-error `nestedList[0].other` should be undefined here
    testNested.nestedList[0].other;
    expectType<object>(testNested.nestedObject);
    expectType<object>(testNested.nestedObject.deep);
    expectType<string>(testNested.nestedObject.deep.deeper);
    // @ts-expect-error `nestedObject.deep.other` should be undefined here
    testNested.nestedObject.deep.other;
    // @ts-expect-error `nestedObject.other` should be undefined here
    testNested.nestedObject.other;
  });

  test('ProjectionType, full schema', () => {
    const testFull: ProjectionType<Schema, undefined> = {
      _id: new ObjectId(),
      bar: 123,
      foo: 'foo',
      ham: new Date(),
      nestedList: [],
      nestedObject: {
        deep: {
          deeper: 'hi',
        },
        direct: true,
      },
    };

    expectType<Schema>(testFull);
    expectType<string>(testFull.foo);
    expectType<number>(testFull.bar);
    expectType<Date | undefined>(testFull.ham);
  });

  test('StrictProjectionType, required fields', () => {
    const foo = { foo: 1 } as const;

    const testFoo: StrictProjectionType<Schema, typeof foo> = {
      _id: new ObjectId(),
      foo: 'foo',
    };

    expectType<{
      _id: ObjectId;
      foo: string;
    }>(testFoo);
    expectType<string>(testFoo.foo);
    // @ts-expect-error `bar` should be undefined here
    testFoo.bar;
    // @ts-expect-error `ham` should be undefined here
    testFoo.ham;

    const bar = { bar: 1 } as const;

    const testBar: StrictProjectionType<Schema, typeof bar> = {
      _id: new ObjectId(),
      bar: 123,
    };

    expectType<{
      _id: ObjectId;
      bar: number;
    }>(testBar);
    // @ts-expect-error `foo` should be undefined here
    testBar.foo;
    expectType<number>(testBar.bar);
    // @ts-expect-error `ham` should be undefined here
    testBar.ham;
  });

  test('StrictProjectionType, multiple mixed fields', () => {
    const multiple = {
      bar: 1,
      ham: 1,
    } as const;

    const testMultiple: StrictProjectionType<Schema, typeof multiple> = {
      _id: new ObjectId(),
      bar: 123,
      ham: new Date(),
    };

    expectType<{
      _id: ObjectId;
      bar: number;
      ham?: Date;
    }>(testMultiple);
    // @ts-expect-error `foo` should be undefined here
    testMultiple.foo;
    expectType<number>(testMultiple.bar);
    expectType<Date | undefined>(testMultiple.ham);
  });

  test('StrictProjectionType, nested fields', () => {
    const nested = {
      foo: 1,
      'nestedList.0.direct': 1,
      'nestedObject.deep.deeper': 1,
      'nestedObject.direct': 1,
    } as const;

    const testNested: StrictProjectionType<Schema, typeof nested> = {
      _id: new ObjectId(),
      foo: 'foo',
      nestedList: [
        {
          direct: 'in list',
        },
      ],
      nestedObject: {
        deep: {
          deeper: 'in object',
        },
        direct: true,
      },
    };

    expectType<{
      _id: ObjectId;
      foo: string;
      nestedList: {
        direct: string;
      }[];
      nestedObject?: {
        deep?: {
          deeper: string;
        };
        direct: boolean;
      };
    }>(testNested);
    expectType<string>(testNested.foo);
    // @ts-expect-error `bar` should be undefined here
    testNested.bar;
    // @ts-expect-error `ham` should be undefined here
    testNested.ham;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expectType<any[]>(testNested.nestedList);
    expectType<string>(testNested.nestedList[0].direct);
    // @ts-expect-error `nestedList[0].other` should be undefined here
    testNested.nestedList[0].other;
    expectType<object>(testNested.nestedObject);
    expectType<object>(testNested.nestedObject.deep);
    expectType<string>(testNested.nestedObject.deep.deeper);
    // @ts-expect-error `nestedObject.deep.other` should be undefined here
    testNested.nestedObject.deep.other;
    // @ts-expect-error `nestedObject.other` should be undefined here
    testNested.nestedObject.other;
  });

  test('StrictProjectionType, excluding _id', () => {
    const excluding = {
      _id: 0,
      bar: 1,
      ham: 1,
    } as const;

    const testExcluding: StrictProjectionType<Schema, typeof excluding> = {
      bar: 123,
      ham: new Date(),
    };

    expectType<{
      ham?: Date;
    }>(testExcluding);
    // @ts-expect-error `_id` should be undefined here
    testExcluding._id;
    expectType<Date | undefined>(testExcluding.ham);
  });

  test('StrictProjectionType, full schema except foo', () => {
    const excludingFoo = {
      foo: 0
    } as const;

    const testExceptFoo: StrictProjectionType<Schema, typeof excludingFoo> = {
      _id: new ObjectId(),
      bar: 123,
      ham: new Date(),
      nestedList: [],
      nestedObject: {
        deep: {
          deeper: 'hi',
        },
        direct: true,
      },
    };

    expectType<Omit<Schema, 'foo'>>(testExceptFoo);
    // @ts-expect-error `foo` should be undefined here
    testExceptFoo.foo;
    expectType<number>(testExceptFoo.bar);
    expectType<Date | undefined>(testExceptFoo.ham);
  });

  test('StrictProjectionType, full schema', () => {
    const testFull: StrictProjectionType<Schema, undefined> = {
      _id: new ObjectId(),
      bar: 123,
      foo: 'foo',
      ham: new Date(),
      nestedList: [],
      nestedObject: {
        deep: {
          deeper: 'hi',
        },
        direct: true,
      },
    };

    expectType<Schema>(testFull);
    expectType<string>(testFull.foo);
    expectType<number>(testFull.bar);
    expectType<Date | undefined>(testFull.ham);
  });

  test.each([
    ['strings', ['123456789012345678900001', '123456789012345678900002']],
    [
      'objectIds',
      [new ObjectId('123456789012345678900001'), new ObjectId('123456789012345678900002')],
    ],
    ['mixed', ['123456789012345678900001', new ObjectId('123456789012345678900002')]],
  ])('getIds %s', (_name, input) => {
    const result = getIds(input);

    expect(result).toHaveLength(2);
    expect(result[0] instanceof ObjectId).toBeTruthy();
    expect(result[0].toHexString()).toBe('123456789012345678900001');
    expect(result[1] instanceof ObjectId).toBeTruthy();
    expect(result[1].toHexString()).toBe('123456789012345678900002');
  });
});
