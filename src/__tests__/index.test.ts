import { Collection, Db } from 'mongodb';
import * as model from '../model';
import types from '../types';
import schema from '../schema';
import Papr from '../index';
import { VALIDATION_ACTIONS, VALIDATION_LEVEL } from '../utils';

describe('index', () => {
  let db: Db;
  let collection: Collection;

  const COLLECTION = 'testcollection';
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

    // @ts-expect-error Ignore mock db
    db = {
      collection: jest.fn().mockReturnValue(collection),
      collections: jest.fn().mockResolvedValue([]),
      command: jest.fn(),
      createCollection: jest.fn().mockReturnValue(collection),
    };
  });

  describe('initialize and model', () => {
    beforeEach(() => {
      jest.spyOn(model, 'build').mockImplementation();
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
      jest.spyOn(model, 'build').mockImplementation();

      const papr = new Papr();

      papr.model('testcollection', testSchema1);

      expect(model.build).not.toHaveBeenCalled();
    });

    test('register model and initialize afterwards', () => {
      jest.spyOn(model, 'build').mockImplementation();

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
              __v: {
                type: 'number',
              },
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
      (db.collections as jest.Mock).mockResolvedValue([collection]);

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
              __v: {
                type: 'number',
              },
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
    (db.collection as jest.Mock)
      .mockReturnValueOnce(collection)
      .mockReturnValueOnce({ collectionName: 'testcollection2' });

    const papr = new Papr();

    papr.model(COLLECTION, testSchema1);
    papr.model('testcollection2', testSchema2);
    papr.initialize(db);

    await papr.updateSchemas();

    expect(db.createCollection).toHaveBeenCalledWith(COLLECTION, {
      validationAction: 'error',
      validationLevel: 'strict',
      validator: {
        $jsonSchema: {
          additionalProperties: false,
          properties: {
            __v: {
              type: 'number',
            },
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
    expect(db.createCollection).toHaveBeenCalledWith('testcollection2', {
      validationAction: 'warn',
      validationLevel: 'moderate',
      validator: {
        $jsonSchema: {
          additionalProperties: false,
          properties: {
            __v: {
              type: 'number',
            },
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
