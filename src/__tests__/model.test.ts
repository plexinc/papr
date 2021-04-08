import { BulkWriteOperation, Collection, MongoError, ObjectId } from 'mongodb';
import { expectType } from 'ts-expect';
import { Hooks } from '../hooks';
import { abstract, build, Model } from '../model';
import schema from '../schema';
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
    },
    {
      defaults: DEFAULTS,
      timestamps: true,
    }
  );

  type SimpleDocument = typeof simpleSchema[0];
  type TimestampsDocument = typeof timestampsSchema[0];
  let simpleModel: Model<SimpleDocument, typeof DEFAULTS>;
  let timestampsModel: Model<TimestampsDocument, typeof DEFAULTS>;

  let doc: SimpleDocument;
  let docs: SimpleDocument[];

  beforeEach(() => {
    doc = {
      _id: new ObjectId(),
      bar: 123,
      foo: 'foo',
    };
    docs = [doc];

    // @ts-expect-error Ignore mock collection
    collection = {
      aggregate: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(docs),
      }),
      bulkWrite: jest.fn().mockResolvedValue({
        result: true,
      }),
      collectionName: 'testcollection',
      distinct: jest.fn().mockResolvedValue(['FOO', 'BAR']),
      find: jest.fn().mockReturnValue({
        toArray: jest.fn().mockResolvedValue(docs),
      }),
      findOne: jest.fn().mockResolvedValue(doc),
      findOneAndUpdate: jest.fn().mockResolvedValue({
        ok: 1,
        value: doc,
      }),
      insertMany: jest.fn().mockResolvedValue({
        insertedCount: 2,
        ops: [true, true],
        result: {
          n: 2,
          ok: 1,
        },
      }),
      insertOne: jest.fn().mockResolvedValue({
        insertedCount: 1,
        ops: [true],
        result: {
          n: 1,
          ok: 1,
        },
      }),
      updateMany: jest.fn().mockResolvedValue({
        modifiedCount: 1,
        result: {
          n: 1,
          ok: 1,
        },
      }),
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
    build(simpleSchema, simpleModel, collection);

    // @ts-expect-error Ignore abstract assignment
    timestampsModel = abstract(timestampsSchema);
    build(timestampsSchema, timestampsModel, collection);
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
      const operations: BulkWriteOperation<SimpleDocument>[] = [
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
              _id: new ObjectId(),
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
      const operations: BulkWriteOperation<SimpleDocument>[] = [
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
            // @ts-expect-error TODO Fix operation types with defaults
            document: {
              foo: 'foo',
            },
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
        ],
        { ignoreUndefined: true }
      );
    });

    test('timestamps schema', async () => {
      const id = new ObjectId();

      await timestampsModel.bulkWrite([
        {
          insertOne: {
            // @ts-expect-error TODO Fix operation types with timestamps
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
              _id: id,
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
      expect((collection.bulkWrite as jest.Mock).mock.calls[0][1]).toEqual({
        ignoreUndefined: true,
      });

      const operations = (collection.bulkWrite as jest.Mock).mock.calls[0][0];

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
              _id: id,
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

    test('with projection', async () => {
      const results = await simpleModel.find({}, { projection });

      expectType<
        {
          _id: ObjectId;
          foo: string;
          ham?: Date;
        }[]
      >(results);

      if (results.length) {
        expectType<string>(results[0].foo);
        // @ts-expect-error `bar` is undefined here
        results[0].bar;
        expectType<Date | undefined>(results[0].ham);
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
      (collection.findOneAndUpdate as jest.Mock).mockResolvedValue({ ok: 0 });

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
          returnOriginal: false,
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
          returnOriginal: false,
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

    test('simple schema empty update', async () => {
      const result = await simpleModel.findOneAndUpdate({ foo: 'bar' }, {});

      expect(collection.findOneAndUpdate).toHaveBeenCalledWith(
        {
          foo: 'bar',
        },
        {},
        {
          ignoreUndefined: true,
          returnOriginal: false,
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
            returnOriginal: false,
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
            returnOriginal: false,
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
            returnOriginal: false,
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
            returnOriginal: false,
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
            returnOriginal: false,
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
            returnOriginal: false,
            upsert: true,
          }
        );
      });
    });
  });

  describe('hooks', () => {
    let hooks: Hooks;
    let hooksModel: Model<SimpleDocument, typeof DEFAULTS>;

    beforeEach(() => {
      hooks = {
        after: [jest.fn().mockResolvedValue(undefined)],
        before: [
          jest.fn().mockImplementation((_a, _b, _c, context) => {
            context.id = 'mock';
            return Promise.resolve();
          }),
        ],
      };

      // @ts-expect-error Ignore abstract assignment
      hooksModel = abstract(simpleSchema);
      build(simpleSchema, hooksModel, collection, { hooks });
    });

    test('find', async () => {
      const results = await hooksModel.find({ foo: 'bar' });

      expectType<SimpleDocument[]>(results);

      expect(hooks.before?.[0]).toHaveBeenCalledTimes(1);
      // The context is actually populated in `before` hook calls,
      // but since we're checking it afterwards we need to list it here as the input argument
      expect(hooks.before?.[0]).toHaveBeenCalledWith('testcollection', 'find', [{ foo: 'bar' }], {
        id: 'mock',
      });

      expect(hooks.after?.[0]).toHaveBeenCalledTimes(1);
      expect(hooks.after?.[0]).toHaveBeenCalledWith('testcollection', 'find', [{ foo: 'bar' }], {
        id: 'mock',
      });
    });

    test('find throws error', async () => {
      const err = new Error('Test');
      (collection.find as jest.Mock).mockReturnValue({
        toArray: jest.fn().mockRejectedValue(err),
      });

      await expect(hooksModel.find({ foo: 'bar' })).rejects.toThrow('Test');

      expect(hooks.before?.[0]).toHaveBeenCalledTimes(1);
      // The context is actually populated in `before` hook calls,
      // but since we're checking it afterwards we need to list it here as the input argument
      expect(hooks.before?.[0]).toHaveBeenCalledWith('testcollection', 'find', [{ foo: 'bar' }], {
        id: 'mock',
      });

      expect(hooks.after?.[0]).toHaveBeenCalledTimes(1);
      expect(hooks.after?.[0]).toHaveBeenCalledWith(
        'testcollection',
        'find',
        [{ foo: 'bar' }],
        {
          id: 'mock',
        },
        err
      );
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

    test('throws error on failure', async () => {
      (collection.insertOne as jest.Mock).mockResolvedValue({ result: { ok: 0 } });

      await expect(
        simpleModel.insertOne({
          bar: 123,
          foo: 'foo',
        })
      ).rejects.toThrow('insertOne failed');
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
      const result = await timestampsModel.insertMany([
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
            createdAt: expect.any(Date),
            foo: 'foo',
            updatedAt: expect.any(Date),
          },
          {
            bar: 456,
            createdAt: expect.any(Date),
            foo: 'bar',
            updatedAt: expect.any(Date),
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

    test('throws error on failure', async () => {
      (collection.insertMany as jest.Mock).mockResolvedValue({ result: { ok: 0 } });

      await expect(
        simpleModel.insertMany([
          {
            bar: 123,
            foo: 'foo',
          },
        ])
      ).rejects.toThrow('insertMany failed');
    });
  });

  describe('maxTime', () => {
    let maxTimeModel: Model<SimpleDocument, typeof DEFAULTS>;

    beforeEach(() => {
      // @ts-expect-error Ignore abstract assignment
      maxTimeModel = abstract(simpleSchema);
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
      (collection.find as jest.Mock).mockReturnValue({
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
  });

  describe('upsert', () => {
    test('default', async () => {
      const result = await simpleModel.upsert({ foo: 'foo' }, { $set: { bar: 123 } });

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
          $set: { bar: 123 },
        },
        {
          ignoreUndefined: true,
          returnOriginal: false,
          upsert: true,
        }
      );
    });

    test('throws error on failure', async () => {
      (collection.findOneAndUpdate as jest.Mock).mockResolvedValue({ ok: false });

      await expect(simpleModel.upsert({ foo: 'foo' }, { $set: { bar: 123 } })).rejects.toThrow(
        'findOneAndUpdate failed'
      );
    });
  });
});
