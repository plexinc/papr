import { ObjectId } from 'mongodb';
import { expectType } from 'ts-expect';
import { ProjectionType, getIds } from '../utils';

describe('utils', () => {
  type Schema = {
    _id: ObjectId;
    foo: string;
    bar: number;
    ham?: Date;
  };

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
    const multiple = { bar: 1, ham: 1 };
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

  test('ProjectionType, full schema', () => {
    const testFull: ProjectionType<Schema, undefined> = {
      _id: new ObjectId(),
      bar: 123,
      foo: 'foo',
      ham: new Date(),
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
