import { afterEach, beforeEach, describe, expect, jest, test } from '@jest/globals';
import { Collection, Db } from 'mongodb';
import Papr from '../index';
import * as model from '../model';
import schema from '../schema';
import types from '../types';
import { VALIDATION_ACTIONS, VALIDATION_LEVEL } from '../utils';

describe('index', () => {
  let db: Db;
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
    jest.resetAllMocks();

    // @ts-expect-error Ignore mock collection
    collection = {
      collectionName: COLLECTION,
    };

    db = {
      // @ts-expect-error Ignore mocked function type
      collection: jest.fn().mockReturnValue(collection),
      // @ts-expect-error Ignore mocked function type
      collections: jest.fn().mockResolvedValue([]),
      // @ts-expect-error Ignore mocked function type
      command: jest.fn(),
      // @ts-expect-error Ignore mocked function type
      createCollection: jest.fn().mockReturnValue(collection),
    };
  });

  describe('initialize and model', () => {
    beforeEach(() => {
      jest.spyOn(model, 'build').mockReturnValue(undefined);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    test('initialize with no models registered', () => {
      const papr = new Papr();

      papr.initialize(db);

      expect(model.build).not.toHaveBeenCalled();
    });

    test('define model without db', () => {
      jest.spyOn(model, 'build').mockReturnValue(undefined);

      const papr = new Papr();

      papr.model('testcollection', testSchema1);

      expect(model.build).not.toHaveBeenCalled();
    });

    test('register model and initialize afterwards', () => {
      jest.spyOn(model, 'build').mockReturnValue(undefined);

      const options = { maxTime: 1000 };
      const papr = new Papr(options);

      papr.model(COLLECTION, testSchema1);
      papr.initialize(db);

      expect(model.build).toHaveBeenCalledTimes(1);
      expect(model.build).toHaveBeenCalledWith(
        testSchema1,
        expect.any(Object),
        collection,
        options
      );
    });
  });

  describe('updateSchema', () => {
    test('no db', async () => {
      const papr = new Papr();

      const testModel = papr.model(COLLECTION, testSchema1);

      return expect(papr.updateSchema(testModel)).rejects.toThrow('DB');
    });

    test('no collection on model', async () => {
      const papr = new Papr();

      const testModel = papr.model(COLLECTION, testSchema1);

      papr.db = db;

      return expect(papr.updateSchema(testModel)).rejects.toThrow('collection');
    });

    test('new collection', async () => {
      const papr = new Papr();

      const testModel = papr.model(COLLECTION, testSchema1);
      papr.initialize(db);

      await papr.updateSchema(testModel);

      expect(db.createCollection).toHaveBeenCalledWith(COLLECTION, {
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
      });
    });

    test('existing collection', async () => {
      (db.collections as jest.Mocked<Db['collections']>).mockResolvedValue([collection]);

      const papr = new Papr();

      const testModel = papr.model(COLLECTION, testSchema2);
      papr.initialize(db);

      await papr.updateSchema(testModel);

      expect(db.command).toHaveBeenCalledWith({
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
      });
    });
  });

  test('updateSchemas', async () => {
    (db.collection as jest.Mocked<Db['collection']>)
      .mockReturnValueOnce(collection)
      // @ts-expect-error Ignore collection type
      .mockReturnValueOnce({ collectionName: COLLECTION_OTHER });

    const papr = new Papr();

    papr.model(COLLECTION, testSchema1);
    papr.model(COLLECTION_OTHER, testSchema2);
    papr.initialize(db);

    await papr.updateSchemas();

    expect(db.createCollection).toHaveBeenCalledWith(COLLECTION, {
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
    });
    expect(db.createCollection).toHaveBeenCalledWith(COLLECTION_OTHER, {
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
    });
  });
});
