import { describe, expect, test } from '@jest/globals';
import { ObjectId, Binary } from 'mongodb';
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
        __v: {
          type: 'number',
        },
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
        __v: {
          type: 'number',
        },
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
          foo: boolean;
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

  test('with timestamps', () => {
    const value = schema(
      {
        foo: types.boolean(),
      },
      {
        timestamps: true,
      }
    );

    expect(value).toEqual({
      $validationAction: 'error',
      $validationLevel: 'strict',
      additionalProperties: false,
      properties: {
        __v: {
          type: 'number',
        },
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
        {}
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
        __v: {
          type: 'number',
        },
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
        __v: {
          type: 'number',
        },
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
        dateOptional: types.date(),
        dateRequired: types.date({ required: true }),
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
      $validationAction: 'warn',
      $validationLevel: 'moderate',
      additionalProperties: false,
      properties: {
        __v: {
          type: 'number',
        },
        _id: {
          bsonType: 'objectId',
        },
        anyOptional: {
          bsonType: [
            'array',
            'binData',
            'bool',
            'date',
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
        'dateRequired',
        'enumRequired',
        'numberRequired',
        'objectGenericRequired',
        'objectIdRequired',
        'objectRequired',
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
      stringOptional?: string;
      stringRequired: string;
      createdAt: Date;
      updatedAt: Date;
    }>(value[0]);
    /* eslint-enable */
    expectType<{
      stringOptional: string;
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
        __v: {
          type: 'number',
        },
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
      $validationAction: 'warn',
      $validationLevel: 'moderate',
      additionalProperties: false,
      properties: {
        __v: {
          type: 'number',
        },
        _id: {
          bsonType: 'objectId',
        },
        anyOptional: {
          bsonType: [
            'array',
            'binData',
            'bool',
            'date',
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
        'dateRequired',
        'enumRequired',
        'numberRequired',
        'objectGenericRequired',
        'objectIdRequired',
        'objectRequired',
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
      stringOptional?: string;
      stringRequired: string;
      createdAt: Date;
      updatedAt: Date;
    }>(value[0]);
    /* eslint-enable */
    expectType<{
      stringOptional: string;
    }>(value[1]);
    expectType<ObjectId>(value[0]?._id);
  });
});
