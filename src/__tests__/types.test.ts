import { deepStrictEqual } from 'node:assert';
import { describe, test } from 'node:test';
import { ObjectId, Binary, Decimal128 } from 'mongodb';
import { expectType } from 'ts-expect';
import types from '../types';

enum TEST_ENUM {
  FOO = 'foo',
  BAR = 'bar',
}

describe('types', () => {
  describe('simple types', () => {
    describe('boolean', () => {
      test('default', () => {
        const value = types.boolean();

        expectType<boolean | undefined>(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          type: 'boolean',
        });
      });

      test('required', () => {
        const value = types.boolean({ required: true });

        expectType<boolean>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          type: 'boolean',
        });
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.boolean({ maximum: 1 });
        // @ts-expect-error invalid option
        types.boolean({ maxLength: 1 });
      });
    });

    describe('date', () => {
      test('default', () => {
        const value = types.date();

        expectType<Date | undefined>(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          bsonType: 'date',
        });
      });

      test('required', () => {
        const value = types.date({ required: true });

        expectType<Date>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          bsonType: 'date',
        });
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.date({ maximum: 1 });
        // @ts-expect-error invalid option
        types.date({ maxLength: 1 });
      });
    });

    describe('decimal', () => {
      test('default', () => {
        const value = types.decimal();

        expectType<Decimal128 | undefined>(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          bsonType: 'decimal',
        });
      });

      test('required', () => {
        const value = types.decimal({ required: true });

        expectType<Decimal128>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          bsonType: 'decimal',
        });
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.decimal({ maximum: 1 });
      });
    });

    describe('null', () => {
      test('default', () => {
        const value = types.null();

        expectType<null | undefined>(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          type: 'null',
        });
      });

      test('required', () => {
        const value = types.null({ required: true });

        expectType<null>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          type: 'null',
        });
      });

      test('options', () => {
        types.null({ required: true });

        // @ts-expect-error invalid option
        types.number({ maxLength: 1 });
      });
    });

    describe('number', () => {
      test('default', () => {
        const value = types.number();

        expectType<number | undefined>(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          type: 'number',
        });
      });

      test('required', () => {
        const value = types.number({ required: true });

        expectType<number>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          type: 'number',
        });
      });

      test('options, range and modulo', () => {
        const options = {
          maximum: 9,
          minimum: 2,
          multipleOf: 2,
        } as const;
        types.number(options);

        // @ts-expect-error invalid option
        types.number({ maxLength: 1 });
      });

      test('options, enum', () => {
        const options = {
          enum: [1, 2, 3],
        } as const;
        types.number(options);

        // @ts-expect-error invalid option
        types.number({ maxLength: 1 });
      });
    });

    describe('enum', () => {
      test('default', () => {
        const value = types.enum(Object.values(TEST_ENUM));

        expectType<TEST_ENUM | undefined>(value);
        expectType<typeof value>(TEST_ENUM.FOO);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          enum: ['foo', 'bar'],
        });
      });

      test('required', () => {
        const value = types.enum([...Object.values(TEST_ENUM), null], { required: true });

        expectType<TEST_ENUM | null>(value);
        expectType<typeof value>(TEST_ENUM.FOO);
        expectType<typeof value>(null);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          enum: ['foo', 'bar', null],
        });
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.enum(Object.values(TEST_ENUM), { maximum: 1 });
        // @ts-expect-error invalid option
        types.enum(Object.values(TEST_ENUM), { maxLength: 1 });
      });

      test('const array', () => {
        const value = types.enum(['a', 'b'] as const);

        expectType<typeof value>('a');
        // @ts-expect-error `value` can not be c
        expectType<typeof value>('c');
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          enum: ['a', 'b'],
        });
      });
    });

    describe('objectId', () => {
      test('default', () => {
        const value = types.objectId();

        expectType<ObjectId | undefined>(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          bsonType: 'objectId',
        });
      });

      test('required', () => {
        const value = types.objectId({ required: true });

        expectType<ObjectId>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          bsonType: 'objectId',
        });
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.objectId({ maximum: 1 });
      });
    });

    describe('binary', () => {
      test('default', () => {
        const value = types.binary();

        expectType<Binary | undefined>(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          bsonType: 'binData',
        });
      });

      test('required', () => {
        const value = types.binary({ required: true });

        expectType<Binary>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          bsonType: 'binData',
        });
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.binary({ maximum: 1 });
      });
    });

    describe('string', () => {
      test('default', () => {
        const value = types.string();

        expectType<string | undefined>(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          type: 'string',
        });
      });

      test('pattern', () => {
        const value = types.string({ pattern: '^foo' });

        expectType<string | undefined>(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          pattern: '^foo',
          type: 'string',
        });
      });

      test('required', () => {
        const value = types.string({ required: true });

        expectType<string>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          type: 'string',
        });
      });

      test('options', () => {
        const options = {
          enum: ['foo', 'bar'],
          maxLength: 9,
          minLength: 1,
        } as const;
        types.string(options);

        // @ts-expect-error invalid option
        types.string({ maximum: 1 });
      });
    });
  });

  describe('complex types', () => {
    describe('any', () => {
      test('default', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = types.any();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectType<any>(value);
        expectType<typeof value>(undefined);
        expectType<typeof value>('foo');
        expectType<typeof value>(123);

        deepStrictEqual(value, {
          bsonType: [
            'array',
            'binData',
            'bool',
            'date',
            'decimal',
            'null',
            'number',
            'object',
            'objectId',
            'string',
          ],
        });
      });

      test('required', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = types.any({ required: true });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectType<any>(value);
        expectType<typeof value>(undefined);
        expectType<typeof value>('foo');
        expectType<typeof value>(123);

        deepStrictEqual(value, {
          $required: true,
          bsonType: [
            'array',
            'binData',
            'bool',
            'date',
            'decimal',
            'null',
            'number',
            'object',
            'objectId',
            'string',
          ],
        });
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.any({ maximum: 1 });
        // @ts-expect-error invalid option
        types.any({ maxLength: 1 });
      });
    });

    describe('array', () => {
      test('default', () => {
        const value = types.array(types.boolean({ required: true }));

        expectType<boolean[] | undefined>(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          items: {
            $required: true,
            type: 'boolean',
          },
          type: 'array',
        });
      });

      test('required', () => {
        const value = types.array(types.string(), { required: true });

        expectType<(string | undefined)[]>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          items: {
            type: 'string',
          },
          type: 'array',
        });
      });

      test('options', () => {
        const value = types.array(types.number(), {
          maxItems: 9,
          minItems: 1,
        });

        expectType<(number | undefined)[] | undefined>(value);

        deepStrictEqual(value, {
          items: {
            type: 'number',
          },
          maxItems: 9,
          minItems: 1,
          type: 'array',
        });
      });

      test('with object items', () => {
        const value = types.array(
          types.object(
            {
              foo: types.string(),
            },
            { required: true }
          ),
          { required: true }
        );

        expectType<{ foo?: string }[]>(value);

        deepStrictEqual(value, {
          $required: true,
          items: {
            $required: true,
            additionalProperties: false,
            properties: {
              foo: {
                type: 'string',
              },
            },
            type: 'object',
          },
          type: 'array',
        });
      });
    });

    describe('constant', () => {
      test('default', () => {
        const value = types.constant('foo' as const);

        expectType<'foo' | undefined>(value);

        deepStrictEqual(value, {
          enum: ['foo'],
        });
      });

      test('required', () => {
        const value = types.constant('foo' as const, { required: true });

        expectType<'foo'>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          enum: ['foo'],
        });
      });
    });

    describe('object', () => {
      test('default', () => {
        const value = types.object({
          bar: types.number({ required: true }),
          foo: types.boolean(),
        });

        expectType<
          | {
              foo?: boolean;
              bar: number;
            }
          | undefined
        >(value);
        expectType<boolean | undefined>(value?.foo);
        expectType<typeof value>({
          bar: 123,
          foo: true,
        });
        expectType<typeof value>({
          bar: 123,
        });
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          additionalProperties: false,
          properties: {
            bar: {
              $required: true,
              type: 'number',
            },
            foo: {
              type: 'boolean',
            },
          },
          required: ['bar'],
          type: 'object',
        });
      });

      test('required', () => {
        const value = types.object(
          {
            foo: types.boolean(),
          },
          { required: true }
        );

        expectType<{ foo?: boolean }>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          additionalProperties: false,
          properties: {
            foo: {
              type: 'boolean',
            },
          },
          type: 'object',
        });
      });

      test('options', () => {
        const value = types.object(
          {
            foo: types.boolean(),
          },
          {
            additionalProperties: true,
            maxProperties: 3,
            minProperties: 1,
          }
        );

        expectType<
          | {
              foo?: boolean;
            }
          | undefined
        >(value);

        deepStrictEqual(value, {
          additionalProperties: true,
          maxProperties: 3,
          minProperties: 1,
          properties: {
            foo: {
              type: 'boolean',
            },
          },
          type: 'object',
        });
      });
    });

    describe('generic object', () => {
      test('default', () => {
        const value = types.objectGeneric(
          types.object(
            {
              bar: types.number({ required: true }),
              foo: types.boolean(),
            },
            { required: true }
          )
        );

        expectType<
          | Record<
              string,
              {
                foo?: boolean;
                bar: number;
              }
            >
          | undefined
        >(value);
        const item = value?.item;
        expectType<boolean | undefined>(item?.foo);
        expectType<number | undefined>(item?.bar);
        expectType<typeof item>({
          bar: 123,
          foo: true,
        });
        expectType<typeof item>({
          bar: 123,
        });
        expectType<typeof item>(undefined);

        deepStrictEqual(value, {
          additionalProperties: false,
          patternProperties: {
            '.+': {
              $required: true,
              additionalProperties: false,
              properties: {
                bar: {
                  $required: true,
                  type: 'number',
                },
                foo: {
                  type: 'boolean',
                },
              },
              required: ['bar'],
              type: 'object',
            },
          },
          type: 'object',
        });
      });

      test('required', () => {
        const value = types.objectGeneric(types.number(), '^(foo|bar)$', { required: true });

        expectType<Record<string, number | undefined>>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          additionalProperties: false,
          patternProperties: {
            '^(foo|bar)$': {
              type: 'number',
            },
          },
          type: 'object',
        });
      });

      test('options', () => {
        const value = types.objectGeneric(types.boolean(), '.+', {
          additionalProperties: true,
          maxProperties: 3,
          minProperties: 1,
        });

        expectType<Record<string, boolean | undefined> | undefined>(value);

        deepStrictEqual(value, {
          additionalProperties: true,
          maxProperties: 3,
          minProperties: 1,
          patternProperties: {
            '.+': {
              type: 'boolean',
            },
          },
          type: 'object',
        });
      });
    });

    describe('tuple', () => {
      test('default', () => {
        const value = types.tuple([
          types.string(),
          types.number(),
          types.boolean(),
          types.objectId(),
          types.date(),
        ] as const);

        expectType<
          | []
          | [string, number, boolean, ObjectId, Date]
          | [string, number, boolean, ObjectId]
          | [string, number, boolean]
          | [string, number]
          | [string]
          | undefined
        >(value);
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          additionalItems: false,
          items: [
            {
              type: 'string',
            },
            {
              type: 'number',
            },
            {
              type: 'boolean',
            },
            {
              bsonType: 'objectId',
            },
            {
              bsonType: 'date',
            },
          ],
          minItems: 0,
          type: 'array',
        });
      });

      test('required', () => {
        const value = types.tuple(
          [
            types.string(),
            types.number(),
            types.boolean(),
            types.objectId(),
            types.date(),
          ] as const,
          { required: true }
        );

        expectType<
          | []
          | [string, number, boolean, ObjectId, Date]
          | [string, number, boolean, ObjectId]
          | [string, number, boolean]
          | [string, number]
          | [string]
        >(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          $required: true,
          additionalItems: false,
          items: [
            {
              type: 'string',
            },
            {
              type: 'number',
            },
            {
              type: 'boolean',
            },
            {
              bsonType: 'objectId',
            },
            {
              bsonType: 'date',
            },
          ],
          minItems: 0,
          type: 'array',
        });
      });

      test('with required properties', () => {
        const value = types.tuple(
          [
            types.string({ required: true }),
            types.number({ required: true }),
            types.boolean({ required: true }),
            types.objectId(),
            types.date(),
          ] as const,
          { required: true }
        );

        expectType<
          | [string, number, boolean, ObjectId, Date]
          | [string, number, boolean, ObjectId]
          | [string, number, boolean]
        >(value);

        deepStrictEqual(value, {
          $required: true,
          additionalItems: false,
          items: [
            { $required: true, type: 'string' },
            { $required: true, type: 'number' },
            { $required: true, type: 'boolean' },
            {
              bsonType: 'objectId',
            },
            {
              bsonType: 'date',
            },
          ],
          minItems: 3,
          type: 'array',
        });
      });

      test('with required properties and preceding optional properties', () => {
        const value = types.tuple(
          [
            types.string(),
            types.number(),
            types.boolean(),
            types.objectId({ required: true }),
            types.date(),
          ] as const,
          { required: true }
        );

        expectType<[string, number, boolean, ObjectId, Date] | [string, number, boolean, ObjectId]>(
          value
        );

        deepStrictEqual(value, {
          $required: true,
          additionalItems: false,
          items: [
            {
              type: 'string',
            },
            {
              type: 'number',
            },
            {
              type: 'boolean',
            },
            { $required: true, bsonType: 'objectId' },
            {
              bsonType: 'date',
            },
          ],
          minItems: 4,
          type: 'array',
        });
      });
    });

    describe('unknown', () => {
      test('default', () => {
        const value = types.unknown();

        expectType<unknown>(value);
        expectType<typeof value>(undefined);
        expectType<typeof value>('foo');
        expectType<typeof value>(123);

        deepStrictEqual(value, {
          bsonType: [
            'array',
            'binData',
            'bool',
            'date',
            'decimal',
            'null',
            'number',
            'object',
            'objectId',
            'string',
          ],
        });
      });

      test('required', () => {
        const value = types.unknown({ required: true });

        expectType<unknown>(value);
        expectType<typeof value>(undefined);
        expectType<typeof value>('foo');
        expectType<typeof value>(123);

        deepStrictEqual(value, {
          $required: true,
          bsonType: [
            'array',
            'binData',
            'bool',
            'date',
            'decimal',
            'null',
            'number',
            'object',
            'objectId',
            'string',
          ],
        });
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.unknown({ maximum: 1 });
        // @ts-expect-error invalid option
        types.unknown({ maxLength: 1 });
      });
    });
  });

  describe('compound types', () => {
    describe('oneOf', () => {
      test('default', () => {
        const value = types.oneOf([types.number(), types.string()]);

        expectType<number | string | undefined>(value);
        // @ts-expect-error `value` should not be `boolean`
        expectType<boolean>(value);
        expectType<typeof value>(123);
        expectType<typeof value>('foo');
        expectType<typeof value>(undefined);

        deepStrictEqual(value, {
          oneOf: [
            {
              type: 'number',
            },
            {
              type: 'string',
            },
          ],
        });
      });

      test('required', () => {
        const value = types.oneOf([types.boolean(), types.string()], { required: true });

        expectType<boolean | string>(value);
        // @ts-expect-error `value` should not be `number`
        expectType<number>(value);
        // @ts-expect-error `value` should not be `undefined`
        expectType<undefined>(value);
        expectType<typeof value>(true);
        expectType<typeof value>('foo');

        deepStrictEqual(value, {
          $required: true,
          oneOf: [
            {
              $required: true,
              type: 'boolean',
            },
            {
              $required: true,
              type: 'string',
            },
          ],
        });
      });

      test('nullable', () => {
        const value = types.oneOf([types.string(), types.null()], { required: true });

        expectType<string | null>(value);
        // @ts-expect-error `value` should not be `number`
        expectType<number>(value);
        // @ts-expect-error `value` should not be `undefined`
        expectType<undefined>(value);
        expectType<typeof value>('foo');
        expectType<typeof value>(null);

        deepStrictEqual(value, {
          $required: true,
          oneOf: [
            {
              $required: true,
              type: 'string',
            },
            {
              $required: true,
              type: 'null',
            },
          ],
        });
      });
    });
  });
});
