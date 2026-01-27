/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { strictEqual } from 'node:assert';
import { after, before, beforeEach, describe, mock, test } from 'node:test';
import { Collection, Db } from 'mongodb';
import { schema } from '../schema.ts';
import types from '../types.ts';
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

  const testSchema1 = schema({
    foo: types.string({ required: true }),
  });

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

  describe('initialize and model', () => {
    // Module mocking in node.js is experimental and the types are not yet available
    let modelMock: any; // MockModuleContext
    let Papr: any;
    let model: any;

    before(async () => {
      modelMock = mock.module('../model', {
        namedExports: {
          abstract: mock.fn(() => ({ _abstract: true })),
          build: mock.fn(() => undefined),
        },
      });
      console.log('modelMock', modelMock);

      Papr = (await import('../index.ts')).default;
      model = await import('../model.ts');
    });

    after(() => {
      modelMock.restore();
    });

    test('initialize with no models registered', async (t) => {
      const papr = new Papr();

      papr.initialize(db);

      strictEqual(model.build.mock.callCount(), 0);
    });

    test('define model without db', async () => {
      const papr = new Papr();

      papr.model('testcollection', testSchema1);

      strictEqual(model.build.mock.callCount(), 0);
    });

    test('register model and initialize afterwards', () => {
      const options = { maxTime: 1000 };
      const papr = new Papr(options);

      papr.model(COLLECTION, testSchema1);
      papr.initialize(db);

      expectToBeCalledOnceWith(model.build, [
        testSchema1,
        { _abstract: true },
        collection,
        options,
      ]);
    });
  });
});
