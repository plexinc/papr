import { describe, expect, test } from '@jest/globals';
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

        expect(value).toEqual({
          type: 'boolean',
        });
        expectType<boolean | undefined>(value);
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.boolean({ required: true });

        expect(value).toEqual({
          $required: true,
          type: 'boolean',
        });
        expectType<boolean>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
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

        expect(value).toEqual({
          bsonType: 'date',
        });
        expectType<Date | undefined>(value);
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.date({ required: true });

        expect(value).toEqual({
          $required: true,
          bsonType: 'date',
        });
        expectType<Date>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
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

        expect(value).toEqual({
          bsonType: 'decimal',
        });
        expectType<Decimal128 | undefined>(value);
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.decimal({ required: true });

        expect(value).toEqual({
          $required: true,
          bsonType: 'decimal',
        });
        expectType<Decimal128>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.decimal({ maximum: 1 });
      });
    });

    describe('null', () => {
      test('default', () => {
        const value = types.null();

        expect(value).toEqual({
          type: 'null',
        });
        expectType<null | undefined>(value);
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.null({ required: true });

        expect(value).toEqual({
          $required: true,
          type: 'null',
        });
        expectType<null>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
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

        expect(value).toEqual({
          type: 'number',
        });
        expectType<number | undefined>(value);
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.number({ required: true });

        expect(value).toEqual({
          $required: true,
          type: 'number',
        });
        expectType<number>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
      });

      test('options', () => {
        types.number({
          maximum: 9,
          minimum: 2,
          multipleOf: 2,
        });

        // @ts-expect-error invalid option
        types.number({ maxLength: 1 });
      });
    });

    describe('enum', () => {
      test('default', () => {
        const value = types.enum(Object.values(TEST_ENUM));

        expect(value).toEqual({
          enum: ['foo', 'bar'],
        });
        expectType<TEST_ENUM | undefined>(value);
        expectType<typeof value>(TEST_ENUM.FOO);
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.enum([...Object.values(TEST_ENUM), null], { required: true });

        expect(value).toEqual({
          $required: true,
          enum: ['foo', 'bar', null],
        });
        expectType<TEST_ENUM | null>(value);
        expectType<typeof value>(TEST_ENUM.FOO);
        expectType<typeof value>(null);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.enum(Object.values(TEST_ENUM), { maximum: 1 });
        // @ts-expect-error invalid option
        types.enum(Object.values(TEST_ENUM), { maxLength: 1 });
      });

      test('array of const', () => {
        const value = types.enum(['a' as const, 'b' as const]);

        expect(value).toEqual({
          enum: ['a', 'b'],
        });
        expectType<typeof value>('a');
        // @ts-expect-error `value` can not be c
        expectType<typeof value>('c');
        expectType<typeof value>(undefined);
      });
    });

    describe('objectId', () => {
      test('default', () => {
        const value = types.objectId();

        expect(value).toEqual({
          bsonType: 'objectId',
        });
        expectType<ObjectId | undefined>(value);
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.objectId({ required: true });

        expect(value).toEqual({
          $required: true,
          bsonType: 'objectId',
        });
        expectType<ObjectId>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.objectId({ maximum: 1 });
      });
    });

    describe('binary', () => {
      test('default', () => {
        const value = types.binary();

        expect(value).toEqual({
          bsonType: 'binData',
        });
        expectType<Binary | undefined>(value);
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.binary({ required: true });

        expect(value).toEqual({
          $required: true,
          bsonType: 'binData',
        });
        expectType<Binary>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
      });

      test('options', () => {
        // @ts-expect-error invalid option
        types.binary({ maximum: 1 });
      });
    });

    describe('string', () => {
      test('default', () => {
        const value = types.string();

        expect(value).toEqual({
          type: 'string',
        });
        expectType<string | undefined>(value);
        expectType<typeof value>(undefined);
      });

      test('pattern', () => {
        const value = types.string({ pattern: '^foo' });

        expect(value).toEqual({
          pattern: '^foo',
          type: 'string',
        });
        expectType<string | undefined>(value);
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.string({ required: true });

        expect(value).toEqual({
          $required: true,
          type: 'string',
        });
        expectType<string>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
      });

      test('options', () => {
        types.string({
          enum: ['foo', 'bar'],
          maxLength: 9,
          minLength: 1,
        });

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

        expect(value).toEqual({
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectType<any>(value);
        expectType<typeof value>(undefined);
        expectType<typeof value>('foo');
        expectType<typeof value>(123);
      });

      test('required', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const value = types.any({ required: true });

        expect(value).toEqual({
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expectType<any>(value);
        expectType<typeof value>(undefined);
        expectType<typeof value>('foo');
        expectType<typeof value>(123);
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

        expect(value).toEqual({
          items: {
            $required: true,
            type: 'boolean',
          },
          type: 'array',
        });
        expectType<boolean[] | undefined>(value);
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.array(types.string(), { required: true });

        expect(value).toEqual({
          $required: true,
          items: {
            type: 'string',
          },
          type: 'array',
        });
        expectType<(string | undefined)[]>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
      });

      test('options', () => {
        const value = types.array(types.number(), {
          maxItems: 9,
          minItems: 1,
        });

        expect(value).toEqual({
          items: {
            type: 'number',
          },
          maxItems: 9,
          minItems: 1,
          type: 'array',
        });
        expectType<(number | undefined)[] | undefined>(value);
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

        expect(value).toEqual({
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
        expectType<{ foo?: string }[]>(value);
      });
    });

    describe('constant', () => {
      test('default', () => {
        const value = types.constant('foo' as const);

        expect(value).toEqual({
          enum: ['foo'],
        });
        expectType<'foo' | undefined>(value);
      });

      test('required', () => {
        const value = types.constant('foo' as const, { required: true });

        expect(value).toEqual({
          $required: true,
          enum: ['foo'],
        });
        expectType<'foo'>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
      });
    });

    describe('object', () => {
      test('default', () => {
        const value = types.object({
          bar: types.number({ required: true }),
          foo: types.boolean(),
        });

        expect(value).toEqual(
          expect.objectContaining({
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
          })
        );
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
      });

      test('required', () => {
        const value = types.object(
          {
            foo: types.boolean(),
          },
          { required: true }
        );

        expect(value).toEqual(
          expect.objectContaining({
            $required: true,
            additionalProperties: false,
            properties: {
              foo: {
                type: 'boolean',
              },
            },
            type: 'object',
          })
        );
        expectType<{ foo?: boolean }>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
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

        expect(value).toEqual(
          expect.objectContaining({
            additionalProperties: true,
            maxProperties: 3,
            minProperties: 1,
            properties: {
              foo: {
                type: 'boolean',
              },
            },
            type: 'object',
          })
        );
        expectType<
          | {
              foo?: boolean;
            }
          | undefined
        >(value);
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

        expect(value).toEqual(
          expect.objectContaining({
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
          })
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
      });

      test('required', () => {
        const value = types.objectGeneric(types.number(), '^(foo|bar)$', { required: true });

        expect(value).toEqual(
          expect.objectContaining({
            $required: true,
            additionalProperties: false,
            patternProperties: {
              '^(foo|bar)$': {
                type: 'number',
              },
            },
            type: 'object',
          })
        );
        expectType<Record<string, number | undefined>>(value);
        // @ts-expect-error `value` should not be undefined
        expectType<typeof value>(undefined);
      });

      test('options', () => {
        const value = types.objectGeneric(types.boolean(), '.+', {
          additionalProperties: true,
          maxProperties: 3,
          minProperties: 1,
        });

        expect(value).toEqual(
          expect.objectContaining({
            additionalProperties: true,
            maxProperties: 3,
            minProperties: 1,
            patternProperties: {
              '.+': {
                type: 'boolean',
              },
            },
            type: 'object',
          })
        );
        expectType<Record<string, boolean | undefined> | undefined>(value);
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

        expect(value).toEqual({
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

        expect(value).toEqual({
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

        expect(value).toEqual({
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
        expectType<
          | [string, number, boolean, ObjectId, Date]
          | [string, number, boolean, ObjectId]
          | [string, number, boolean]
        >(value);
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

        expect(value).toEqual({
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
        expectType<[string, number, boolean, ObjectId, Date] | [string, number, boolean, ObjectId]>(
          value
        );
      });
    });

    describe('unknown', () => {
      test('default', () => {
        const value = types.unknown();

        expect(value).toEqual({
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

        expectType<unknown>(value);
        expectType<typeof value>(undefined);
        expectType<typeof value>('foo');
        expectType<typeof value>(123);
      });

      test('required', () => {
        const value = types.unknown({ required: true });

        expect(value).toEqual({
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

        expectType<unknown>(value);
        expectType<typeof value>(undefined);
        expectType<typeof value>('foo');
        expectType<typeof value>(123);
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

        expect(value).toEqual(
          expect.objectContaining({
            oneOf: [
              {
                type: 'number',
              },
              {
                type: 'string',
              },
            ],
          })
        );
        expectType<number | string | undefined>(value);
        // @ts-expect-error `value` should not be `boolean`
        expectType<boolean>(value);
        expectType<typeof value>(123);
        expectType<typeof value>('foo');
        expectType<typeof value>(undefined);
      });

      test('required', () => {
        const value = types.oneOf([types.boolean(), types.string()], { required: true });

        expect(value).toEqual(
          expect.objectContaining({
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
          })
        );
        expectType<boolean | string>(value);
        // @ts-expect-error `value` should not be `number`
        expectType<number>(value);
        // @ts-expect-error `value` should not be `undefined`
        expectType<undefined>(value);
        expectType<typeof value>(true);
        expectType<typeof value>('foo');
      });

      test('nullable', () => {
        const value = types.oneOf([types.string(), types.null()], { required: true });

        expect(value).toEqual(
          expect.objectContaining({
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
          })
        );

        expectType<string | null>(value);
        // @ts-expect-error `value` should not be `number`
        expectType<number>(value);
        // @ts-expect-error `value` should not be `undefined`
        expectType<undefined>(value);
        expectType<typeof value>('foo');
        expectType<typeof value>(null);
      });
    });
  });
});
