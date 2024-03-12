import { beforeEach, describe, expect, jest, test } from '@jest/globals';
import { Collection, FindCursor, MongoError, ObjectId } from 'mongodb';
import { expectType } from 'ts-expect';
import { Hooks } from '../hooks';
import { abstract, build, Model } from '../model';
import { PaprBulkWriteOperation } from '../mongodbTypes';
import { schema } from '../schema';
import Types from '../types';

describe('model', () => {
  let collection: Collection;

  const DEFAULTS = {
    bar: 123456,
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
      defaults: DEFAULTS,
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
      defaults: DEFAULTS,
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
      defaults: DEFAULTS,
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
      defaults: DEFAULTS,
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
      aggregate: jest.fn().mockReturnValue({
        // @ts-expect-error Ignore mock function
        toArray: jest.fn().mockResolvedValue(docs),
      }),
      // @ts-expect-error Ignore mock function
      bulkWrite: jest.fn().mockResolvedValue({
        result: true,
      }),
      collectionName: 'testcollection',
      // @ts-expect-error Ignore mock function
      distinct: jest.fn().mockResolvedValue(['FOO', 'BAR']),
      // @ts-expect-error Ignore mock function
      find: jest.fn().mockReturnValue({
        // @ts-expect-error Ignore mock function
        toArray: jest.fn().mockResolvedValue(docs),
      }),
      // @ts-expect-error Ignore mock function
      findOne: jest.fn().mockResolvedValue(doc),
      // @ts-expect-error Ignore mock function
      findOneAndDelete: jest.fn().mockResolvedValue(doc),
      // @ts-expect-error Ignore mock function
      findOneAndUpdate: jest.fn().mockResolvedValue(doc),
      // @ts-expect-error Ignore mock function
      insertMany: jest.fn().mockResolvedValue({
        acknowledged: true,
        insertedCount: 2,
        insertedIds: [new ObjectId(), new ObjectId()],
      }),
      // @ts-expect-error Ignore mock function
      insertOne: jest.fn().mockResolvedValue({
        acknowledged: true,
        insertedId: new ObjectId(),
      }),
      // @ts-expect-error Ignore mock function
      updateMany: jest.fn().mockResolvedValue({
        modifiedCount: 1,
        result: {
          n: 1,
          ok: 1,
        },
      }),
      // @ts-expect-error Ignore mock function
      updateOne: jest.fn().mockResolvedValue({
        modifiedCount: 1,
        result: {
          n: 1,
          ok: 1,
        },
      }),
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
      const operations: PaprBulkWriteOperation<SimpleDocument, SimpleOptions>[] = [
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

      expect(collection.bulkWrite).toHaveBeenCalledWith(operations, {
        ignoreUndefined: true,
      });
    });

    test('schema with defaults', async () => {
      const operations: PaprBulkWriteOperation<SimpleDocument, SimpleOptions>[] = [
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

      await simpleModel.bulkWrite(operations);

      expect(collection.bulkWrite).toHaveBeenCalledWith(
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
        { ignoreUndefined: true }
      );
    });

    test('schema with dynamic defaults', async () => {
      jest.useFakeTimers({ now: 123456 });

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

      expect(collection.bulkWrite).toHaveBeenCalledWith(
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
        { ignoreUndefined: true }
      );
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

      expect(collection.bulkWrite).toHaveBeenCalledTimes(1);
      expect(
        (collection.bulkWrite as jest.Mocked<Collection['bulkWrite']>).mock.calls[0][1]
      ).toEqual({
        ignoreUndefined: true,
      });

      const operations = (collection.bulkWrite as jest.Mocked<Collection['bulkWrite']>).mock
        .calls[0][0];

      expect(operations).toHaveLength(10);
      expect(operations).toEqual([
        {
          insertOne: {
            document: {
              bar: 123,
              createdAt: expect.any(Date),
              foo: 'foo',
              updatedAt: expect.any(Date),
            },
          },
        },
        {
          updateOne: {
            filter: { foo: 'foo' },
            update: {
              $currentDate: { updatedAt: true },
              $set: { bar: 123 },
              $setOnInsert: { createdAt: expect.any(Date) },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'foo' },
            update: {
              $currentDate: { updatedAt: true },
              $set: { bar: 123 },
              $setOnInsert: { createdAt: expect.any(Date) },
            },
          },
        },
        {
          replaceOne: {
            filter: { foo: 'foo' },
            replacement: {
              bar: 123,
              createdAt: expect.any(Date),
              foo: 'foo',
              updatedAt: expect.any(Date),
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
              $set: { createdAt: expect.any(Date) },
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
              $setOnInsert: { createdAt: expect.any(Date) },
              $unset: { updatedAt: 1 },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'updatedAt in $set' },
            update: {
              $set: { updatedAt: expect.any(Date) },
              $setOnInsert: { createdAt: expect.any(Date) },
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

      expect(collection.bulkWrite).toHaveBeenCalledTimes(1);
      expect(
        (collection.bulkWrite as jest.Mocked<Collection['bulkWrite']>).mock.calls[0][1]
      ).toEqual({
        ignoreUndefined: true,
      });

      const operations = (collection.bulkWrite as jest.Mocked<Collection['bulkWrite']>).mock
        .calls[0][0];

      expect(operations).toHaveLength(10);
      expect(operations).toEqual([
        {
          insertOne: {
            document: {
              _createdDate: expect.any(Date),
              _updatedDate: expect.any(Date),
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
              $setOnInsert: { _createdDate: expect.any(Date) },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: 'foo' },
            update: {
              $currentDate: { _updatedDate: true },
              $set: { bar: 123 },
              $setOnInsert: { _createdDate: expect.any(Date) },
            },
          },
        },
        {
          replaceOne: {
            filter: { foo: 'foo' },
            replacement: {
              _createdDate: expect.any(Date),
              _updatedDate: expect.any(Date),
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
              $set: { _createdDate: expect.any(Date) },
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
              $setOnInsert: { _createdDate: expect.any(Date) },
              $unset: { _updatedDate: 1 },
            },
          },
        },
        {
          updateMany: {
            filter: { foo: '_updatedDate in $set' },
            update: {
              $set: { _updatedDate: expect.any(Date) },
              $setOnInsert: { _createdDate: expect.any(Date) },
            },
          },
        },
      ]);
    });

    test('with empty operations array', async () => {
      await simpleModel.bulkWrite([]);

      expect(collection.bulkWrite).toHaveBeenCalledTimes(0);
    });
  });

  describe('distinct', () => {
    test('default', async () => {
      const results = await simpleModel.distinct('foo', {});

      expectType<string[]>(results);
      expect(results).toEqual(['FOO', 'BAR']);

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

      expect(result).toBe(doc);
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
      const result = await simpleModel.findOneAndDelete({ foo: 'bar' }, { projection });

      expect(result).toBe(doc);
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

    test('throws error on failure', async () => {
      (
        collection.findOneAndDelete as jest.Mocked<Collection['findOneAndDelete']>
      ).mockRejectedValueOnce(new Error('findOneAndDelete failed'));

      await expect(simpleModel.findOneAndDelete({ foo: 'bar' })).rejects.toThrow(
        'findOneAndDelete failed'
      );
    });
  });

  describe('findOneAndUpdate', () => {
    test('simple schema', async () => {
      const result = await simpleModel.findOneAndUpdate({ foo: 'bar' }, { $set: { bar: 123 } });

      expect(result).toBe(doc);
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

      expect(result).toBe(doc);
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

    test('throws error on failure', async () => {
      (
        collection.findOneAndUpdate as jest.Mocked<Collection['findOneAndUpdate']>
      ).mockRejectedValueOnce(new Error('findOneAndUpdate failed'));

      await expect(
        simpleModel.findOneAndUpdate({ foo: 'bar' }, { $set: { bar: 123 } })
      ).rejects.toThrow('findOneAndUpdate failed');
    });

    test('timestamps schema', async () => {
      const result = await timestampsModel.findOneAndUpdate(
        { foo: 'bar' },
        {
          $set: { bar: 123 },
          $unset: { ham: 1 },
        }
      );

      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
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
        }
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
    });

    test('timestamps schema, without $set', async () => {
      const result = await timestampsModel.findOneAndUpdate(
        { foo: 'bar' },
        {
          $inc: { bar: 1 },
          $unset: { ham: 1 },
        }
      );

      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
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
        }
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
    });

    test('timestamp config schema', async () => {
      const result = await timestampConfigModel.findOneAndUpdate(
        { foo: 'bar' },
        {
          $set: { bar: 123 },
          $unset: { ham: 1 },
        }
      );

      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
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
        }
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
    });

    test('simple schema empty update', async () => {
      const result = await simpleModel.findOneAndUpdate({ foo: 'bar' }, {});

      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
        {
          foo: 'bar',
        },
        {},
        {
          ignoreUndefined: true,
          returnDocument: 'after',
        }
      );

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

        expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
          { foo: 'foo' },
          {
            $set: { foo: 'bar' },
            $setOnInsert: { bar: 123456 },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          }
        );
      });

      test('simple schema, upsert skips defaults that are present in $set', async () => {
        const result = await simpleModel.findOneAndUpdate(
          { foo: 'foo' },
          { $set: { bar: 123 } },
          { upsert: true }
        );

        expectType<SimpleDocument | null>(result);

        expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
          { foo: 'foo' },
          {
            $set: { bar: 123 },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          }
        );
      });

      test('simple schema, skips defaults that are present in $inc', async () => {
        const result = await simpleModel.findOneAndUpdate(
          { foo: 'foo' },
          { $inc: { bar: 1 } },
          { upsert: true }
        );

        expectType<SimpleDocument | null>(result);

        expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
          { foo: 'foo' },
          {
            $inc: { bar: 1 },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          }
        );
      });

      test('simple schema, skips defaults that are present in $unset', async () => {
        const result = await simpleModel.findOneAndUpdate(
          { foo: 'foo' },
          { $unset: { bar: 1 } },
          { upsert: true }
        );

        expectType<SimpleDocument | null>(result);

        expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
          { foo: 'foo' },
          {
            $unset: { bar: 1 },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          }
        );
      });

      test('timestamps schema', async () => {
        const result = await timestampsModel.findOneAndUpdate(
          { foo: 'foo' },
          { $set: { bar: 123 } },
          { upsert: true }
        );

        expectType<SimpleDocument | null>(result);

        if (result) {
          expectType<ObjectId>(result._id);
          expectType<string>(result.foo);
          expectType<number>(result.bar);
          expectType<Date | undefined>(result.ham);
          expectType<Date>(result.createdAt);
          expectType<Date>(result.updatedAt);
        }

        expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
          { foo: 'foo' },
          {
            $currentDate: { updatedAt: true },
            $set: { bar: 123 },
            $setOnInsert: { createdAt: expect.any(Date) },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          }
        );
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

        expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
          { foo: 'foo' },
          {
            $currentDate: {
              ham: true,
              updatedAt: true,
            },
            $setOnInsert: {
              bar: 123456,
              createdAt: expect.any(Date),
            },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          }
        );
      });

      test('timestamp config schema', async () => {
        const result = await timestampConfigModel.findOneAndUpdate(
          { foo: 'foo' },
          { $set: { bar: 123 } },
          { upsert: true }
        );

        expectType<SimpleDocument | null>(result);

        if (result) {
          expectType<ObjectId>(result._id);
          expectType<string>(result.foo);
          expectType<number>(result.bar);
          expectType<Date | undefined>(result.ham);
          expectType<Date>(result._createdDate);
          expectType<Date>(result._updatedDate);
        }

        expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
          { foo: 'foo' },
          {
            $currentDate: { _updatedDate: true },
            $set: { bar: 123 },
            $setOnInsert: { _createdDate: expect.any(Date) },
          },
          {
            ignoreUndefined: true,
            returnDocument: 'after',
            upsert: true,
          }
        );
      });
    });
  });

  describe('hooks', () => {
    let hooks: Hooks;
    let hooksModel: Model<SimpleDocument, SimpleOptions>;

    beforeEach(() => {
      hooks = {
        after: [jest.fn(() => Promise.resolve())],
        before: [
          jest.fn(({ args, collectionName, context, error, methodName }) => {
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

      expect(hooks.before?.[0]).toHaveBeenCalledTimes(1);
      // The context is actually populated in `before` hook calls,
      // but since we're checking it afterwards we need to list it here as the input argument
      expect(hooks.before?.[0]).toHaveBeenCalledWith({
        args: [{ foo: 'bar' }],
        collectionName: 'testcollection',
        context: {
          id: 'mock',
        },
        methodName: 'find',
      });

      expect(hooks.after?.[0]).toHaveBeenCalledTimes(1);
      expect(hooks.after?.[0]).toHaveBeenCalledWith({
        args: [{ foo: 'bar' }],
        collectionName: 'testcollection',
        context: {
          id: 'mock',
        },
        methodName: 'find',
        result: results,
      });
    });

    test('find throws error', async () => {
      const err = new Error('Test');
      (collection.find as jest.Mocked<Collection['find']>).mockReturnValue({
        // @ts-expect-error Ignore mock function
        toArray: jest.fn().mockRejectedValue(err),
      });

      await expect(hooksModel.find({ foo: 'bar' })).rejects.toThrow('Test');

      expect(hooks.before?.[0]).toHaveBeenCalledTimes(1);
      // The context is actually populated in `before` hook calls,
      // but since we're checking it afterwards we need to list it here as the input argument
      expect(hooks.before?.[0]).toHaveBeenCalledWith({
        args: [{ foo: 'bar' }],
        collectionName: 'testcollection',
        context: {
          id: 'mock',
        },
        methodName: 'find',
      });

      expect(hooks.after?.[0]).toHaveBeenCalledTimes(1);
      expect(hooks.after?.[0]).toHaveBeenCalledWith({
        args: [{ foo: 'bar' }],
        collectionName: 'testcollection',
        context: {
          id: 'mock',
        },
        error: err,
        methodName: 'find',
      });
    });
  });

  describe('insertOne', () => {
    test('simple schema', async () => {
      const result = await simpleModel.insertOne({
        bar: 123,
        foo: 'foo',
      });

      expect(collection.insertOne).toHaveBeenCalledWith(
        {
          bar: 123,
          foo: 'foo',
        },
        { ignoreUndefined: true }
      );

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

      expect(collection.insertOne).toHaveBeenCalledWith(
        {
          bar: 123456,
          foo: 'foo',
        },
        { ignoreUndefined: true }
      );

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

      expect(collection.insertOne).toHaveBeenCalledWith(
        {
          bar: 123,
          createdAt: expect.any(Date),
          foo: 'foo',
          updatedAt: expect.any(Date),
        },
        { ignoreUndefined: true }
      );

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

      expect(collection.insertOne).toHaveBeenCalledWith(
        {
          bar: 123,
          createdAt: date,
          foo: 'foo',
          updatedAt: date,
        },
        { ignoreUndefined: true }
      );

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

      expect(collection.insertOne).toHaveBeenCalledWith(
        {
          _createdDate: expect.any(Date),
          _updatedDate: expect.any(Date),
          bar: 123,
          foo: 'foo',
        },
        { ignoreUndefined: true }
      );

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

      expect(collection.insertOne).toHaveBeenCalledWith(
        {
          _createdDate: date,
          _updatedDate: date,
          bar: 123,
          foo: 'foo',
        },
        { ignoreUndefined: true }
      );

      expectType<TimestampConfigDocument>(result);

      expectType<ObjectId>(result._id);
      expectType<string>(result.foo);
      expectType<number>(result.bar);
      expectType<Date | undefined>(result.ham);
      expectType<Date>(result._createdDate);
      expectType<Date>(result._updatedDate);
    });

    test('dynamic defaults schema, inserts defaults', async () => {
      jest.useFakeTimers({ now: 123456 });

      const result = await dynamicDefaultsModel.insertOne({
        foo: 'foo',
      });

      expect(collection.insertOne).toHaveBeenCalledWith(
        {
          bar: 123456,
          foo: 'foo',
        },
        { ignoreUndefined: true }
      );

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
      (collection.insertOne as jest.Mocked<Collection['insertOne']>).mockResolvedValue({
        acknowledged: false,
        insertedId: new ObjectId(),
      });

      await expect(
        simpleModel.insertOne({
          bar: 123,
          foo: 'foo',
        })
      ).rejects.toThrow('insertOne failed');
    });

    test('throws error on failure', async () => {
      (collection.insertOne as jest.Mocked<Collection['insertOne']>).mockRejectedValue(
        new Error('Test error')
      );

      await expect(
        simpleModel.insertOne({
          bar: 123,
          foo: 'foo',
        })
      ).rejects.toThrow('Test error');
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

      expect(collection.insertMany).toHaveBeenCalledWith(
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
        { ignoreUndefined: true }
      );

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

      expect(collection.insertMany).toHaveBeenCalledWith(
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
        { ignoreUndefined: true }
      );

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
      (collection.insertMany as jest.Mocked<Collection['insertMany']>).mockResolvedValue({
        acknowledged: true,
        insertedCount: 3,
        insertedIds: [new ObjectId(), new ObjectId(), new ObjectId()],
      });

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

      expect(collection.insertMany).toHaveBeenCalledWith(
        [
          {
            bar: 123,
            createdAt: expect.any(Date),
            foo: 'foo',
            updatedAt: expect.any(Date),
          },
          {
            bar: 456,
            createdAt: date,
            foo: 'bar',
            updatedAt: expect.any(Date),
          },
          {
            bar: 789,
            createdAt: date,
            foo: 'ham',
            updatedAt: date,
          },
        ],
        { ignoreUndefined: true }
      );

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
      (collection.insertMany as jest.Mocked<Collection['insertMany']>).mockResolvedValue({
        acknowledged: true,
        insertedCount: 3,
        insertedIds: [new ObjectId(), new ObjectId(), new ObjectId()],
      });

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

      expect(collection.insertMany).toHaveBeenCalledWith(
        [
          {
            _createdDate: expect.any(Date),
            _updatedDate: expect.any(Date),
            bar: 123,
            foo: 'foo',
          },
          {
            _createdDate: date,
            _updatedDate: expect.any(Date),
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
        { ignoreUndefined: true }
      );

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
      jest.useFakeTimers({ now: 123456 });

      const result = await dynamicDefaultsModel.insertMany([
        {
          foo: 'foo',
        },
        {
          foo: 'bar',
        },
      ]);

      expect(collection.insertMany).toHaveBeenCalledWith(
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
        { ignoreUndefined: true }
      );

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
      (collection.insertMany as jest.Mocked<Collection['insertMany']>).mockResolvedValue({
        acknowledged: false,
        insertedCount: 0,
        insertedIds: [],
      });

      await expect(
        simpleModel.insertMany([
          {
            bar: 123,
            foo: 'foo',
          },
        ])
      ).rejects.toThrow('insertMany failed');
    });

    test('throws error on failure', async () => {
      (collection.insertMany as jest.Mocked<Collection['insertMany']>).mockRejectedValue(
        new Error('Test error')
      );

      await expect(
        simpleModel.insertMany([
          {
            bar: 123,
            foo: 'foo',
          },
        ])
      ).rejects.toThrow('Test error');
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

      expect(collection.insertOne).toHaveBeenCalledWith(
        {
          bar: 123456,
          foo: 'bar',
        },
        {
          ignoreUndefined: true,
          maxTimeMS: 1000,
        }
      );
    });

    test('find with projection', async () => {
      await maxTimeModel.find({ foo: 'bar' }, { projection: { bar: 1 } });

      expect(collection.find).toHaveBeenCalledWith(
        { foo: 'bar' },
        {
          ignoreUndefined: true,
          maxTimeMS: 1000,
          projection: { bar: 1 },
        }
      );
    });

    test('find error on maxTimeMS', async () => {
      const err = new MongoError('Test error');
      err.code = 50;
      (collection.find as jest.Mocked<Collection['find']>).mockReturnValue({
        // @ts-expect-error Ignore mock function
        toArray: jest.fn().mockRejectedValue(err),
      });

      await expect(simpleModel.find({ foo: 'bar' })).rejects.toThrowError(
        `Query exceeded maxTime: testcollection.find({ foo: 'bar' })`
      );
    });
  });

  describe('updateMany', () => {
    test('simple schema', async () => {
      await simpleModel.updateMany({ foo: 'foo' }, { $set: { bar: 123 } });

      expect(collection.updateMany).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $set: { bar: 123 },
        },
        { ignoreUndefined: true }
      );
    });

    test('simple schema, without $set', async () => {
      await simpleModel.updateMany({ foo: 'foo' }, { $inc: { bar: 123 } });

      expect(collection.updateMany).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $inc: { bar: 123 },
        },
        { ignoreUndefined: true }
      );
    });

    test.todo('simple schema, uses defaults');

    test('timestamps schema', async () => {
      await timestampsModel.updateMany({ foo: 'foo' }, { $set: { bar: 123 } });

      expect(collection.updateMany).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $currentDate: { updatedAt: true },
          $set: { bar: 123 },
        },
        { ignoreUndefined: true }
      );
    });

    test('timestamps schema, without $set', async () => {
      await timestampsModel.updateMany({ foo: 'foo' }, { $inc: { bar: 123 } });

      expect(collection.updateMany).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $currentDate: { updatedAt: true },
          $inc: { bar: 123 },
        },
        { ignoreUndefined: true }
      );
    });

    test('timestamps schema, updatedAt in $set', async () => {
      await timestampsModel.updateMany({ foo: 'foo' }, { $set: { updatedAt: new Date() } });

      expect(collection.updateMany).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $set: { updatedAt: expect.any(Date) },
        },
        { ignoreUndefined: true }
      );
    });

    test('timestamps schema, updatedAt in $unset', async () => {
      await timestampsModel.updateMany({ foo: 'foo' }, { $unset: { updatedAt: 1 } });

      expect(collection.updateMany).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $unset: { updatedAt: 1 },
        },
        { ignoreUndefined: true }
      );
    });

    test('timestamp config schema', async () => {
      await timestampConfigModel.updateMany({ foo: 'foo' }, { $set: { bar: 123 } });

      expect(collection.updateMany).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $currentDate: { _updatedDate: true },
          $set: { bar: 123 },
        },
        { ignoreUndefined: true }
      );
    });
  });

  describe('updateOne', () => {
    test('simple schema', async () => {
      await simpleModel.updateOne({ foo: 'foo' }, { $set: { bar: 123 } });

      expect(collection.updateOne).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $set: { bar: 123 },
        },
        { ignoreUndefined: true }
      );
    });

    test('simple schema, without $set', async () => {
      await simpleModel.updateOne({ foo: 'foo' }, { $inc: { bar: 123 } });

      expect(collection.updateOne).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $inc: { bar: 123 },
        },
        { ignoreUndefined: true }
      );
    });

    test.todo('simple schema, uses defaults');

    test('timestamps schema', async () => {
      await timestampsModel.updateOne({ foo: 'foo' }, { $set: { bar: 123 } });

      expect(collection.updateOne).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $currentDate: { updatedAt: true },
          $set: { bar: 123 },
        },
        { ignoreUndefined: true }
      );
    });

    test('timestamps schema, without $set', async () => {
      await timestampsModel.updateOne({ foo: 'foo' }, { $inc: { bar: 123 } });

      expect(collection.updateOne).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $currentDate: { updatedAt: true },
          $inc: { bar: 123 },
        },
        { ignoreUndefined: true }
      );
    });

    test('timestamps schema, updatedAt in $set', async () => {
      await timestampsModel.updateOne({ foo: 'foo' }, { $set: { updatedAt: new Date() } });

      expect(collection.updateOne).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $set: { updatedAt: expect.any(Date) },
        },
        { ignoreUndefined: true }
      );
    });

    test('timestamps schema, updatedAt in $unset', async () => {
      await timestampsModel.updateOne({ foo: 'foo' }, { $unset: { updatedAt: 1 } });

      expect(collection.updateOne).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $unset: { updatedAt: 1 },
        },
        { ignoreUndefined: true }
      );
    });

    test('timestamp config schema', async () => {
      await timestampConfigModel.updateOne({ foo: 'foo' }, { $set: { bar: 123 } });

      expect(collection.updateOne).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $currentDate: { _updatedDate: true },
          $set: { bar: 123 },
        },
        { ignoreUndefined: true }
      );
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

      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $set: { ham: date },
          $setOnInsert: { bar: 123456 },
        },
        {
          ignoreUndefined: true,
          returnDocument: 'after',
          upsert: true,
        }
      );
    });

    test('dynamic defaults', async () => {
      jest.useFakeTimers({ now: 123456 });

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

      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
        { foo: 'foo' },
        {
          $set: { ham: date },
          $setOnInsert: { bar: 123456 },
        },
        {
          ignoreUndefined: true,
          returnDocument: 'after',
          upsert: true,
        }
      );
    });

    test('with projection', async () => {
      const date = new Date();
      const result = await simpleModel.upsert(
        { foo: 'foo' },
        { $set: { ham: date } },
        { projection }
      );

      expect(result).toBe(doc);
      expectType<{
        _id: ObjectId;
        foo: string;
        ham?: Date;
      }>(result);

      expectType<string>(result.foo);
      // @ts-expect-error `bar` is undefined here
      result.bar;
      expectType<Date | undefined>(result.ham);

      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
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
        }
      );
    });

    test('throws error on failure', async () => {
      (
        collection.findOneAndUpdate as jest.Mocked<Collection['findOneAndUpdate']>
      ).mockRejectedValueOnce(new Error('findOneAndUpdate failed'));

      await expect(simpleModel.upsert({ foo: 'foo' }, { $set: { bar: 123 } })).rejects.toThrow(
        'findOneAndUpdate failed'
      );
    });
  });
});
