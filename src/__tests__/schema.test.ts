import { describe, expect, test } from '@jest/globals';
import { ObjectId, Binary, Decimal128 } from 'mongodb';
import { expectType } from 'ts-expect';
import schema from '../schema';
import types from '../types';
import { VALIDATION_ACTIONS, VALIDATION_LEVEL } from '../utils';

enum TEST_ENUM {
  FOO = 'foo',
  BAR = 'bar',
}

describe('schema', () => {
  test('simple', () => {
    const value = schema({
      bar: types.number({ required: true }),
      foo: types.boolean(),
    });

    expect(value).toEqual({
      $validationAction: 'error',
      $validationLevel: 'strict',
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        bar: {
          type: 'number',
        },
        foo: {
          type: 'boolean',
        },
      },
      required: ['_id', 'bar'],
      type: 'object',
    });

    expectType<
      [
        {
          _id: ObjectId;
          foo?: boolean;
          bar: number;
        },
        // eslint-disable-next-line @typescript-eslint/ban-types
        {}
      ]
    >(value);
    expectType<ObjectId>(value[0]?._id);
    expectType<boolean | undefined>(value[0]?.foo);
    expectType<typeof value[0]>({
      _id: new ObjectId(),
      bar: 123,
      foo: true,
    });
    expectType<typeof value[0]>({
      _id: new ObjectId(),
      bar: 123,
    });
  });

  test('with defaults', () => {
    const value = schema(
      {
        bar: types.number({ required: true }),
        foo: types.boolean(),
      },
      {
        defaults: { foo: true },
      }
    );

    expect(value).toEqual({
      $defaults: { foo: true },
      $validationAction: 'error',
      $validationLevel: 'strict',
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        bar: {
          type: 'number',
        },
        foo: {
          type: 'boolean',
        },
      },
      required: ['_id', 'bar'],
      type: 'object',
    });

    expectType<
      [
        {
          _id: ObjectId;
          foo?: boolean;
          bar: number;
        },
        {
          defaults: { foo: boolean };
        }
      ]
    >(value);
    expectType<ObjectId>(value[0]?._id);
    expectType<boolean | undefined>(value[0]?.foo);
    expectType<typeof value[0]>({
      _id: new ObjectId(),
      bar: 123,
      foo: true,
    });
    expectType<typeof value[0]>({
      _id: new ObjectId(),
      bar: 123,
    });
  });

  describe('with timestamps', () => {
    test('enabled', () => {
      const value = schema(
        {
          foo: types.boolean(),
        },
        {
          timestamps: true,
        }
      );

      expect(value).toEqual({
        $timestamps: true,
        $validationAction: 'error',
        $validationLevel: 'strict',
        additionalProperties: false,
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          createdAt: {
            bsonType: 'date',
          },
          foo: {
            type: 'boolean',
          },
          updatedAt: {
            bsonType: 'date',
          },
        },
        required: ['_id', 'createdAt', 'updatedAt'],
        type: 'object',
      });

      expectType<
        [
          {
            _id: ObjectId;
            foo?: boolean;
            createdAt: Date;
            updatedAt: Date;
          },
          { timestamps: boolean }
        ]
      >(value);
      expectType<ObjectId>(value[0]?._id);
      expectType<boolean | undefined>(value[0]?.foo);
      expectType<Date>(value[0]?.createdAt);
      expectType<Date>(value[0]?.updatedAt);
      expectType<typeof value[0]>({
        _id: new ObjectId(),
        createdAt: new Date(),
        foo: true,
        updatedAt: new Date(),
      });
    });

    test('disabled', () => {
      const value = schema(
        {
          foo: types.boolean(),
        },
        {
          timestamps: false,
        }
      );

      expect(value).toEqual({
        $validationAction: 'error',
        $validationLevel: 'strict',
        additionalProperties: false,
        properties: {
          _id: {
            bsonType: 'objectId',
          },
          foo: {
            type: 'boolean',
          },
        },
        required: ['_id'],
        type: 'object',
      });

      expectType<
        [
          {
            _id: ObjectId;
            foo?: boolean;
          },
          { timestamps: boolean }
        ]
      >(value);
      expectType<ObjectId>(value[0]?._id);
      expectType<boolean | undefined>(value[0]?.foo);
      // @ts-expect-error `createdAt` is undefined here
      value[0]?.createdAt;
      expectType<typeof value[0]>({
        _id: new ObjectId(),
        foo: true,
      });
    });

    test('enabled with property names', () => {
      const value = schema(
        {
          foo: types.boolean(),
        },
        {
          timestamps: {
            createdAt: '_createdDate' as const,
            updatedAt: '_updatedDate' as const,
          },
        }
      );

      expect(value).toEqual({
        $timestamps: {
          createdAt: '_createdDate',
          updatedAt: '_updatedDate',
        },
        $validationAction: 'error',
        $validationLevel: 'strict',
        additionalProperties: false,
        properties: {
          _createdDate: {
            bsonType: 'date',
          },
          _id: {
            bsonType: 'objectId',
          },
          _updatedDate: {
            bsonType: 'date',
          },
          foo: {
            type: 'boolean',
          },
        },
        required: ['_id', '_createdDate', '_updatedDate'],
        type: 'object',
      });

      expectType<
        [
          {
            _id: ObjectId;
            foo?: boolean;
            _createdDate: Date;
            _updatedDate: Date;
          },
          {
            timestamps: {
              createdAt: string;
              updatedAt: string;
            };
          }
        ]
      >(value);
      expectType<ObjectId>(value[0]?._id);
      expectType<boolean | undefined>(value[0]?.foo);
      expectType<Date>(value[0]?._createdDate);
      expectType<Date>(value[0]?._updatedDate);
      // @ts-expect-error `createdAt` is undefined here
      value[0]?.createdAt;
      // @ts-expect-error `updatedAt` is undefined here
      value[0]?.updatedAt;
      expectType<typeof value[0]>({
        _createdDate: new Date(),
        _id: new ObjectId(),
        _updatedDate: new Date(),
        foo: true,
      });
    });

    test('enabled with partial property names', () => {
      const value = schema(
        {
          foo: types.boolean(),
        },
        {
          timestamps: {
            createdAt: '_createdDate' as const,
          },
        }
      );

      expect(value).toEqual({
        $timestamps: {
          createdAt: '_createdDate',
        },
        $validationAction: 'error',
        $validationLevel: 'strict',
        additionalProperties: false,
        properties: {
          _createdDate: {
            bsonType: 'date',
          },
          _id: {
            bsonType: 'objectId',
          },
          foo: {
            type: 'boolean',
          },
          updatedAt: {
            bsonType: 'date',
          },
        },
        required: ['_id', '_createdDate', 'updatedAt'],
        type: 'object',
      });

      expectType<
        [
          {
            _id: ObjectId;
            foo?: boolean;
            _createdDate: Date;
            updatedAt: Date;
          },
          {
            timestamps: {
              createdAt: string;
            };
          }
        ]
      >(value);
      expectType<ObjectId>(value[0]?._id);
      expectType<boolean | undefined>(value[0]?.foo);
      expectType<Date>(value[0]?._createdDate);
      expectType<Date>(value[0]?.updatedAt);
      // @ts-expect-error `createdAt` is undefined here
      value[0]?.createdAt;
      expectType<typeof value[0]>({
        _createdDate: new Date(),
        _id: new ObjectId(),
        foo: true,
        updatedAt: new Date(),
      });
    });
  });

  test('with string IDs', () => {
    const value = schema({
      _id: types.string({ required: true }),
      foo: types.number({ required: true }),
    });

    expect(value).toEqual({
      $validationAction: 'error',
      $validationLevel: 'strict',
      additionalProperties: false,
      properties: {
        _id: {
          type: 'string',
        },
        foo: {
          type: 'number',
        },
      },
      required: ['_id', 'foo'],
      type: 'object',
    });

    expectType<
      [
        {
          _id: string;
          foo: number;
        },
        // eslint-disable-next-line @typescript-eslint/ban-types
        {}
      ]
    >(value);
    expectType<string>(value[0]?._id);
    expectType<typeof value[0]>({
      _id: 'first',
      foo: 123,
    });
    expectType<typeof value[0]>({
      _id: 'second',
      foo: 123,
    });
  });

  test('with number IDs', () => {
    const value = schema({
      _id: types.number({ required: true }),
      foo: types.string({ required: true }),
    });

    expect(value).toEqual({
      $validationAction: 'error',
      $validationLevel: 'strict',
      additionalProperties: false,
      properties: {
        _id: {
          type: 'number',
        },
        foo: {
          type: 'string',
        },
      },
      required: ['_id', 'foo'],
      type: 'object',
    });

    expectType<
      [
        {
          _id: number;
          foo: string;
        },
        // eslint-disable-next-line @typescript-eslint/ban-types
        {}
      ]
    >(value);
    expectType<number>(value[0]?._id);
    expectType<typeof value[0]>({
      _id: 123,
      foo: 'first',
    });
    expectType<typeof value[0]>({
      _id: 456,
      foo: 'second',
    });
  });

  test('full', () => {
    const value = schema(
      {
        anyOptional: types.any(),
        anyRequired: types.any({ required: true }),
        arrayOfObjects: types.array(
          types.object({
            foo: types.number(),
          })
        ),
        arrayOptional: types.array(types.number()),
        arrayRequired: types.array(types.number(), { required: true }),
        binaryOptional: types.binary(),
        binaryRequired: types.binary({ required: true }),
        booleanOptional: types.boolean(),
        booleanRequired: types.boolean({ required: true }),
        constantOptional: types.constant(TEST_ENUM.FOO as const),
        constantRequired: types.constant(TEST_ENUM.FOO as const, { required: true }),
        dateOptional: types.date(),
        dateRequired: types.date({ required: true }),
        decimalOptional: types.decimal(),
        decimalRequired: types.decimal({ required: true }),
        enumOptional: types.enum([...Object.values(TEST_ENUM), null]),
        enumRequired: types.enum(Object.values(TEST_ENUM), { required: true }),
        numberOptional: types.number(),
        numberRequired: types.number({ required: true }),
        objectGenericOptional: types.objectGeneric(types.number()),
        objectGenericRequired: types.objectGeneric(types.number(), 'abc.+', { required: true }),
        objectIdOptional: types.objectId(),
        objectIdRequired: types.objectId({ required: true }),
        objectOptional: types.object({
          foo: types.number(),
        }),
        objectRequired: types.object(
          {
            foo: types.number(),
          },
          { required: true }
        ),
        oneOfOptional: types.oneOf([types.number(), types.string()]),
        oneOfRequired: types.oneOf([types.number(), types.string()], { required: true }),
        stringOptional: types.string(),
        stringRequired: types.string({ required: true }),
      },
      {
        defaults: { stringOptional: 'foo' },
        timestamps: true,
        validationAction: VALIDATION_ACTIONS.WARN,
        validationLevel: VALIDATION_LEVEL.MODERATE,
      }
    );

    expect(value).toEqual({
      $defaults: { stringOptional: 'foo' },
      $timestamps: true,
      $validationAction: 'warn',
      $validationLevel: 'moderate',
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        anyOptional: {
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
        },
        anyRequired: {
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
        },
        arrayOfObjects: {
          items: {
            additionalProperties: false,
            properties: {
              foo: {
                type: 'number',
              },
            },
            type: 'object',
          },
          type: 'array',
        },
        arrayOptional: {
          items: {
            type: 'number',
          },
          type: 'array',
        },
        arrayRequired: {
          items: {
            type: 'number',
          },
          type: 'array',
        },
        binaryOptional: {
          bsonType: 'binData',
        },
        binaryRequired: {
          bsonType: 'binData',
        },
        booleanOptional: {
          type: 'boolean',
        },
        booleanRequired: {
          type: 'boolean',
        },
        constantOptional: {
          enum: ['foo'],
        },
        constantRequired: {
          enum: ['foo'],
        },
        createdAt: {
          bsonType: 'date',
        },
        dateOptional: {
          bsonType: 'date',
        },
        dateRequired: {
          bsonType: 'date',
        },
        decimalOptional: {
          bsonType: 'decimal',
        },
        decimalRequired: {
          bsonType: 'decimal',
        },
        enumOptional: {
          enum: ['foo', 'bar', null],
        },
        enumRequired: {
          enum: ['foo', 'bar'],
        },
        numberOptional: {
          type: 'number',
        },
        numberRequired: {
          type: 'number',
        },
        objectGenericOptional: {
          additionalProperties: false,
          patternProperties: {
            '.+': {
              type: 'number',
            },
          },
          type: 'object',
        },
        objectGenericRequired: {
          additionalProperties: false,
          patternProperties: {
            'abc.+': {
              type: 'number',
            },
          },
          type: 'object',
        },

        objectIdOptional: {
          bsonType: 'objectId',
        },
        objectIdRequired: {
          bsonType: 'objectId',
        },
        objectOptional: {
          additionalProperties: false,
          properties: {
            foo: {
              type: 'number',
            },
          },
          type: 'object',
        },
        objectRequired: {
          additionalProperties: false,
          properties: {
            foo: {
              type: 'number',
            },
          },
          type: 'object',
        },
        oneOfOptional: {
          oneOf: [
            {
              type: 'number',
            },
            {
              type: 'string',
            },
          ],
        },
        oneOfRequired: {
          oneOf: [
            {
              type: 'number',
            },
            {
              type: 'string',
            },
          ],
        },
        stringOptional: {
          type: 'string',
        },
        stringRequired: {
          type: 'string',
        },
        updatedAt: {
          bsonType: 'date',
        },
      },
      required: [
        '_id',
        'anyRequired',
        'arrayRequired',
        'binaryRequired',
        'booleanRequired',
        'constantRequired',
        'dateRequired',
        'decimalRequired',
        'enumRequired',
        'numberRequired',
        'objectGenericRequired',
        'objectIdRequired',
        'objectRequired',
        'oneOfRequired',
        'stringRequired',
        'createdAt',
        'updatedAt',
      ],
      type: 'object',
    });

    /* eslint-disable */
    expectType<{
      _id: ObjectId;
      anyOptional?: any;
      // This `any` can not be required in TS
      anyRequired?: any;
      arrayOptional?: number[];
      arrayRequired: number[];
      arrayOfObjects?: {
        foo?: number;
      }[];
      binaryOptional?: Binary;
      binaryRequired: Binary;
      booleanOptional?: boolean;
      booleanRequired: boolean;
      constantOptional?: TEST_ENUM.FOO;
      constantRequired: TEST_ENUM.FOO;
      dateOptional?: Date;
      dateRequired: Date;
      decimalOptional?: Decimal128;
      decimalRequired: Decimal128;
      enumOptional?: TEST_ENUM | null;
      enumRequired: TEST_ENUM;
      numberOptional?: number;
      numberRequired: number;
      objectGenericOptional?: { [key: string]: number | undefined };
      objectGenericRequired: { [key: string]: number | undefined };
      objectIdOptional?: ObjectId;
      objectIdRequired: ObjectId;
      objectOptional?: { foo?: number };
      objectRequired: { foo?: number };
      oneOfOptional?: number | string;
      oneOfRequired: number | string;
      stringOptional?: string;
      stringRequired: string;
      createdAt: Date;
      updatedAt: Date;
    }>(value[0]);
    /* eslint-enable */
    expectType<{
      defaults: { stringOptional: string };
      timestamps: boolean;
      validationAction: typeof VALIDATION_ACTIONS.WARN;
      validationLevel: typeof VALIDATION_LEVEL.MODERATE;
    }>(value[1]);
    expectType<ObjectId>(value[0]?._id);
  });

  test('explicit optional - simple', () => {
    const value = schema({
      bar: types.number({ required: true }),
      foo: types.boolean({ required: false }),
    });

    expect(value).toEqual({
      $validationAction: 'error',
      $validationLevel: 'strict',
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        bar: {
          type: 'number',
        },
        foo: {
          type: 'boolean',
        },
      },
      required: ['_id', 'bar'],
      type: 'object',
    });

    expectType<
      [
        {
          _id: ObjectId;
          foo?: boolean;
          bar: number;
        },
        // eslint-disable-next-line @typescript-eslint/ban-types
        {}
      ]
    >(value);
    expectType<ObjectId>(value[0]?._id);
    expectType<boolean | undefined>(value[0]?.foo);
    expectType<typeof value[0]>({
      _id: new ObjectId(),
      bar: 123,
      foo: true,
    });
    expectType<typeof value[0]>({
      _id: new ObjectId(),
      bar: 123,
    });
  });

  test('explicit optional - full', () => {
    const value = schema(
      {
        anyOptional: types.any({ required: false }),
        anyRequired: types.any({ required: true }),
        arrayOfObjects: types.array(
          types.object({
            foo: types.number(),
          })
        ),
        arrayOptional: types.array(types.number()),
        arrayRequired: types.array(types.number(), { required: true }),
        binaryOptional: types.binary({ required: false }),
        binaryRequired: types.binary({ required: true }),
        booleanOptional: types.boolean({ required: false }),
        booleanRequired: types.boolean({ required: true }),
        constantOptional: types.constant(TEST_ENUM.FOO as const, { required: false }),
        constantRequired: types.constant(TEST_ENUM.FOO as const, { required: true }),
        dateOptional: types.date({ required: false }),
        dateRequired: types.date({ required: true }),
        enumOptional: types.enum([...Object.values(TEST_ENUM), null]),
        enumRequired: types.enum(Object.values(TEST_ENUM), { required: true }),
        numberOptional: types.number({ required: false }),
        numberRequired: types.number({ required: true }),
        objectGenericOptional: types.objectGeneric(types.number({ required: false })),
        objectGenericRequired: types.objectGeneric(types.number(), 'abc.+', { required: true }),
        objectIdOptional: types.objectId({ required: false }),
        objectIdRequired: types.objectId({ required: true }),
        objectOptional: types.object({
          foo: types.number({ required: false }),
        }),
        objectRequired: types.object(
          {
            foo: types.number({ required: false }),
          },
          { required: true }
        ),
        oneOfOptional: types.oneOf([types.number(), types.string()]),
        oneOfRequired: types.oneOf([types.number(), types.string()], { required: true }),
        stringOptional: types.string({ required: false }),
        stringRequired: types.string({ required: true }),
      },
      {
        defaults: { stringOptional: 'foo' },
        timestamps: true,
        validationAction: VALIDATION_ACTIONS.WARN,
        validationLevel: VALIDATION_LEVEL.MODERATE,
      }
    );

    expect(value).toEqual({
      $defaults: { stringOptional: 'foo' },
      $timestamps: true,
      $validationAction: 'warn',
      $validationLevel: 'moderate',
      additionalProperties: false,
      properties: {
        _id: {
          bsonType: 'objectId',
        },
        anyOptional: {
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
        },
        anyRequired: {
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
        },
        arrayOfObjects: {
          items: {
            additionalProperties: false,
            properties: {
              foo: {
                type: 'number',
              },
            },
            type: 'object',
          },
          type: 'array',
        },
        arrayOptional: {
          items: {
            type: 'number',
          },
          type: 'array',
        },
        arrayRequired: {
          items: {
            type: 'number',
          },
          type: 'array',
        },
        binaryOptional: {
          bsonType: 'binData',
        },
        binaryRequired: {
          bsonType: 'binData',
        },
        booleanOptional: {
          type: 'boolean',
        },
        booleanRequired: {
          type: 'boolean',
        },
        constantOptional: {
          enum: ['foo'],
        },
        constantRequired: {
          enum: ['foo'],
        },
        createdAt: {
          bsonType: 'date',
        },
        dateOptional: {
          bsonType: 'date',
        },
        dateRequired: {
          bsonType: 'date',
        },
        enumOptional: {
          enum: ['foo', 'bar', null],
        },
        enumRequired: {
          enum: ['foo', 'bar'],
        },
        numberOptional: {
          type: 'number',
        },
        numberRequired: {
          type: 'number',
        },
        objectGenericOptional: {
          additionalProperties: false,
          patternProperties: {
            '.+': {
              type: 'number',
            },
          },
          type: 'object',
        },
        objectGenericRequired: {
          additionalProperties: false,
          patternProperties: {
            'abc.+': {
              type: 'number',
            },
          },
          type: 'object',
        },

        objectIdOptional: {
          bsonType: 'objectId',
        },
        objectIdRequired: {
          bsonType: 'objectId',
        },
        objectOptional: {
          additionalProperties: false,
          properties: {
            foo: {
              type: 'number',
            },
          },
          type: 'object',
        },
        objectRequired: {
          additionalProperties: false,
          properties: {
            foo: {
              type: 'number',
            },
          },
          type: 'object',
        },
        oneOfOptional: {
          oneOf: [
            {
              type: 'number',
            },
            {
              type: 'string',
            },
          ],
        },
        oneOfRequired: {
          oneOf: [
            {
              type: 'number',
            },
            {
              type: 'string',
            },
          ],
        },
        stringOptional: {
          type: 'string',
        },
        stringRequired: {
          type: 'string',
        },
        updatedAt: {
          bsonType: 'date',
        },
      },
      required: [
        '_id',
        'anyRequired',
        'arrayRequired',
        'binaryRequired',
        'booleanRequired',
        'constantRequired',
        'dateRequired',
        'enumRequired',
        'numberRequired',
        'objectGenericRequired',
        'objectIdRequired',
        'objectRequired',
        'oneOfRequired',
        'stringRequired',
        'createdAt',
        'updatedAt',
      ],
      type: 'object',
    });

    /* eslint-disable */
    expectType<{
      _id: ObjectId;
      anyOptional?: any;
      // This `any` can not be required in TS
      anyRequired?: any;
      arrayOptional?: number[];
      arrayRequired: number[];
      arrayOfObjects?: {
        foo?: number;
      }[];
      binaryOptional?: Binary;
      binaryRequired: Binary;
      booleanOptional?: boolean;
      booleanRequired: boolean;
      constantOptional?: TEST_ENUM.FOO;
      constantRequired: TEST_ENUM.FOO;
      dateOptional?: Date;
      dateRequired: Date;
      enumOptional?: TEST_ENUM | null;
      enumRequired: TEST_ENUM;
      numberOptional?: number;
      numberRequired: number;
      objectGenericOptional?: { [key: string]: number | undefined };
      objectGenericRequired: { [key: string]: number | undefined };
      objectIdOptional?: ObjectId;
      objectIdRequired: ObjectId;
      objectOptional?: { foo?: number };
      objectRequired: { foo?: number };
      oneOfOptional?: number | string;
      oneOfRequired: number | string;
      stringOptional?: string;
      stringRequired: string;
      createdAt: Date;
      updatedAt: Date;
    }>(value[0]);
    /* eslint-enable */
    expectType<{
      defaults: { stringOptional: string };
      timestamps: boolean;
      validationAction: typeof VALIDATION_ACTIONS.WARN;
      validationLevel: typeof VALIDATION_LEVEL.MODERATE;
    }>(value[1]);
    expectType<ObjectId>(value[0]?._id);
  });
});
