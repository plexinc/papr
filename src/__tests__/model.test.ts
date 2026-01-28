import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { afterEach, beforeEach, describe, mock, test } from 'node:test';

import { Collection, FindCursor, MongoError, ObjectId } from 'mongodb';
import { expectType } from 'ts-expect';

import { abstract, build } from '../model.ts';
import { schema } from '../schema.ts';
import Types from '../types.ts';

import { expectToBeCalledOnceWith } from './assert.ts';

import type { Mock } from 'node:test';

import type { Hooks } from '../hooks.ts';
import type { Model } from '../model.ts';
import type { PaprBulkWriteOperation } from '../mongodbTypes.ts';

const MOCK_DATE = new Date(1234567890000);

describe('model', () => {
  let collection: Omit<
    Collection,
    | 'aggregate'
    | 'bulkWrite'
    | 'distinct'
    | 'find'
    | 'findOneAndDelete'
    | 'findOneAndUpdate'
    | 'insertMany'
    | 'insertOne'
    | 'updateMany'
    | 'updateOne'
  > & {
    aggregate: Mock<Collection['aggregate']>;
    bulkWrite: Mock<Collection['bulkWrite']>;
    distinct: Mock<Collection['distinct']>;
    find: Mock<Collection['find']>;
    findOneAndDelete: Mock<Collection['findOneAndDelete']>;
    findOneAndUpdate: Mock<Collection['findOneAndUpdate']>;
    insertOne: Mock<Collection['insertOne']>;
    insertMany: Mock<Collection['insertMany']>;
    updateMany: Mock<Collection['updateMany']>;
    updateOne: Mock<Collection['updateOne']>;
  };

  const projection = {
    foo: 1,
    ham: 1,
  };

  const simpleSchema = schema(
    {
      bar: Types.number({ required: true }),
      foo: Types.string({ required: true }),
      ham: Types.date(),
      nested: Types.object({
        direct: Types.string({ required: true }),
        other: Types.number(),
      }),
    },
    {
      defaults: {
        bar: 123456,
      },
    }
  );

  const timestampsSchema = schema(
    {
      bar: Types.number({ required: true }),
      foo: Types.string({ required: true }),
      ham: Types.date(),
      nested: Types.object({
        direct: Types.string({ required: true }),
        other: Types.number(),
      }),
    },
    {
      defaults: {
        bar: 123456,
      },
      timestamps: true,
    }
  );

  const timestampConfigSchema = schema(
    {
      bar: Types.number({ required: true }),
      foo: Types.string({ required: true }),
      ham: Types.date(),
      nested: Types.object({
        direct: Types.string({ required: true }),
        other: Types.number(),
      }),
    },
    {
      defaults: {
        bar: 123456,
      },
      timestamps: {
        createdAt: '_createdDate' as const,
        updatedAt: '_updatedDate' as const,
      },
    }
  );

  const numericIdSchema = schema(
    {
      _id: Types.number({ required: true }),
      bar: Types.number({ required: true }),
      foo: Types.string({ required: true }),
      ham: Types.date(),
      nested: Types.object({
        direct: Types.string({ required: true }),
        other: Types.number(),
      }),
    },
    {
      defaults: {
        bar: 123456,
      },
    }
  );

  const dynamicDefaultsSchema = schema(
    {
      bar: Types.number({ required: true }),
      foo: Types.string({ required: true }),
      ham: Types.date(),
      nested: Types.object({
        direct: Types.string({ required: true }),
        other: Types.number(),
      }),
    },
    {
      defaults: () => ({
        bar: new Date().getTime(),
      }),
    }
  );

  type SimpleDocument = (typeof simpleSchema)[0];
  type SimpleOptions = (typeof simpleSchema)[1];
  type TimestampsDocument = (typeof timestampsSchema)[0];
  type TimestampsOptions = (typeof timestampsSchema)[1];
  type TimestampConfigDocument = (typeof timestampConfigSchema)[0];
  type TimestampConfigOptions = (typeof timestampConfigSchema)[1];
  type NumericIdDocument = (typeof numericIdSchema)[0];
  type NumericIdOptions = (typeof numericIdSchema)[1];
  type DynamicDefaultsDocument = (typeof dynamicDefaultsSchema)[0];
  type DynamicDefaultsOptions = (typeof dynamicDefaultsSchema)[1];

  let simpleModel: Model<SimpleDocument, SimpleOptions>;
  let timestampsModel: Model<TimestampsDocument, TimestampsOptions>;
  let timestampConfigModel: Model<TimestampConfigDocument, TimestampConfigOptions>;
  let numericIdModel: Model<NumericIdDocument, NumericIdOptions>;
  let dynamicDefaultsModel: Model<DynamicDefaultsDocument, DynamicDefaultsOptions>;

  let doc: SimpleDocument;
  let docs: SimpleDocument[];

  beforeEach(() => {
    doc = {
      _id: new ObjectId(),
      bar: 123,
      foo: 'foo',
    };
    docs = [doc];

    collection = {
      // @ts-expect-error Ignore mock function
      aggregate: mock.fn(() => ({
        toArray: mock.fn(() => Promise.resolve(docs)),
      })),
      // @ts-expect-error Ignore mock function
      bulkWrite: mock.fn(() =>
        Promise.resolve({
          result: true,
        })
      ),
      collectionName: 'testcollection',
      distinct: mock.fn(() => Promise.resolve(['FOO', 'BAR'])),
      // @ts-expect-error Ignore mock function
      find: mock.fn(() => ({
        toArray: mock.fn(() => Promise.resolve(docs)),
      })),
      findOne: mock.fn(() => Promise.resolve(doc)),
      // @ts-expect-error Ignore mock function
      findOneAndDelete: mock.fn(() => Promise.resolve(doc)),
      // @ts-expect-error Ignore mock function
      findOneAndUpdate: mock.fn(() => Promise.resolve(doc)),
      insertMany: mock.fn(() =>
        Promise.resolve({
          acknowledged: true,
          insertedCount: 2,
          insertedIds: [new ObjectId(), new ObjectId()],
        })
      ),
      insertOne: mock.fn(() =>
        Promise.resolve({
          acknowledged: true,
          insertedId: new ObjectId(),
        })
      ),
      // @ts-expect-error Ignore mock function
      updateMany: mock.fn(() =>
        Promise.resolve({
          modifiedCount: 1,
          result: {
            n: 1,
            ok: 1,
          },
        })
      ),
      // @ts-expect-error Ignore mock function
      updateOne: mock.fn(() =>
        Promise.resolve({
          modifiedCount: 1,
          result: {
            n: 1,
            ok: 1,
          },
        })
      ),
    };

    // @ts-expect-error Ignore abstract assignment
    simpleModel = abstract(simpleSchema);
    // @ts-expect-error Ignore schema types
    build(simpleSchema, simpleModel, collection);

    // @ts-expect-error Ignore abstract assignment
    timestampsModel = abstract(timestampsSchema);
    // @ts-expect-error Ignore schema types
    build(timestampsSchema, timestampsModel, collection);

    // @ts-expect-error Ignore abstract assignment
    timestampConfigModel = abstract(timestampConfigSchema);
    // @ts-expect-error Ignore schema types
    build(timestampConfigSchema, timestampConfigModel, collection);

    // @ts-expect-error Ignore abstract assignment
    numericIdModel = abstract(numericIdSchema);
    // @ts-expect-error Ignore schema types
    build(numericIdSchema, numericIdModel, collection);

    // @ts-expect-error Ignore abstract assignment
    dynamicDefaultsModel = abstract(dynamicDefaultsSchema);
    // @ts-expect-error Ignore schema types
    build(dynamicDefaultsSchema, dynamicDefaultsModel, collection);

    mock.timers.enable({
      apis: ['Date'],
      now: 1234567890000,
    });
  });

  afterEach(() => {
    mock.timers.reset();
  });

  describe('aggregate', () => {
    test('default', async () => {
      const results = await simpleModel.aggregate([]);

      expectType<SimpleDocument[]>(results);

      if (results.length) {
        expectType<string>(results[0].foo);
        expectType<number>(results[0].bar);
        expectType<Date | undefined>(results[0].ham);
      }
    });

    test('with custom result type', async () => {
      const results = await simpleModel.aggregate<TimestampsDocument>([]);

      expectType<TimestampsDocument[]>(results);

      if (results.length) {
        expectType<string>(results[0].foo);
        expectType<number>(results[0].bar);
        expectType<Date | undefined>(results[0].ham);
        expectType<Date>(results[0].createdAt);
        expectType<Date>(results[0].updatedAt);
      }
    });
  });

  describe('bulkWrite', () => {
    test('simple schema', async () => {
      const operations: readonly PaprBulkWriteOperation<SimpleDocument, SimpleOptions>[] = [
        {
          insertOne: {
            document: {
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          updateOne: {
            filter: { foo: 'foo' },
            update: {
              $set: { bar: 123 },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'foo' },
            update: {
              $set: { bar: 123 },
            },
          },
        },
        {
          replaceOne: {
            filter: { foo: 'foo' },
            replacement: {
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          deleteOne: {
            filter: { foo: 'foo' },
          },
        },
        {
          deleteMany: {
            filter: { foo: 'foo' },
          },
        },
      ];

      await simpleModel.bulkWrite(operations);

      // @ts-expect-error `operations` type is more restricted in Papr
      expectToBeCalledOnceWith(collection.bulkWrite, [operations, { ignoreUndefined: true }]);
    });

    test('simple schema with inline operations', async () => {
      await simpleModel.bulkWrite([
        {
          insertOne: {
            document: {
              bar: 123,
              foo: 'foo',
            },
          },
        },
      ]);

      expectToBeCalledOnceWith(collection.bulkWrite, [
        [
          {
            insertOne: {
              document: {
                bar: 123,
                foo: 'foo',
              },
            },
          },
        ],
        {
          ignoreUndefined: true,
        },
      ]);
    });

    test('simple schema with readonly operations', async () => {
      const operations = [
        {
          insertOne: {
            document: {
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          updateOne: {
            filter: { foo: 'foo' },
            update: {
              $set: { bar: 123 },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'foo' },
            update: {
              $set: { bar: 123 },
            },
          },
        },
        {
          replaceOne: {
            filter: { foo: 'foo' },
            replacement: {
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          deleteOne: {
            filter: { foo: 'foo' },
          },
        },
        {
          deleteMany: {
            filter: { foo: 'foo' },
          },
        },
      ] as const;

      expectType<readonly PaprBulkWriteOperation<SimpleDocument, SimpleOptions>[]>(operations);

      await simpleModel.bulkWrite(operations);

      expectToBeCalledOnceWith(collection.bulkWrite, [
        operations,
        {
          ignoreUndefined: true,
        },
      ]);
    });

    test('schema with defaults', async () => {
      const operations = [
        {
          insertOne: {
            document: {
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          insertOne: {
            document: {
              foo: 'foo',
            },
          },
        },
        {
          updateOne: {
            filter: {},
            update: {
              $set: {
                bar: 123,
                foo: 'foo',
              },
            },
          },
        },
        {
          updateOne: {
            filter: {},
            update: {
              $set: {
                foo: 'foo',
              },
            },
          },
        },
        {
          updateOne: {
            filter: {},
            update: {
              $set: {
                bar: 123,
                foo: 'foo',
              },
            },
            upsert: true,
          },
        },
        {
          updateOne: {
            filter: {},
            update: {
              $inc: {
                bar: 123,
              },
              $set: {
                foo: 'foo',
              },
            },
            upsert: true,
          },
        },
        {
          updateOne: {
            filter: {},
            update: {
              $set: {
                foo: 'foo',
              },
            },
            upsert: true,
          },
        },
      ] as const;

      expectType<readonly PaprBulkWriteOperation<SimpleDocument, SimpleOptions>[]>(operations);

      await simpleModel.bulkWrite(operations);

      expectToBeCalledOnceWith(collection.bulkWrite, [
        [
          {
            insertOne: {
              document: {
                bar: 123,
                foo: 'foo',
              },
            },
          },
          {
            insertOne: {
              document: {
                bar: 123456,
                foo: 'foo',
              },
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  bar: 123,
                  foo: 'foo',
                },
              },
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  foo: 'foo',
                },
              },
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  bar: 123,
                  foo: 'foo',
                },
                $setOnInsert: {},
              },
              upsert: true,
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $inc: {
                  bar: 123,
                },
                $set: {
                  foo: 'foo',
                },
                $setOnInsert: {},
              },
              upsert: true,
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  foo: 'foo',
                },
                $setOnInsert: {
                  bar: 123456,
                },
              },
              upsert: true,
            },
          },
        ],
        { ignoreUndefined: true },
      ]);
    });

    test('schema with dynamic defaults', async () => {
      const operations: PaprBulkWriteOperation<DynamicDefaultsDocument, DynamicDefaultsOptions>[] =
        [
          {
            insertOne: {
              document: {
                bar: 123,
                foo: 'foo',
              },
            },
          },
          {
            insertOne: {
              document: {
                foo: 'foo',
              },
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  bar: 123,
                  foo: 'foo',
                },
              },
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  foo: 'foo',
                },
              },
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  bar: 123,
                  foo: 'foo',
                },
              },
              upsert: true,
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $inc: {
                  bar: 123,
                },
                $set: {
                  foo: 'foo',
                },
              },
              upsert: true,
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  foo: 'foo',
                },
              },
              upsert: true,
            },
          },
        ];

      await dynamicDefaultsModel.bulkWrite(operations);

      expectToBeCalledOnceWith(collection.bulkWrite, [
        [
          {
            insertOne: {
              document: {
                bar: 123,
                foo: 'foo',
              },
            },
          },
          {
            insertOne: {
              document: {
                bar: 1234567890000,
                foo: 'foo',
              },
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  bar: 123,
                  foo: 'foo',
                },
              },
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  foo: 'foo',
                },
              },
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  bar: 123,
                  foo: 'foo',
                },
                $setOnInsert: {},
              },
              upsert: true,
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $inc: {
                  bar: 123,
                },
                $set: {
                  foo: 'foo',
                },
                $setOnInsert: {},
              },
              upsert: true,
            },
          },
          {
            updateOne: {
              filter: {},
              update: {
                $set: {
                  foo: 'foo',
                },
                $setOnInsert: {
                  bar: 1234567890000,
                },
              },
              upsert: true,
            },
          },
        ],
        { ignoreUndefined: true },
      ]);
    });

    test('timestamps schema', async () => {
      await timestampsModel.bulkWrite([
        {
          insertOne: {
            document: {
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          updateOne: {
            filter: { foo: 'foo' },
            update: {
              $set: { bar: 123 },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'foo' },
            update: {
              $set: { bar: 123 },
            },
          },
        },
        {
          replaceOne: {
            filter: { foo: 'foo' },
            // @ts-expect-error TODO Fix operation types with timestamps
            replacement: {
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          deleteOne: {
            filter: { foo: 'foo' },
          },
        },
        {
          deleteMany: {
            filter: { foo: 'foo' },
          },
        },
        {
          updateOne: {
            filter: { foo: 'createdAt in $set' },
            update: {
              $set: { createdAt: new Date() },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'createdAt in $unset' },
            update: {
              $unset: { createdAt: 1 },
            },
          },
        },
        {
          updateOne: {
            filter: { foo: 'updatedAt in $unset' },
            update: {
              $unset: { updatedAt: 1 },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'updatedAt in $set' },
            update: {
              $set: { updatedAt: new Date() },
            },
          },
        },
      ]);

      strictEqual(collection.bulkWrite.mock.callCount(), 1);
      deepStrictEqual(collection.bulkWrite.mock.calls[0].arguments[1], { ignoreUndefined: true });

      const [operations] = collection.bulkWrite.mock.calls[0].arguments;

      strictEqual(operations.length, 10);
      deepStrictEqual(operations, [
        {
          insertOne: {
            document: {
              bar: 123,
              createdAt: MOCK_DATE,
              foo: 'foo',
              updatedAt: MOCK_DATE,
            },
          },
        },
        {
          updateOne: {
            filter: { foo: 'foo' },
            update: {
              $currentDate: { updatedAt: true },
              $set: { bar: 123 },
              $setOnInsert: { createdAt: MOCK_DATE },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'foo' },
            update: {
              $currentDate: { updatedAt: true },
              $set: { bar: 123 },
              $setOnInsert: { createdAt: MOCK_DATE },
            },
          },
        },
        {
          replaceOne: {
            filter: { foo: 'foo' },
            replacement: {
              bar: 123,
              createdAt: MOCK_DATE,
              foo: 'foo',
              updatedAt: MOCK_DATE,
            },
          },
        },
        {
          deleteOne: {
            filter: { foo: 'foo' },
          },
        },
        {
          deleteMany: {
            filter: { foo: 'foo' },
          },
        },
        {
          updateOne: {
            filter: { foo: 'createdAt in $set' },
            update: {
              $currentDate: { updatedAt: true },
              $set: { createdAt: MOCK_DATE },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'createdAt in $unset' },
            update: {
              $currentDate: { updatedAt: true },
              $unset: { createdAt: 1 },
            },
          },
        },
        {
          updateOne: {
            filter: { foo: 'updatedAt in $unset' },
            update: {
              $setOnInsert: { createdAt: MOCK_DATE },
              $unset: { updatedAt: 1 },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'updatedAt in $set' },
            update: {
              $set: { updatedAt: MOCK_DATE },
              $setOnInsert: { createdAt: MOCK_DATE },
            },
          },
        },
      ]);
    });

    test('timestamp config schema', async () => {
      await timestampConfigModel.bulkWrite([
        {
          insertOne: {
            document: {
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          updateOne: {
            filter: { foo: 'foo' },
            update: {
              $set: { bar: 123 },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'foo' },
            update: {
              $set: { bar: 123 },
            },
          },
        },
        {
          replaceOne: {
            filter: { foo: 'foo' },
            // @ts-expect-error TODO Fix operation types with timestamps
            replacement: {
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          deleteOne: {
            filter: { foo: 'foo' },
          },
        },
        {
          deleteMany: {
            filter: { foo: 'foo' },
          },
        },
        {
          updateOne: {
            filter: { foo: '_createdDate in $set' },
            update: {
              $set: { _createdDate: new Date() },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: '_createdDate in $unset' },
            update: {
              $unset: { _createdDate: 1 },
            },
          },
        },
        {
          updateOne: {
            filter: { foo: '_updatedDate in $unset' },
            update: {
              $unset: { _updatedDate: 1 },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: '_updatedDate in $set' },
            update: {
              $set: { _updatedDate: new Date() },
            },
          },
        },
      ]);

      strictEqual(collection.bulkWrite.mock.callCount(), 1);
      deepStrictEqual(collection.bulkWrite.mock.calls[0].arguments[1], { ignoreUndefined: true });

      const [operations] = collection.bulkWrite.mock.calls[0].arguments;

      strictEqual(operations.length, 10);
      deepStrictEqual(operations, [
        {
          insertOne: {
            document: {
              _createdDate: MOCK_DATE,
              _updatedDate: MOCK_DATE,
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          updateOne: {
            filter: { foo: 'foo' },
            update: {
              $currentDate: { _updatedDate: true },
              $set: { bar: 123 },
              $setOnInsert: { _createdDate: MOCK_DATE },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'foo' },
            update: {
              $currentDate: { _updatedDate: true },
              $set: { bar: 123 },
              $setOnInsert: { _createdDate: MOCK_DATE },
            },
          },
        },
        {
          replaceOne: {
            filter: { foo: 'foo' },
            replacement: {
              _createdDate: MOCK_DATE,
              _updatedDate: MOCK_DATE,
              bar: 123,
              foo: 'foo',
            },
          },
        },
        {
          deleteOne: {
            filter: { foo: 'foo' },
          },
        },
        {
          deleteMany: {
            filter: { foo: 'foo' },
          },
        },
        {
          updateOne: {
            filter: { foo: '_createdDate in $set' },
            update: {
              $currentDate: { _updatedDate: true },
              $set: { _createdDate: MOCK_DATE },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: '_createdDate in $unset' },
            update: {
              $currentDate: { _updatedDate: true },
              $unset: { _createdDate: 1 },
            },
          },
        },
        {
          updateOne: {
            filter: { foo: '_updatedDate in $unset' },
            update: {
              $setOnInsert: { _createdDate: MOCK_DATE },
              $unset: { _updatedDate: 1 },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: '_updatedDate in $set' },
            update: {
              $set: { _updatedDate: MOCK_DATE },
              $setOnInsert: { _createdDate: MOCK_DATE },
            },
          },
        },
      ]);
    });

    test('with empty operations array', async () => {
      await simpleModel.bulkWrite([]);

      strictEqual(collection.bulkWrite.mock.calls.length, 0);
    });
  });

  describe('distinct', () => {
    test('default', async () => {
      const results = await simpleModel.distinct('foo', {});

      expectType<string[]>(results);
      deepStrictEqual(results, ['FOO', 'BAR']);

      if (results.length) {
        expectType<string>(results[0]);
      }
    });
  });

  describe('exists', () => {
    test('default', async () => {
      const result = await simpleModel.exists({ bar: 123 });
      expectType<boolean>(result);
    });
  });

  describe('find', () => {
    test('default', async () => {
      const results = await simpleModel.find({});

      expectType<SimpleDocument[]>(results);

      if (results.length) {
        expectType<string>(results[0].foo);
        expectType<number>(results[0].bar);
        expectType<Date | undefined>(results[0].ham);
      }
    });

    test('with timestamp config', async () => {
      const results = await timestampConfigModel.find({});

      expectType<TimestampConfigDocument[]>(results);

      if (results.length) {
        expectType<string>(results[0].foo);
        expectType<number>(results[0].bar);
        expectType<Date>(results[0]._createdDate);
        expectType<Date>(results[0]._updatedDate);
        expectType<Date | undefined>(results[0].ham);
      }
    });

    test('with projection', async () => {
      const results = await simpleModel.find(
        {},
        {
          projection: {
            ...projection,
            'nested.direct': 1,
          },
        }
      );

      expectType<
        {
          _id: ObjectId;
          foo: string;
          ham?: Date;
          nested?: {
            direct: string;
          };
        }[]
      >(results);

      if (results.length) {
        expectType<string>(results[0].foo);
        // @ts-expect-error `bar` is undefined here
        results[0].bar;
        expectType<Date | undefined>(results[0].ham);
        expectType<string | undefined>(results[0].nested?.direct);
        // @ts-expect-error `nested.other` is undefined here
        results[0].nested?.other;
      }
    });

    test('with projection, re-assignable to Pick type', async () => {
      let results = await simpleModel.find({}, { projection });

      type Projected = Pick<SimpleDocument, '_id' | 'foo' | 'ham'>;

      function testProjected(input: Projected[]): Projected[] {
        return input;
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      results = testProjected(results);
    });
  });

  describe('findCursor', () => {
    test('default', async () => {
      const cursor = await simpleModel.findCursor({});

      expectType<FindCursor<SimpleDocument>>(cursor);
    });

    test('with projection', async () => {
      const cursor = await simpleModel.findCursor(
        {},
        {
          projection: {
            ...projection,
            'nested.direct': 1,
          },
        }
      );

      expectType<
        FindCursor<{
          _id: ObjectId;
          foo: string;
          ham?: Date;
          nested?: {
            direct: string;
          };
        }>
      >(cursor);
    });
  });

  describe('findById', () => {
    test('default', async () => {
      const result = await simpleModel.findById('123456789012345678901234');

      expectType<SimpleDocument | null>(result);

      if (result) {
        expectType<string>(result.foo);
        expectType<number>(result.bar);
        expectType<Date | undefined>(result.ham);
      }
    });

    test('with projection', async () => {
      const result = await simpleModel.findById(new ObjectId(), { projection });

      expectType<{
        _id: ObjectId;
        foo: string;
        ham?: Date;
      } | null>(result);

      if (result) {
        expectType<string>(result.foo);
        // @ts-expect-error `bar` is undefined here
        result.bar;
        expectType<Date | undefined>(result.ham);
      }
    });

    test('with a numeric _id', async () => {
      const result = await numericIdModel.findById(1, { projection });

      expectType<{
        _id: number;
        foo: string;
        ham?: Date;
      } | null>(result);
    });
  });

  describe('findOne', () => {
    test('default', async () => {
      const result = await simpleModel.findOne({});

      expectType<SimpleDocument | null>(result);

      if (result) {
        expectType<string>(result.foo);
        expectType<number>(result.bar);
        expectType<Date | undefined>(result.ham);
      }
    });

    test('with projection', async () => {
      const result = await simpleModel.findOne({}, { projection });

      expectType<{
        _id: ObjectId;
        foo: string;
        ham?: Date;
      } | null>(result);

      if (result) {
        expectType<string>(result.foo);
        // @ts-expect-error `bar` is undefined here
        result.bar;
        expectType<Date | undefined>(result.ham);
      }
    });
  });

  describe('findOneAndDelete', () => {
    test('simple schema', async () => {
      const result = await simpleModel.findOneAndDelete({ foo: 'bar' });

      expectType<SimpleDocument | null>(result);

      if (result) {
        expectType<string>(result.foo);
        expectType<number>(result.bar);
        expectType<Date | undefined>(result.ham);
        // @ts-expect-error `createdAt` is undefined here
        result.createdAt;
        // @ts-expect-error `updatedAt` is undefined here
        result.updatedAt;
      }

      deepStrictEqual(result, doc);
    });

    test('with projection', async () => {
      const result = await simpleModel.findOneAndDelete({ foo: 'bar' }, { projection });

      expectType<{
        _id: ObjectId;
        foo: string;
        ham?: Date;
      } | null>(result);

      if (result) {
        expectType<string>(result.foo);
        // @ts-expect-error `bar` is undefined here
        result.bar;
        expectType<Date | undefined>(result.ham);
      }

      deepStrictEqual(result, doc);
    });

    test('throws error on failure', async () => {
      collection.findOneAndDelete = mock.fn(() => {
        throw new Error('findOneAndDelete failed');
      });

      await rejects(simpleModel.findOneAndDelete({ foo: 'bar' }), /findOneAndDelete failed/);
    });
  });

  describe('findOneAndUpdate', () => {
    test('simple schema', async () => {
      const result = await simpleModel.findOneAndUpdate({ foo: 'bar' }, { $set: { bar: 123 } });

      deepStrictEqual(result, doc);
      expectType<SimpleDocument | null>(result);

      if (result) {
        expectType<string>(result.foo);
        expectType<number>(result.bar);
        expectType<Date | undefined>(result.ham);
        // @ts-expect-error `createdAt` is undefined here
        result.createdAt;
        // @ts-expect-error `updatedAt` is undefined here
        result.updatedAt;
      }
    });

    test('with projection', async () => {
      const result = await simpleModel.findOneAndUpdate(
        { foo: 'bar' },
        { $set: { bar: 123 } },
        { projection }
      );

      expectType<{
        _id: ObjectId;
        foo: string;
        ham?: Date;
      } | null>(result);
      if (result) {
        expectType<string>(result.foo);
        // @ts-expect-error `bar` is undefined here
        result.bar;
        expectType<Date | undefined>(result.ham);
      }

      deepStrictEqual(result, doc);
    });

    test('throws error on failure', async () => {
      collection.findOneAndUpdate = mock.fn(() => {
        throw new Error('findOneAndUpdate failed');
      });

      await rejects(
        simpleModel.findOneAndUpdate({ foo: 'bar' }, { $set: { bar: 123 } }),
        /findOneAndUpdate failed/
      );
    });

    test('timestamps schema', async () => {
      const result = await timestampsModel.findOneAndUpdate(
        { foo: 'bar' },
        {
          $set: { bar: 123 },
          $unset: { ham: 1 },
        }
      );

      // @ts-expect-error Args are not inferred correctly here
      expectToBeCalledOnceWith(collection.findOneAndUpdate, [
        {
          foo: 'bar',
        },
        {
          $currentDate: { updatedAt: true },
          $set: { bar: 123 },
          $unset: { ham: 1 },
        },
        {
          ignoreUndefined: true,
          returnDocument: 'after',
        },
      ]);

      expectType<TimestampsDocument | null>(result);

      if (result) {
        expectType<ObjectId>(result._id);
        expectType<string>(result.foo);
        expectType<number>(result.bar);
        expectType<Date | undefined>(result.ham);
        expectType<Date>(result.createdAt);
        expectType<Date>(result.updatedAt);
      }
    });

    test('timestamps schema, without $set', async () => {
      const result = await timestampsModel.findOneAndUpdate(
        { foo: 'bar' },
        {
          $inc: { bar: 1 },
          $unset: { ham: 1 },
        }
      );

      // @ts-expect-error Args are not inferred correctly here
      expectToBeCalledOnceWith(collection.findOneAndUpdate, [
        {
          foo: 'bar',
        },
        {
          $currentDate: { updatedAt: true },
          $inc: { bar: 1 },
          $unset: { ham: 1 },
        },
        {
          ignoreUndefined: true,
          returnDocument: 'after',
        },
      ]);

      expectType<TimestampsDocument | null>(result);

      if (result) {
        expectType<ObjectId>(result._id);
        expectType<string>(result.foo);
        expectType<number>(result.bar);
        expectType<Date | undefined>(result.ham);
        expectType<Date>(result.createdAt);
        expectType<Date>(result.updatedAt);
      }
    });

    test('timestamp config schema', async () => {
      const result = await timestampConfigModel.findOneAndUpdate(
        { foo: 'bar' },
        {
          $set: { bar: 123 },
          $unset: { ham: 1 },
        }
      );

      // @ts-expect-error Args are not inferred correctly here
      expectToBeCalledOnceWith(collection.findOneAndUpdate, [
        {
          foo: 'bar',
        },
        {
          $currentDate: { _updatedDate: true },
          $set: { bar: 123 },
          $unset: { ham: 1 },
        },
        {
          ignoreUndefined: true,
          returnDocument: 'after',
        },
      ]);

      expectType<TimestampConfigDocument | null>(result);

      if (result) {
        expectType<ObjectId>(result._id);
        expectType<string>(result.foo);
        expectType<number>(result.bar);
        expectType<Date | undefined>(result.ham);
        expectType<Date>(result._createdDate);
        expectType<Date>(result._updatedDate);
      }
    });

    test('simple schema empty update', async () => {
      const result = await simpleModel.findOneAndUpdate({ foo: 'bar' }, {});

      // @ts-expect-error Args are not inferred correctly here
      expectToBeCalledOnceWith(collection.findOneAndUpdate, [
        {
          foo: 'bar',
        },
        {},
        {
          ignoreUndefined: true,
          returnDocument: 'after',
        },
      ]);

      expectType<SimpleDocument | null>(result);

      if (result) {
        expectType<ObjectId>(result._id);
        expectType<string>(result.foo);
        expectType<number>(result.bar);
        expectType<Date | undefined>(result.ham);
      }
    });

    describe('upsert: true', () => {
      test('simple schema, uses defaults on insert', async () => {
        const result = await simpleModel.findOneAndUpdate(
          { foo: 'foo' },
          { $set: { foo: 'bar' } },
          { upsert: true }
        );

        expectType<SimpleDocument | null>(result);

        // @ts-expect-error Args are not inferred correctly here
        expectToBeCalledOnceWith(collection.findOneAndUpdate, [
          { foo: 'foo' },
          {
            $set: { foo: 'bar' },
            $setOnInsert: { bar: 123456 },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          },
        ]);
      });

      test('simple schema, upsert skips defaults that are present in $set', async () => {
        const result = await simpleModel.findOneAndUpdate(
          { foo: 'foo' },
          { $set: { bar: 123 } },
          { upsert: true }
        );

        expectType<SimpleDocument | null>(result);

        // @ts-expect-error Args are not inferred correctly here
        expectToBeCalledOnceWith(collection.findOneAndUpdate, [
          { foo: 'foo' },
          {
            $set: { bar: 123 },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          },
        ]);
      });

      test('simple schema, skips defaults that are present in $inc', async () => {
        const result = await simpleModel.findOneAndUpdate(
          { foo: 'foo' },
          { $inc: { bar: 1 } },
          { upsert: true }
        );

        expectType<SimpleDocument | null>(result);

        // @ts-expect-error Args are not inferred correctly here
        expectToBeCalledOnceWith(collection.findOneAndUpdate, [
          { foo: 'foo' },
          {
            $inc: { bar: 1 },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          },
        ]);
      });

      test('simple schema, skips defaults that are present in $unset', async () => {
        const result = await simpleModel.findOneAndUpdate(
          { foo: 'foo' },
          { $unset: { bar: 1 } },
          { upsert: true }
        );

        expectType<SimpleDocument | null>(result);

        // @ts-expect-error Args are not inferred correctly here
        expectToBeCalledOnceWith(collection.findOneAndUpdate, [
          { foo: 'foo' },
          {
            $unset: { bar: 1 },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          },
        ]);
      });

      test('timestamps schema', async () => {
        const result = await timestampsModel.findOneAndUpdate(
          { foo: 'foo' },
          { $set: { bar: 123 } },
          { upsert: true }
        );

        expectType<TimestampsDocument | null>(result);

        if (result) {
          expectType<ObjectId>(result._id);
          expectType<string>(result.foo);
          expectType<number>(result.bar);
          expectType<Date | undefined>(result.ham);
          expectType<Date>(result.createdAt);
          expectType<Date>(result.updatedAt);
        }

        // @ts-expect-error Args are not inferred correctly here
        expectToBeCalledOnceWith(collection.findOneAndUpdate, [
          { foo: 'foo' },
          {
            $currentDate: { updatedAt: true },
            $set: { bar: 123 },
            $setOnInsert: { createdAt: MOCK_DATE },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          },
        ]);
      });

      test('timestamps schema, without $set', async () => {
        const result = await timestampsModel.findOneAndUpdate(
          { foo: 'foo' },
          { $currentDate: { ham: true } },
          { upsert: true }
        );

        expectType<TimestampsDocument | null>(result);

        if (result) {
          expectType<ObjectId>(result._id);
          expectType<string>(result.foo);
          expectType<number>(result.bar);
          expectType<Date | undefined>(result.ham);
          expectType<Date>(result.createdAt);
          expectType<Date>(result.updatedAt);
        }

        // @ts-expect-error Args are not inferred correctly here
        expectToBeCalledOnceWith(collection.findOneAndUpdate, [
          { foo: 'foo' },
          {
            $currentDate: {
              ham: true,
              updatedAt: true,
            },
            $setOnInsert: {
              bar: 123456,
              createdAt: MOCK_DATE,
            },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          },
        ]);
      });

      test('timestamp config schema', async () => {
        const result = await timestampConfigModel.findOneAndUpdate(
          { foo: 'foo' },
          { $set: { bar: 123 } },
          { upsert: true }
        );

        expectType<TimestampConfigDocument | null>(result);

        if (result) {
          expectType<ObjectId>(result._id);
          expectType<string>(result.foo);
          expectType<number>(result.bar);
          expectType<Date | undefined>(result.ham);
          expectType<Date>(result._createdDate);
          expectType<Date>(result._updatedDate);
        }

        // @ts-expect-error Args are not inferred correctly here
        expectToBeCalledOnceWith(collection.findOneAndUpdate, [
          { foo: 'foo' },
          {
            $currentDate: { _updatedDate: true },
            $set: { bar: 123 },
            $setOnInsert: { _createdDate: MOCK_DATE },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          },
        ]);
      });
    });
  });

  describe('hooks', () => {
    let hooks: Hooks;
    let hooksModel: Model<SimpleDocument, SimpleOptions>;

    beforeEach(() => {
      hooks = {
        after: [mock.fn(() => Promise.resolve())],
        before: [
          mock.fn(({ args, collectionName, context, error, methodName }) => {
            // @ts-expect-error Ignore mock type
            context.id = 'mock';
            return Promise.resolve();
          }),
        ],
      };

      // @ts-expect-error Ignore abstract assignment
      hooksModel = abstract(simpleSchema);
      // @ts-expect-error Ignore schema types
      build(simpleSchema, hooksModel, collection, { hooks });
    });

    test('find', async () => {
      const results = await hooksModel.find({ foo: 'bar' });

      expectType<SimpleDocument[]>(results);

      // The context is actually populated in `before` hook calls,
      // but since we're checking it afterwards we need to list it here as the input argument
      // @ts-expect-error Ignore type mismatch between Hook & Mock
      expectToBeCalledOnceWith(hooks.before?.[0], [
        {
          args: [{ foo: 'bar' }],
          collectionName: 'testcollection',
          context: {
            id: 'mock',
          },
          methodName: 'find',
        },
      ]);

      // @ts-expect-error Ignore type mismatch between Hook & Mock
      expectToBeCalledOnceWith(hooks.after?.[0], [
        {
          args: [{ foo: 'bar' }],
          collectionName: 'testcollection',
          context: {
            id: 'mock',
          },
          methodName: 'find',
          result: results,
        },
      ]);
    });

    test('find throws error', async () => {
      const err = new Error('Test');
      // @ts-expect-error Ignore mock function
      collection.find = mock.fn(() => ({
        toArray: mock.fn(() => {
          throw err;
        }),
      }));

      await rejects(hooksModel.find({ foo: 'bar' }), /Test/);

      // The context is actually populated in `before` hook calls,
      // but since we're checking it afterwards we need to list it here as the input argument
      // @ts-expect-error Ignore type mismatch between Hook & Mock
      expectToBeCalledOnceWith(hooks.before?.[0], [
        {
          args: [{ foo: 'bar' }],
          collectionName: 'testcollection',
          context: {
            id: 'mock',
          },
          methodName: 'find',
        },
      ]);

      // @ts-expect-error Ignore type mismatch between Hook & Mock
      expectToBeCalledOnceWith(hooks.after?.[0], [
        {
          args: [{ foo: 'bar' }],
          collectionName: 'testcollection',
          context: {
            id: 'mock',
          },
          error: err,
          methodName: 'find',
        },
      ]);
    });
  });

  describe('insertOne', () => {
    test('simple schema', async () => {
      const result = await simpleModel.insertOne({
        bar: 123,
        foo: 'foo',
      });

      expectToBeCalledOnceWith(collection.insertOne, [
        {
          bar: 123,
          foo: 'foo',
        },
        { ignoreUndefined: true },
      ]);

      expectType<SimpleDocument>(result);

      expectType<ObjectId>(result._id);
      expectType<string>(result.foo);
      expectType<number>(result.bar);
      expectType<Date | undefined>(result.ham);
      // @ts-expect-error `createdAt` is undefined here
      result.createdAt;
      // @ts-expect-error `updatedAt` is undefined here
      result.updatedAt;
    });

    test('simple schema, inserts defaults', async () => {
      const result = await simpleModel.insertOne({
        foo: 'foo',
      });

      expectToBeCalledOnceWith(collection.insertOne, [
        {
          bar: 123456,
          foo: 'foo',
        },
        { ignoreUndefined: true },
      ]);

      expectType<SimpleDocument>(result);

      expectType<ObjectId>(result._id);
      expectType<string>(result.foo);
      expectType<number>(result.bar);
      expectType<Date | undefined>(result.ham);
      // @ts-expect-error `createdAt` is undefined here
      result.createdAt;
      // @ts-expect-error `updatedAt` is undefined here
      result.updatedAt;
    });

    test('simple schema, missing required fields', async () => {
      // @ts-expect-error Ignore missing required fields
      await simpleModel.insertOne({});
    });

    test('simple schema, including fields missing from schema', async () => {
      // @ts-expect-error Ignore included fields missing from schema
      await simpleModel.insertOne({ createdAt: new Date() });
    });

    test('timestamps schema', async () => {
      const result = await timestampsModel.insertOne({
        bar: 123,
        foo: 'foo',
      });

      expectToBeCalledOnceWith(collection.insertOne, [
        {
          bar: 123,
          createdAt: MOCK_DATE,
          foo: 'foo',
          updatedAt: MOCK_DATE,
        },
        { ignoreUndefined: true },
      ]);

      expectType<TimestampsDocument>(result);

      expectType<ObjectId>(result._id);
      expectType<string>(result.foo);
      expectType<number>(result.bar);
      expectType<Date | undefined>(result.ham);
      expectType<Date>(result.createdAt);
      expectType<Date>(result.updatedAt);
    });

    test('timestamps schema with custom dates', async () => {
      const date = new Date('2020-01-01T12:00:00');

      const result = await timestampsModel.insertOne({
        bar: 123,
        createdAt: date,
        foo: 'foo',
        updatedAt: date,
      });

      expectToBeCalledOnceWith(collection.insertOne, [
        {
          bar: 123,
          createdAt: date,
          foo: 'foo',
          updatedAt: date,
        },
        { ignoreUndefined: true },
      ]);

      expectType<TimestampsDocument>(result);

      expectType<ObjectId>(result._id);
      expectType<string>(result.foo);
      expectType<number>(result.bar);
      expectType<Date | undefined>(result.ham);
      expectType<Date>(result.createdAt);
      expectType<Date>(result.updatedAt);
    });

    test('timestamp config schema', async () => {
      const result = await timestampConfigModel.insertOne({
        bar: 123,
        foo: 'foo',
      });

      expectToBeCalledOnceWith(collection.insertOne, [
        {
          _createdDate: MOCK_DATE,
          _updatedDate: MOCK_DATE,
          bar: 123,
          foo: 'foo',
        },
        { ignoreUndefined: true },
      ]);

      expectType<TimestampConfigDocument>(result);

      expectType<ObjectId>(result._id);
      expectType<string>(result.foo);
      expectType<number>(result.bar);
      expectType<Date | undefined>(result.ham);
      expectType<Date>(result._createdDate);
      expectType<Date>(result._updatedDate);
    });

    test('timestamp config schema with custom dates', async () => {
      const date = new Date('2020-01-01T12:00:00');

      const result = await timestampConfigModel.insertOne({
        _createdDate: date,
        _updatedDate: date,
        bar: 123,
        foo: 'foo',
      });

      expectToBeCalledOnceWith(collection.insertOne, [
        {
          _createdDate: date,
          _updatedDate: date,
          bar: 123,
          foo: 'foo',
        },
        { ignoreUndefined: true },
      ]);

      expectType<TimestampConfigDocument>(result);

      expectType<ObjectId>(result._id);
      expectType<string>(result.foo);
      expectType<number>(result.bar);
      expectType<Date | undefined>(result.ham);
      expectType<Date>(result._createdDate);
      expectType<Date>(result._updatedDate);
    });

    test('dynamic defaults schema, inserts defaults', async () => {
      const result = await dynamicDefaultsModel.insertOne({
        foo: 'foo',
      });

      expectToBeCalledOnceWith(collection.insertOne, [
        {
          bar: 1234567890000,
          foo: 'foo',
        },
        { ignoreUndefined: true },
      ]);

      expectType<DynamicDefaultsDocument>(result);

      expectType<ObjectId>(result._id);
      expectType<string>(result.foo);
      expectType<number>(result.bar);
      expectType<Date | undefined>(result.ham);
      // @ts-expect-error `createdAt` is undefined here
      result.createdAt;
      // @ts-expect-error `updatedAt` is undefined here
      result.updatedAt;
    });

    test('throws error on not acknowledged result', async () => {
      collection.insertOne = mock.fn(() =>
        Promise.resolve({
          acknowledged: false,
          insertedId: new ObjectId(),
        })
      );

      await rejects(
        simpleModel.insertOne({
          bar: 123,
          foo: 'foo',
        }),
        /insertOne failed/
      );
    });

    test('throws error on failure', async () => {
      collection.insertOne = mock.fn(() => Promise.reject(new Error('Test error')));

      await rejects(
        simpleModel.insertOne({
          bar: 123,
          foo: 'foo',
        }),
        /Test error/
      );
    });
  });

  describe('insertMany', () => {
    test('simple schema', async () => {
      const result = await simpleModel.insertMany([
        {
          bar: 123,
          foo: 'foo',
        },
        {
          bar: 456,
          foo: 'bar',
        },
      ]);

      expectToBeCalledOnceWith(collection.insertMany, [
        [
          {
            bar: 123,
            foo: 'foo',
          },
          {
            bar: 456,
            foo: 'bar',
          },
        ],
        { ignoreUndefined: true },
      ]);

      expectType<SimpleDocument[]>(result);

      for (const item of result) {
        expectType<ObjectId>(item._id);
        expectType<string>(item.foo);
        expectType<number>(item.bar);
        expectType<Date | undefined>(item.ham);
        // @ts-expect-error `createdAt` is undefined here
        item.createdAt;
        // @ts-expect-error `updatedAt` is undefined here
        item.updatedAt;
      }
    });

    test('simple schema, inserts defaults', async () => {
      const result = await simpleModel.insertMany([
        {
          foo: 'foo',
        },
        {
          foo: 'bar',
        },
      ]);

      expectToBeCalledOnceWith(collection.insertMany, [
        [
          {
            bar: 123456,
            foo: 'foo',
          },
          {
            bar: 123456,
            foo: 'bar',
          },
        ],
        { ignoreUndefined: true },
      ]);

      expectType<SimpleDocument[]>(result);

      for (const item of result) {
        expectType<ObjectId>(item._id);
        expectType<string>(item.foo);
        expectType<number>(item.bar);
        expectType<Date | undefined>(item.ham);
        // @ts-expect-error `createdAt` is undefined here
        item.createdAt;
        // @ts-expect-error `updatedAt` is undefined here
        item.updatedAt;
      }
    });

    test('simple schema, missing required fields', async () => {
      // @ts-expect-error Ignore missing required fields
      await simpleModel.insertMany([{}, {}]);
    });

    test('timestamps schema', async () => {
      collection.insertMany = mock.fn(() =>
        Promise.resolve({
          acknowledged: true,
          insertedCount: 3,
          insertedIds: [new ObjectId(), new ObjectId(), new ObjectId()],
        })
      );

      const date = new Date('2020-01-01T12:00:00');
      const result = await timestampsModel.insertMany([
        {
          bar: 123,
          foo: 'foo',
        },
        {
          bar: 456,
          createdAt: date,
          foo: 'bar',
        },
        {
          bar: 789,
          createdAt: date,
          foo: 'ham',
          updatedAt: date,
        },
      ]);

      expectToBeCalledOnceWith(collection.insertMany, [
        [
          {
            bar: 123,
            createdAt: MOCK_DATE,
            foo: 'foo',
            updatedAt: MOCK_DATE,
          },
          {
            bar: 456,
            createdAt: date,
            foo: 'bar',
            updatedAt: MOCK_DATE,
          },
          {
            bar: 789,
            createdAt: date,
            foo: 'ham',
            updatedAt: date,
          },
        ],
        { ignoreUndefined: true },
      ]);

      expectType<TimestampsDocument[]>(result);

      for (const item of result) {
        expectType<ObjectId>(item._id);
        expectType<string>(item.foo);
        expectType<number>(item.bar);
        expectType<Date | undefined>(item.ham);
        expectType<Date>(item.createdAt);
        expectType<Date>(item.updatedAt);
      }
    });

    test('timestamp config schema', async () => {
      collection.insertMany = mock.fn(() =>
        Promise.resolve({
          acknowledged: true,
          insertedCount: 3,
          insertedIds: [new ObjectId(), new ObjectId(), new ObjectId()],
        })
      );

      const date = new Date('2020-01-01T12:00:00');
      const result = await timestampConfigModel.insertMany([
        {
          bar: 123,
          foo: 'foo',
        },
        {
          _createdDate: date,
          bar: 456,
          foo: 'bar',
        },
        {
          _createdDate: date,
          _updatedDate: date,
          bar: 789,
          foo: 'ham',
        },
      ]);

      expectToBeCalledOnceWith(collection.insertMany, [
        [
          {
            _createdDate: MOCK_DATE,
            _updatedDate: MOCK_DATE,
            bar: 123,
            foo: 'foo',
          },
          {
            _createdDate: date,
            _updatedDate: MOCK_DATE,
            bar: 456,
            foo: 'bar',
          },
          {
            _createdDate: date,
            _updatedDate: date,
            bar: 789,
            foo: 'ham',
          },
        ],
        { ignoreUndefined: true },
      ]);

      expectType<TimestampConfigDocument[]>(result);

      for (const item of result) {
        expectType<ObjectId>(item._id);
        expectType<string>(item.foo);
        expectType<number>(item.bar);
        expectType<Date | undefined>(item.ham);
        expectType<Date>(item._createdDate);
        expectType<Date>(item._updatedDate);
      }
    });

    test('dynamic defaults schema, inserts defaults', async () => {
      const result = await dynamicDefaultsModel.insertMany([
        {
          foo: 'foo',
        },
        {
          foo: 'bar',
        },
      ]);

      expectToBeCalledOnceWith(collection.insertMany, [
        [
          {
            bar: 1234567890000,
            foo: 'foo',
          },
          {
            bar: 1234567890000,
            foo: 'bar',
          },
        ],
        { ignoreUndefined: true },
      ]);

      expectType<SimpleDocument[]>(result);

      for (const item of result) {
        expectType<ObjectId>(item._id);
        expectType<string>(item.foo);
        expectType<number>(item.bar);
        expectType<Date | undefined>(item.ham);
        // @ts-expect-error `createdAt` is undefined here
        item.createdAt;
        // @ts-expect-error `updatedAt` is undefined here
        item.updatedAt;
      }
    });

    test('throws error on not acknowledged result', async () => {
      collection.insertMany = mock.fn(() =>
        Promise.resolve({
          acknowledged: false,
          insertedCount: 0,
          insertedIds: [],
        })
      );

      await rejects(
        simpleModel.insertMany([
          {
            bar: 123,
            foo: 'foo',
          },
        ]),
        /insertMany failed/
      );
    });

    test('throws error on failure', async () => {
      collection.insertMany = mock.fn(() => Promise.reject(new Error('Test error')));

      await rejects(
        simpleModel.insertMany([
          {
            bar: 123,
            foo: 'foo',
          },
        ]),
        /Test error/
      );
    });
  });

  describe('maxTime', () => {
    let maxTimeModel: Model<SimpleDocument, SimpleOptions>;

    beforeEach(() => {
      // @ts-expect-error Ignore abstract assignment
      maxTimeModel = abstract(simpleSchema);
      // @ts-expect-error Ignore schema types
      build(simpleSchema, maxTimeModel, collection, { maxTime: 1000 });
    });

    test('insertOne', async () => {
      await maxTimeModel.insertOne({ foo: 'bar' });

      expectToBeCalledOnceWith(collection.insertOne, [
        {
          bar: 123456,
          foo: 'bar',
        },
        {
          ignoreUndefined: true,
          maxTimeMS: 1000,
        },
      ]);
    });

    test('find with projection', async () => {
      await maxTimeModel.find({ foo: 'bar' }, { projection: { bar: 1 } });

      expectToBeCalledOnceWith(collection.find, [
        { foo: 'bar' },
        {
          ignoreUndefined: true,
          maxTimeMS: 1000,
          projection: { bar: 1 },
        },
      ]);
    });

    test('find error on maxTimeMS', async () => {
      const err = new MongoError('Test error');
      err.code = 50;
      // @ts-expect-error Ignore mock function
      collection.find = mock.fn(() => ({
        toArray: mock.fn(() => {
          throw err;
        }),
      }));

      await rejects(
        simpleModel.find({ foo: 'bar' }),
        /Query exceeded maxTime: testcollection.find\({ foo: 'bar' }\)/
      );
    });
  });

  describe('updateMany', () => {
    test('simple schema', async () => {
      await simpleModel.updateMany({ foo: 'foo' }, { $set: { bar: 123 } });

      expectToBeCalledOnceWith(collection.updateMany, [
        { foo: 'foo' },
        {
          $set: { bar: 123 },
        },
        { ignoreUndefined: true },
      ]);
    });

    test('simple schema, without $set', async () => {
      await simpleModel.updateMany({ foo: 'foo' }, { $inc: { bar: 123 } });

      expectToBeCalledOnceWith(collection.updateMany, [
        { foo: 'foo' },
        {
          $inc: { bar: 123 },
        },
        { ignoreUndefined: true },
      ]);
    });

    test.todo('simple schema, uses defaults');

    test('timestamps schema', async () => {
      await timestampsModel.updateMany({ foo: 'foo' }, { $set: { bar: 123 } });

      expectToBeCalledOnceWith(collection.updateMany, [
        { foo: 'foo' },
        {
          $currentDate: { updatedAt: true },
          $set: { bar: 123 },
        },
        { ignoreUndefined: true },
      ]);
    });

    test('timestamps schema, without $set', async () => {
      await timestampsModel.updateMany({ foo: 'foo' }, { $inc: { bar: 123 } });

      expectToBeCalledOnceWith(collection.updateMany, [
        { foo: 'foo' },
        {
          $currentDate: { updatedAt: true },
          $inc: { bar: 123 },
        },
        { ignoreUndefined: true },
      ]);
    });

    test('timestamps schema, updatedAt in $set', async () => {
      await timestampsModel.updateMany(
        { foo: 'foo' },
        {
          $set: { updatedAt: new Date() },
        }
      );

      expectToBeCalledOnceWith(collection.updateMany, [
        { foo: 'foo' },
        {
          $set: { updatedAt: MOCK_DATE },
        },
        { ignoreUndefined: true },
      ]);
    });

    test('timestamps schema, updatedAt in $unset', async () => {
      await timestampsModel.updateMany({ foo: 'foo' }, { $unset: { updatedAt: 1 } });

      expectToBeCalledOnceWith(collection.updateMany, [
        { foo: 'foo' },
        {
          $unset: { updatedAt: 1 },
        },
        { ignoreUndefined: true },
      ]);
    });

    test('timestamp config schema', async () => {
      await timestampConfigModel.updateMany({ foo: 'foo' }, { $set: { bar: 123 } });

      expectToBeCalledOnceWith(collection.updateMany, [
        { foo: 'foo' },
        {
          $currentDate: { _updatedDate: true },
          $set: { bar: 123 },
        },
        { ignoreUndefined: true },
      ]);
    });
  });

  describe('updateOne', () => {
    test('simple schema', async () => {
      await simpleModel.updateOne({ foo: 'foo' }, { $set: { bar: 123 } });

      expectToBeCalledOnceWith(collection.updateOne, [
        { foo: 'foo' },
        {
          $set: { bar: 123 },
        },
        { ignoreUndefined: true },
      ]);
    });

    test('simple schema, without $set', async () => {
      await simpleModel.updateOne({ foo: 'foo' }, { $inc: { bar: 123 } });

      expectToBeCalledOnceWith(collection.updateOne, [
        { foo: 'foo' },
        {
          $inc: { bar: 123 },
        },
        { ignoreUndefined: true },
      ]);
    });

    test.todo('simple schema, uses defaults');

    test('timestamps schema', async () => {
      await timestampsModel.updateOne({ foo: 'foo' }, { $set: { bar: 123 } });

      expectToBeCalledOnceWith(collection.updateOne, [
        { foo: 'foo' },
        {
          $currentDate: { updatedAt: true },
          $set: { bar: 123 },
        },
        { ignoreUndefined: true },
      ]);
    });

    test('timestamps schema, without $set', async () => {
      await timestampsModel.updateOne({ foo: 'foo' }, { $inc: { bar: 123 } });

      expectToBeCalledOnceWith(collection.updateOne, [
        { foo: 'foo' },
        {
          $currentDate: { updatedAt: true },
          $inc: { bar: 123 },
        },
        { ignoreUndefined: true },
      ]);
    });

    test('timestamps schema, updatedAt in $set', async () => {
      await timestampsModel.updateOne(
        { foo: 'foo' },
        {
          $set: { updatedAt: new Date() },
        }
      );

      expectToBeCalledOnceWith(collection.updateOne, [
        { foo: 'foo' },
        {
          $set: { updatedAt: MOCK_DATE },
        },
        { ignoreUndefined: true },
      ]);
    });

    test('timestamps schema, updatedAt in $unset', async () => {
      await timestampsModel.updateOne({ foo: 'foo' }, { $unset: { updatedAt: 1 } });

      expectToBeCalledOnceWith(collection.updateOne, [
        { foo: 'foo' },
        {
          $unset: { updatedAt: 1 },
        },
        { ignoreUndefined: true },
      ]);
    });

    test('timestamp config schema', async () => {
      await timestampConfigModel.updateOne({ foo: 'foo' }, { $set: { bar: 123 } });

      expectToBeCalledOnceWith(collection.updateOne, [
        { foo: 'foo' },
        {
          $currentDate: { _updatedDate: true },
          $set: { bar: 123 },
        },
        { ignoreUndefined: true },
      ]);
    });
  });

  describe('upsert', () => {
    test('static defaults', async () => {
      const date = new Date();
      const result = await simpleModel.upsert({ foo: 'foo' }, { $set: { ham: date } });

      expectType<SimpleDocument>(result);

      expectType<ObjectId>(result._id);
      expectType<string>(result.foo);
      expectType<number>(result.bar);
      expectType<Date | undefined>(result.ham);
      // @ts-expect-error `createdAt` is undefined here
      result.createdAt;
      // @ts-expect-error `updatedAt` is undefined here
      result.updatedAt;

      // @ts-expect-error Args are not inferred correctly here
      expectToBeCalledOnceWith(collection.findOneAndUpdate, [
        { foo: 'foo' },
        {
          $set: { ham: date },
          $setOnInsert: { bar: 123456 },
        },
        {
          ignoreUndefined: true,
          returnDocument: 'after',
          upsert: true,
        },
      ]);
    });

    test('dynamic defaults', async () => {
      const date = new Date();
      const result = await dynamicDefaultsModel.upsert({ foo: 'foo' }, { $set: { ham: date } });

      expectType<SimpleDocument>(result);

      expectType<ObjectId>(result._id);
      expectType<string>(result.foo);
      expectType<number>(result.bar);
      expectType<Date | undefined>(result.ham);
      // @ts-expect-error `createdAt` is undefined here
      result.createdAt;
      // @ts-expect-error `updatedAt` is undefined here
      result.updatedAt;

      // @ts-expect-error Args are not inferred correctly here
      expectToBeCalledOnceWith(collection.findOneAndUpdate, [
        { foo: 'foo' },
        {
          $set: { ham: date },
          $setOnInsert: { bar: 1234567890000 },
        },
        {
          ignoreUndefined: true,
          returnDocument: 'after',
          upsert: true,
        },
      ]);
    });

    test('with projection', async () => {
      const date = new Date();
      const result = await simpleModel.upsert(
        { foo: 'foo' },
        { $set: { ham: date } },
        { projection }
      );

      expectType<{
        _id: ObjectId;
        foo: string;
        ham?: Date;
      }>(result);

      expectType<string>(result.foo);
      // @ts-expect-error `bar` is undefined here
      result.bar;
      expectType<Date | undefined>(result.ham);

      deepStrictEqual(result, doc);

      // @ts-expect-error Args are not inferred correctly here
      expectToBeCalledOnceWith(collection.findOneAndUpdate, [
        { foo: 'foo' },
        {
          $set: { ham: date },
          $setOnInsert: { bar: 123456 },
        },
        {
          ignoreUndefined: true,
          projection,
          returnDocument: 'after',
          upsert: true,
        },
      ]);
    });

    test('throws error on failure', async () => {
      collection.findOneAndUpdate = mock.fn(() => {
        throw new Error('findOneAndUpdate failed');
      });
    });
  });
});
