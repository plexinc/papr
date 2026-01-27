/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { deepStrictEqual, rejects, strictEqual } from 'node:assert';
import { before, beforeEach, describe, mock, test } from 'node:test';
import { Collection, Db } from 'mongodb';
import { schema } from '../schema.ts';
import types from '../types.ts';
import { VALIDATION_ACTIONS, VALIDATION_LEVEL } from '../utils.ts';
import { expectToBeCalledOnceWith } from './assert.ts';

import type { Mock } from 'node:test';

describe('index', () => {
  let db: Omit<Db, 'collection' | 'collections' | 'command' | 'createCollection'> & {
    collection: Mock<Db['collection']>;
    collections: Mock<Db['collections']>;
    command: Mock<Db['command']>;
    createCollection: Mock<Db['createCollection']>;
  };
  let collection: Collection;

  const COLLECTION = 'testcollection';
  const COLLECTION_OTHER = 'testcollection2';
  const DEFAULTS = {
    foo: 'bar',
  };

  const testSchema1 = schema({
    foo: types.string({ required: true }),
  });
  const testSchema2 = schema(
    {
      foo: types.string({ required: true }),
    },
    {
      defaults: DEFAULTS,
      validationAction: VALIDATION_ACTIONS.WARN,
      validationLevel: VALIDATION_LEVEL.MODERATE,
    }
  );

  beforeEach(() => {
    // @ts-expect-error Ignore mock collection
    collection = {
      collectionName: COLLECTION,
    };

    db = {
      // @ts-expect-error Ignore mocked function type
      collection: mock.fn(() => collection),
      // @ts-expect-error Ignore mocked function type
      collections: mock.fn(() => []),
      // @ts-expect-error Ignore mocked function type
      command: mock.fn(() => {}),
      // @ts-expect-error Ignore mocked function type
      createCollection: mock.fn(() => collection),
    };
  });

  describe('updateSchema', () => {
    let Papr: any;

    before(async () => {
      Papr = (await import('../index.ts')).default;
    });

    test('no db', async () => {
      const papr = new Papr();

      const testModel = papr.model(COLLECTION, testSchema1);

      await rejects(papr.updateSchema(testModel), /DB/);
    });

    test('no collection on model', async () => {
      const papr = new Papr();

      const testModel = papr.model(COLLECTION, testSchema1);

      papr.db = db;

      return rejects(papr.updateSchema(testModel), /collection/);
    });

    test.only('new collection', async () => {
      const papr = new Papr();

      const testModel = papr.model(COLLECTION, testSchema1);
      papr.initialize(db);

      await papr.updateSchema(testModel);

      expectToBeCalledOnceWith(db.createCollection, [
        COLLECTION,
        {
          validationAction: 'error',
          validationLevel: 'strict',
          validator: {
            $jsonSchema: {
              additionalProperties: false,
              properties: {
                _id: {
                  bsonType: 'objectId',
                },
                foo: {
                  type: 'string',
                },
              },
              required: ['_id', 'foo'],
              type: 'object',
            },
          },
        },
      ]);
    });

    test('existing collection', async () => {
      db.collections = mock.fn(() => Promise.resolve([collection]));

      const papr = new Papr();

      const testModel = papr.model(COLLECTION, testSchema2);
      papr.initialize(db);

      await papr.updateSchema(testModel);

      expectToBeCalledOnceWith(db.command, [
        {
          collMod: COLLECTION,
          validationAction: 'warn',
          validationLevel: 'moderate',
          validator: {
            $jsonSchema: {
              additionalProperties: false,
              properties: {
                _id: {
                  bsonType: 'objectId',
                },
                foo: {
                  type: 'string',
                },
              },
              required: ['_id', 'foo'],
              type: 'object',
            },
          },
        },
      ]);
    });

    test('updateSchemas', async () => {
      // @ts-expect-error Ignore mock types mismatch
      db.collection = mock.fn(
        mock.fn(() => ({ collectionName: COLLECTION_OTHER })),
        () => collection,
        { times: 1 }
      );

      const papr = new Papr();

      papr.model(COLLECTION, testSchema1);
      papr.model(COLLECTION_OTHER, testSchema2);
      papr.initialize(db);

      await papr.updateSchemas();

      strictEqual(db.createCollection.mock.callCount(), 2);
      deepStrictEqual(db.createCollection.mock.calls[0].arguments, [
        COLLECTION,
        {
          validationAction: 'error',
          validationLevel: 'strict',
          validator: {
            $jsonSchema: {
              additionalProperties: false,
              properties: {
                _id: {
                  bsonType: 'objectId',
                },
                foo: {
                  type: 'string',
                },
              },
              required: ['_id', 'foo'],
              type: 'object',
            },
          },
        },
      ]);
      deepStrictEqual(db.createCollection.mock.calls[1].arguments, [
        COLLECTION_OTHER,
        {
          validationAction: 'warn',
          validationLevel: 'moderate',
          validator: {
            $jsonSchema: {
              additionalProperties: false,
              properties: {
                _id: {
                  bsonType: 'objectId',
                },
                foo: {
                  type: 'string',
                },
              },
              required: ['_id', 'foo'],
              type: 'object',
            },
          },
        },
      ]);
    });
  });
});
