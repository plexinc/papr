import { describe, expect, test } from '@jest/globals';
import {
  Binary,
  BSONSymbol,
  Code,
  DBRef,
  Decimal128,
  Double,
  Int32,
  Long,
  MaxKey,
  MinKey,
  ObjectId,
} from 'mongodb';
import { expectType } from 'ts-expect';
import { PaprFilter, PaprUpdateFilter } from '../mongodbTypes';

describe('mongodb types', () => {
  interface TestDocument {
    _id: ObjectId;
    foo: string;
    bar: number;
    ham?: Date;
    tags: string[];
    numbers: number[];
    list: {
      direct: string;
      other?: number;
    }[];
    nestedObject: {
      deep: {
        deeper: string;
        other?: number;
      };
      direct: boolean;
      level2?: {
        level3: {
          level4: {
            level5: {
              level6ID: string;
              level6: {
                level7ID: string;
              };
            };
          };
        };
      };
      other?: number;
    };
    genericObject: Record<
      string,
      {
        id: number;
      }
    >;
    binary: Binary;
    bsonSymbol: BSONSymbol;
    dbRef: DBRef;
    double: Double;
    code: Code;
    decimal: Decimal128;
    int32: Int32;
    long: Long;
    maxKey: MaxKey;
    minKey: MinKey;
    regexp: RegExp;
  }

  describe('PaprFilter', () => {
    describe('existing top-level keys', () => {
      describe('valid types', () => {
        test('ObjectId', () => {
          const filter = { _id: new ObjectId() } as const;
          expectType<PaprFilter<TestDocument>>(filter);
        });

        test('string', () => {
          const filter = { foo: 'foo' } as const;
          expectType<PaprFilter<TestDocument>>(filter);
        });

        test('string queried by regexp', () => {
          const filter = { foo: /foo/ } as const;
          // string fields can be queried by regexp
          expectType<PaprFilter<TestDocument>>(filter);
        });

        test('number', () => {
          const filter = { bar: 123 } as const;
          expectType<PaprFilter<TestDocument>>(filter);
        });

        test('Date', () => {
          const filter = { ham: new Date() } as const;
          expectType<PaprFilter<TestDocument>>(filter);
        });

        test('array-of-strings queried by exact match', () => {
          // array fields can be queried by exact match
          const filter = { tags: ['foo'] } as const;
          expectType<PaprFilter<TestDocument>>(filter);
        });

        test('array-of-strings queried by string', () => {
          // array fields can be queried by element type
          const filter = { tags: 'foo' } as const;
          expectType<PaprFilter<TestDocument>>(filter);
        });

        test('array-of-strings queried by regexp', () => {
          const filter = { tags: /foo/ } as const;
          expectType<PaprFilter<TestDocument>>(filter);
        });

        test('nested object', () => {
          const filter = {
            nestedObject: {
              deep: { deeper: 'foo' },
              direct: true,
            },
          } as const;
          expectType<PaprFilter<TestDocument>>(filter);
        });

        describe('BSON types', () => {
          // all BSON types can be used as query values
          test('binary', () => {
            const filter = { binary: new Binary([], 2) } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('BSONSymbol', () => {
            const filter = { bsonSymbol: new BSONSymbol('hi') } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('Code', () => {
            const filter = { code: new Code(() => true) } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('Double', () => {
            const filter = { double: new Double(123.45) } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('DBRef', () => {
            const filter = {
              dbRef: new DBRef('collection', new ObjectId()),
            } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('Decimal128', () => {
            const filter = { decimal: new Decimal128('123.45') } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('Int32', () => {
            const filter = { int32: new Int32('123') } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('Long', () => {
            const filter = { long: new Long('123', 45) } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('MaxKey', () => {
            const filter = { maxKey: new MaxKey() } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('MinKey', () => {
            const filter = { minKey: new MinKey() } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('regexp', () => {
            const filter = { regexp: /foo/ } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });
        });
      });

      test('invalid types', () => {
        expect(true).toBeTruthy();

        // @ts-expect-error Type mismatch
        expectType<PaprFilter<TestDocument>>({ _id: '577fa2d90c4cc47e31cf4b6f' });

        // @ts-expect-error Type mismatch
        expectType<PaprFilter<TestDocument>>({ foo: true });
        // @ts-expect-error Type mismatch
        expectType<PaprFilter<TestDocument>>({ foo: ['foo'] });

        // @ts-expect-error Type mismatch
        expectType<PaprFilter<TestDocument>>({ bar: '123' });
        // @ts-expect-error Type mismatch
        expectType<PaprFilter<TestDocument>>({ bar: [123] });

        // @ts-expect-error Type mismatch
        expectType<PaprFilter<TestDocument>>({ ham: 123 });

        // @ts-expect-error Type mismatch
        expectType<PaprFilter<TestDocument>>({ tags: 123 });

        expectType<PaprFilter<TestDocument>>({
          nestedObject: {
            deep: { deeper: 'foo' },
            // @ts-expect-error Type mismatch
            direct: 'foo',
          },
        });
        expectType<PaprFilter<TestDocument>>({
          nestedObject: {
            // @ts-expect-error Type mismatch
            deep: { deeper: 123 },
            direct: true,
          },
        });
      });
    });

    describe('existing nested keys using dot notation', () => {
      describe('valid types', () => {
        describe('nested object', () => {
          test('boolean addressed by name', () => {
            const filter = { 'nestedObject.direct': true } as const;
            // https://www.mongodb.com/docs/manual/tutorial/query-embedded-documents/#query-on-nested-field
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('number addressed by name', () => {
            expectType<PaprFilter<TestDocument>>({ 'nestedObject.other': 123 });
          });

          test('string addressed by nested name', () => {
            expectType<PaprFilter<TestDocument>>({ 'nestedObject.deep.deeper': 'foo' });
          });

          test('number addressed by nested name', () => {
            expectType<PaprFilter<TestDocument>>({ 'nestedObject.deep.other': 123 });
          });

          test('string addressed by deeply-nested name', () => {
            expectType<PaprFilter<TestDocument>>({
              'nestedObject.level2.level3.level4.level5.level6ID': 'foo',
            });
          });
        });

        describe('generic object', () => {
          test('number addressed by arbitrary nested name', () => {
            expectType<PaprFilter<TestDocument>>({ 'genericObject.foo.id': 123 });
            expectType<PaprFilter<TestDocument>>({ 'genericObject.bar.id': 123 });
          });

          test('number addressed by nested object with valid property', () => {
            expectType<PaprFilter<TestDocument>>({ 'genericObject.foo': { id: 123 } });
          });
        });

        test('string addressed by index + property in array-of-objects', () => {
          // https://www.mongodb.com/docs/manual/tutorial/query-array-of-documents/#use-the-array-index-to-query-for-a-field-in-the-embedded-document
          expectType<PaprFilter<TestDocument>>({ 'list.0.direct': 'foo' });
        });

        test('number addressed by index + property in array-of-objects', () => {
          expectType<PaprFilter<TestDocument>>({ 'list.1.other': 123 });
        });

        test('number addressed by large index + property in array-of-objects', () => {
          // it works with some extreme indexes
          expectType<PaprFilter<TestDocument>>({ 'list.4294967295.other': 123 });
        });

        test('number addressed by super-large index + property in array-of-objects', () => {
          expectType<PaprFilter<TestDocument>>({ 'list.9999999999999999999.other': 123 });
        });

        test('string addressed by property in array-of-objects', () => {
          // https://www.mongodb.com/docs/manual/tutorial/query-array-of-documents/#specify-a-query-condition-on-a-field-embedded-in-an-array-of-documents
          expectType<PaprFilter<TestDocument>>({ 'list.direct': 'foo' });
        });

        test('number addressed by property in array-of-objects', () => {
          expectType<PaprFilter<TestDocument>>({ 'list.other': 123 });
        });

        test('string addressed by index in array-of-strings', () => {
          expectType<PaprFilter<TestDocument>>({ 'tags.0': 'foo' });
        });
      });

      describe('invalid types', () => {
        test('number substituted for string at array numeric index', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'tags.0': 123 });
        });

        describe('nested objects', () => {
          test('string substituted for object at nested object property', () => {
            // @ts-expect-error Type mismatch
            expectType<PaprFilter<TestDocument>>({ 'nestedObject.direct': 'foo' });
          });

          test('string substituted for number at shallow nested object property', () => {
            // @ts-expect-error Type mismatch
            expectType<PaprFilter<TestDocument>>({ 'nestedObject.other': 'foo' });
          });

          test('number substituted for string at nested object property', () => {
            // @ts-expect-error Type mismatch
            expectType<PaprFilter<TestDocument>>({ 'nestedObject.deep.deeper': 123 });
          });

          test('string substituted for number at deep nested object property', () => {
            // @ts-expect-error Type mismatch
            expectType<PaprFilter<TestDocument>>({ 'nestedObject.deep.other': 'foo' });
          });

          test('number substituted for object at deeply nested property (level6)', () => {
            const filter = {
              'nestedObject.level2.level3.level4.level5.level6': 123,
            } as const;
            // @ts-expect-error Type mismatch
            expectType<PaprFilter<TestDocument>>(filter);
          });

          test('number substituted for string at deeply nested property (level7) nesting error, not type error', () => {
            const filter = {
              'nestedObject.level2.level3.level4.level5.level6.level7ID': 123,
            } as const;
            expectType<PaprFilter<TestDocument>>(filter);
          });
        });

        describe('generic objects', () => {
          test('string substituted for number on generic object field', () => {
            // @ts-expect-error Type mismatch
            expectType<PaprFilter<TestDocument>>({ 'genericObject.bar.id': '123' });
          });

          test('boolean substituted for number on generic object field', () => {
            // @ts-expect-error Type mismatch
            expectType<PaprFilter<TestDocument>>({ 'genericObject.bar.id': true });
          });
        });

        test('number substituted for required string on array-of-objects', () => {
          // Support for this type-check is not available yet
          // expectType<PaprFilter<TestDocument>>({ 'genericObject.foo': { id: 'foo' } });

          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'list.0.direct': 123 });
        });

        test('string substituted for optional number on array-of-objects', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'list.1.other': 'foo' });
        });
      });
    });

    test('BSON types should not be broken up in nested keys', () => {
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<TestDocument>>({ 'binary.sub_type': 2 });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<TestDocument>>({ 'bsonSymbol.value': 'hi' });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<TestDocument>>({ 'code.code': 'string' });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<TestDocument>>({ 'dbRef.collection': 'collection' });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<TestDocument>>({ 'decimal.bytes.BYTES_PER_ELEMENT': 1 });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<TestDocument>>({ 'maxKey._bsontype': 'MaxKey' });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<TestDocument>>({ 'minKey._bsontype': 'MinKey' });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<TestDocument>>({ 'regexp.dotAll': true });
    });

    test('invalid keys', () => {
      // @ts-expect-error Invalid key
      expectType<PaprFilter<TestDocument>>({ inexistent: 'foo' });

      // @ts-expect-error Invalid key
      expectType<PaprFilter<TestDocument>>({ 'nestedObject.inexistent': 'foo' });
      // @ts-expect-error Invalid key
      expectType<PaprFilter<TestDocument>>({ 'nestedObject.deep.inexistent': 'foo' });
      // @ts-expect-error Invalid key
      expectType<PaprFilter<TestDocument>>({ 'nestedObject.inexistent.deeper': 'foo' });
      expectType<PaprFilter<TestDocument>>({
        // @ts-expect-error Invalid key
        'nestedObject.level2.level3.level4.level5.inexistent': 'foo',
      });

      // @ts-expect-error Invalid key
      expectType<PaprFilter<TestDocument>>({ 'list.0.inexistent': 'foo' });
      // @ts-expect-error Invalid key
      expectType<PaprFilter<TestDocument>>({ 'inexistent.0.other': 'foo' });
    });

    describe('root filter operators', () => {
      test('valid usage', () => {
        expectType<PaprFilter<TestDocument>>({ $and: [{ foo: 'foo' }] });
        expectType<PaprFilter<TestDocument>>({ $and: [{ foo: 'foo' }, { bar: 123 }] });

        expectType<PaprFilter<TestDocument>>({ $or: [{ foo: 'foo' }, { bar: 123 }] });

        expectType<PaprFilter<TestDocument>>({ $nor: [{ foo: 'foo' }] });
      });

      test('invalid usage', () => {
        // @ts-expect-error Type mismatch: should not accept single objects for __$and, $or, $nor operator__ query
        expectType<PaprFilter<TestDocument>>({ $and: { foo: 'foo' } });

        // @ts-expect-error Type mismatch: should not accept __$and, $or, $nor operator__ as non-root query
        expectType<PaprFilter<TestDocument>>({ foo: { $or: ['foo', 'bar'] } });
      });
    });

    describe('filter operators', () => {
      describe('logical filter operators', () => {
        test('valid types on existing top-level keys', () => {
          expect(true).toBeTruthy();

          expectType<PaprFilter<TestDocument>>({ _id: { $in: [new ObjectId()] } });

          expectType<PaprFilter<TestDocument>>({ foo: { $eq: 'foo' } });
          expectType<PaprFilter<TestDocument>>({ foo: { $eq: /foo/ } });
          expectType<PaprFilter<TestDocument>>({ foo: { $not: { $eq: 'foo' } } });
          expectType<PaprFilter<TestDocument>>({ foo: { $not: { $eq: /foo/ } } });

          expectType<PaprFilter<TestDocument>>({ bar: { $gt: 123, $lt: 1000 } });

          expectType<PaprFilter<TestDocument>>({ ham: { $nin: [new Date()] } });

          expectType<PaprFilter<TestDocument>>({ tags: { $in: ['foo', 'bar'] } });
        });

        test('valid types on existing nested keys using dot notation', () => {
          // https://www.mongodb.com/docs/manual/tutorial/query-embedded-documents/#query-on-nested-field
          expectType<PaprFilter<TestDocument>>({ 'nestedObject.direct': { $eq: true } });
          expectType<PaprFilter<TestDocument>>({ 'nestedObject.other': { $lt: 123 } });
          expectType<PaprFilter<TestDocument>>({ 'nestedObject.deep.deeper': { $in: ['foo'] } });
          expectType<PaprFilter<TestDocument>>({ 'nestedObject.deep.other': { $gte: 123 } });
          expectType<PaprFilter<TestDocument>>({
            'nestedObject.level2.level3.level4.level5.level6ID': { $in: ['foo'] },
          });

          expectType<PaprFilter<TestDocument>>({ 'genericObject.foo.id': { $gte: 123 } });
          expectType<PaprFilter<TestDocument>>({ 'genericObject.bar.id': { $in: [123, 456] } });

          // https://www.mongodb.com/docs/manual/tutorial/query-array-of-documents/#use-the-array-index-to-query-for-a-field-in-the-embedded-document
          expectType<PaprFilter<TestDocument>>({ 'list.0.direct': { $ne: 'foo' } });
          expectType<PaprFilter<TestDocument>>({ 'list.1.other': { $ne: 123 } });

          // https://www.mongodb.com/docs/manual/tutorial/query-array-of-documents/#specify-a-query-condition-on-a-field-embedded-in-an-array-of-documents
          expectType<PaprFilter<TestDocument>>({ 'list.direct': { $ne: 'foo' } });
          expectType<PaprFilter<TestDocument>>({ 'list.other': { $ne: 123 } });
        });

        test('invalid types on existing top-level keys', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ _id: { $in: ['foo'] } });
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ foo: { $eq: true } });
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ foo: { $not: 'foo' } });
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ bar: { $gt: 'foo' } });
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ ham: { $nin: [123] } });
        });

        test('invalid types on existing nested keys using dot notation', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'nestedObject.direct': { $eq: 'foo' } });
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'nestedObject.other': { $lt: true } });
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'nestedObject.deep.deeper': { $in: [123] } });
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'nestedObject.deep.other': { $gte: 'foo' } });
          expectType<PaprFilter<TestDocument>>({
            // @ts-expect-error Type mismatch
            'nestedObject.level2.level3.level4.level5.level6ID': { $in: [123] },
          });

          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'genericObject.foo.id': { $eq: 'foo' } });
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'genericObject.bar.id': { $in: ['foo'] } });

          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'list.0.direct': { $ne: 123 } });
          // @ts-expect-error Type mismatch
          expectType<PaprFilter<TestDocument>>({ 'list.1.other': { $ne: 'foo' } });
        });
      });

      describe('element filter operators', () => {
        test('valid types', () => {
          expectType<PaprFilter<TestDocument>>({ foo: { $exists: true } });
          expectType<PaprFilter<TestDocument>>({ foo: { $exists: false } });

          expectType<PaprFilter<TestDocument>>({ 'tags.0': { $exists: true } });
          expectType<PaprFilter<TestDocument>>({ 'list.0': { $exists: true } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch: should not query $exists by wrong values
          expectType<PaprFilter<TestDocument>>({ foo: { $exists: '' } });
          // @ts-expect-error Type mismatch: should not query $exists by wrong values
          expectType<PaprFilter<TestDocument>>({ foo: { $exists: 'true' } });

          // @ts-expect-error Type mismatch: should not query $exists by wrong values
          expectType<PaprFilter<TestDocument>>({ 'tags.0': { $exists: '' } });
          // @ts-expect-error Type mismatch: should not query $exists by wrong values
          expectType<PaprFilter<TestDocument>>({ 'list.0': { $exists: 1 } });
        });
      });

      describe('evaluation filter operators', () => {
        test('valid types', () => {
          expectType<PaprFilter<TestDocument>>({ foo: { $regex: /foo/ } });
          expectType<PaprFilter<TestDocument>>({ foo: { $options: 'i', $regex: /foo/ } });

          expectType<PaprFilter<TestDocument>>({ bar: { $mod: [12, 2] } });

          expectType<PaprFilter<TestDocument>>({ $text: { $search: 'foo' } });

          expectType<PaprFilter<TestDocument>>({ $expr: { $gt: ['$decimal', '$bar'] } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch: should not accept $regex for none string fields
          expectType<PaprFilter<TestDocument>>({ bar: { $regex: /12/ } });

          // @ts-expect-error Type mismatch: should not accept $mod for none number fields
          expectType<PaprFilter<TestDocument>>({ foo: { $mod: [12, 2] } });
          // @ts-expect-error Type mismatch: should not accept $mod with less/more than 2 elements
          expectType<PaprFilter<TestDocument>>({ bar: { $mod: [12] } });
          // @ts-expect-error Type mismatch: should not accept $mod with less/more than 2 elements
          expectType<PaprFilter<TestDocument>>({ bar: { $mod: [] } });

          // @ts-expect-error Type mismatch: should fulltext search only by string
          expectType<PaprFilter<TestDocument>>({ $text: { $search: 123 } });
          // @ts-expect-error Type mismatch: should fulltext search only by string
          expectType<PaprFilter<TestDocument>>({ $text: { $search: /foo/ } });
        });
      });

      describe('array filter operators', () => {
        test('valid types', () => {
          expectType<PaprFilter<TestDocument>>({ tags: { $size: 2 } });

          expectType<PaprFilter<TestDocument>>({ tags: { $all: ['foo', 'bar'] } });

          expectType<PaprFilter<TestDocument>>({ list: { $elemMatch: { direct: 'foo' } } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch: should not query non array fields
          expectType<PaprFilter<TestDocument>>({ foo: { $size: 2 } });

          // @ts-expect-error Type mismatch: should not query non array fields
          expectType<PaprFilter<TestDocument>>({ foo: { $all: ['foo', 'bar'] } });

          // @ts-expect-error Type mismatch: should not query non array fields
          expectType<PaprFilter<TestDocument>>({ foo: { $elemMatch: { direct: 'foo' } } });
        });
      });
    });
  });

  describe('PaprUpdateFilter', () => {
    describe('$currentDate', () => {
      describe('valid types', () => {
        test('object', () => {
          const filter = { $currentDate: { ham: true } } as const;
          expectType<PaprUpdateFilter<TestDocument>>(filter);
        });

        test('object with $type date', () => {
          const filter = { $currentDate: { ham: { $type: 'date' } } } as const;
          expectType<PaprUpdateFilter<TestDocument>>(filter);
        });

        test('object with $type timestamp', () => {
          const filter = {
            $currentDate: { ham: { $type: 'timestamp' } },
          } as const;
          expectType<PaprUpdateFilter<TestDocument>>(filter);
        });
      });

      test('invalid keys', () => {
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $currentDate: { foo: true } });
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $currentDate: { bar: { $type: 'date' } } });
      });
    });

    describe('$inc', () => {
      describe('top-level keys', () => {
        test('valid types', () => {
          expectType<PaprUpdateFilter<TestDocument>>({ $inc: { bar: 123 } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $inc: { bar: 'foo' } });
        });

        // These are not enforces in the `OnlyFieldsOfType` type:
        describe('existing nested keys using dot notation', () => {
          test.todo('valid types');
          test.todo('invalid types');
        });
      });

      test('invalid keys', () => {
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $inc: { foo: 123 } });
      });

      describe('array filters', () => {
        test('valid types', () => {
          expectType<PaprUpdateFilter<TestDocument>>({ $inc: { 'numbers.$': 123 } });
          expectType<PaprUpdateFilter<TestDocument>>({ $inc: { 'numbers.$[bla]': 123 } });
          expectType<PaprUpdateFilter<TestDocument>>({ $inc: { 'numbers.$[]': 123 } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $inc: { 'numbers.$': 'foo' } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $inc: { 'numbers.$[bla]': 'foo' } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $inc: { 'numbers.$[]': 'foo' } });
        });
      });
    });

    describe('$set', () => {
      describe('top-level keys', () => {
        test('valid types', () => {
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { _id: new ObjectId() } });

          expectType<PaprUpdateFilter<TestDocument>>({ $set: { foo: 'foo' } });

          expectType<PaprUpdateFilter<TestDocument>>({ $set: { bar: 123 } });

          expectType<PaprUpdateFilter<TestDocument>>({ $set: { ham: new Date() } });

          expectType<PaprUpdateFilter<TestDocument>>({ $set: { tags: ['foo', 'bar'] } });

          expectType<PaprUpdateFilter<TestDocument>>({
            $set: {
              nestedObject: {
                deep: { deeper: 'foo' },
                direct: true,
              },
            },
          });

          // all BSON types can be used as update values
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { binary: new Binary([], 2) } });
          expectType<PaprUpdateFilter<TestDocument>>({
            $set: { bsonSymbol: new BSONSymbol('hi') },
          });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { code: new Code(() => true) } });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { double: new Double(123.45) } });
          expectType<PaprUpdateFilter<TestDocument>>({
            $set: { dbRef: new DBRef('collection', new ObjectId()) },
          });
          expectType<PaprUpdateFilter<TestDocument>>({
            $set: { decimal: new Decimal128('123.45') },
          });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { int32: new Int32('123') } });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { long: new Long('123', 45) } });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { maxKey: new MaxKey() } });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { minKey: new MinKey() } });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { regexp: /foo/ } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { _id: 'foo' } });

          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { foo: 123 } });

          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { bar: 'foo' } });

          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { ham: 123 } });

          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { tags: 'foo' } });

          expectType<PaprUpdateFilter<TestDocument>>({
            $set: {
              nestedObject: {
                deep: { deeper: 'foo' },
                // @ts-expect-error Type mismatch
                direct: 'foo',
              },
            },
          });
          expectType<PaprUpdateFilter<TestDocument>>({
            $set: {
              nestedObject: {
                // @ts-expect-error Type mismatch
                deep: { deeper: 123 },
                direct: true,
              },
            },
          });
        });
      });

      describe('existing nested keys using dot notation', () => {
        test('valid types', () => {
          expectType<PaprUpdateFilter<TestDocument>>({
            $set: { 'nestedObject.direct': true },
          });
          expectType<PaprUpdateFilter<TestDocument>>({
            $set: { 'nestedObject.other': 123 },
          });

          expectType<PaprUpdateFilter<TestDocument>>({
            $set: { 'nestedObject.deep': { deeper: 'foo' } },
          });
          expectType<PaprUpdateFilter<TestDocument>>({
            $set: { 'nestedObject.deep.deeper': 'foo' },
          });
          expectType<PaprUpdateFilter<TestDocument>>({
            $set: { 'nestedObject.deep.other': 123 },
          });
          expectType<PaprUpdateFilter<TestDocument>>({
            $set: { 'nestedObject.level2.level3.level4.level5.level6ID': 'foo' },
          });

          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'genericObject.foo.id': 123 } });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'genericObject.bar.id': 123 } });

          expectType<PaprUpdateFilter<TestDocument>>({
            $set: { 'genericObject.foo': { id: 123 } },
          });

          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'tags.0': 'foo' } });

          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.0.direct': 'foo' } });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.1.other': 123 } });

          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.direct': 'foo' } });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.other': 123 } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'nestedObject.direct': 'foo' } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'nestedObject.other': 'foo' } });
          expectType<PaprUpdateFilter<TestDocument>>({
            // @ts-expect-error Type mismatch
            $set: { 'nestedObject.deep.deeper': 123 },
          });
          expectType<PaprUpdateFilter<TestDocument>>({
            // @ts-expect-error Type mismatch
            $set: { 'nestedObject.deep.other': 'foo' },
          });
          expectType<PaprUpdateFilter<TestDocument>>({
            // @ts-expect-error Type mismatch
            $set: { 'nestedObject.level2.level3.level4.level5.level6ID': 123 },
          });

          expectType<PaprUpdateFilter<TestDocument>>({
            // @ts-expect-error Type mismatch
            $set: { 'genericObject.foo.id': 'foo' },
          });
          expectType<PaprUpdateFilter<TestDocument>>({
            // @ts-expect-error Type mismatch
            $set: { 'genericObject.bar.id': true },
          });

          // Support for this type-check is not available yet
          // expectType<PaprUpdateFilter<TestDocument>>({
          //   $set: { 'genericObject.foo': { id: 'foo' } },
          // });

          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'tags.0': 123 } });

          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.0.direct': 123 } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.1.other': 'foo' } });
        });
      });

      test('invalid keys', () => {
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $set: { inexistent: 'foo' } });

        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'nestedObject.inexistent': 'foo' } });
        expectType<PaprUpdateFilter<TestDocument>>({
          // @ts-expect-error Invalid key
          $set: { 'nestedObject.deep.inexistent': 'foo' },
        });
        expectType<PaprUpdateFilter<TestDocument>>({
          // @ts-expect-error Invalid key
          $set: { 'nestedObject.inexistent.deeper': 'foo' },
        });

        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.0.inexistent': 'foo' } });
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'inexistent.0.other': 'foo' } });
      });

      describe('array filters', () => {
        test('valid types', () => {
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'tags.$': 'foo' } });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'tags.$[bla]': 'foo' } });
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'tags.$[]': 'foo' } });

          // These are not yet enforced in the `PaprMatchKeysAndValues` type
          // expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.$.direct': 'foo' } });
          // expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.$[bla].direct': 'foo' } });
          // expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.$[].direct': 'foo' } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'tags.$': 123 } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'tags.$[bla]': 123 } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'tags.$[]': 123 } });

          // These are not yet enforced in the `PaprMatchKeysAndValues` type
          // expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.$.direct': 123 } });
          // expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.$[bla].direct': 123 } });
          // expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.$[].direct': 123 } });
        });
      });
    });

    describe('$pull', () => {
      test('valid types', () => {
        expectType<PaprUpdateFilter<TestDocument>>({ $pull: { tags: 'foo' } });

        expectType<PaprUpdateFilter<TestDocument>>({ $pull: { list: { direct: 'foo' } } });
      });

      test('invalid types', () => {
        // @ts-expect-error Type mismatch
        expectType<PaprUpdateFilter<TestDocument>>({ $pull: { tags: 123 } });

        // @ts-expect-error Type mismatch
        expectType<PaprUpdateFilter<TestDocument>>({ $pull: { list: { direct: 123 } } });
      });

      test('invalid keys', () => {
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $pull: { foo: 'foo' } });
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $pull: { bar: 123 } });
      });
    });

    describe('$push', () => {
      test('valid types', () => {
        expectType<PaprUpdateFilter<TestDocument>>({ $push: { tags: 'foo' } });
        expectType<PaprUpdateFilter<TestDocument>>({ $push: { tags: { $each: ['foo'] } } });
        expectType<PaprUpdateFilter<TestDocument>>({
          $push: {
            tags: { $each: ['foo'], $slice: 2 },
          },
        });
        expectType<PaprUpdateFilter<TestDocument>>({
          $push: {
            tags: { $each: ['foo'], $position: 3 },
          },
        });
        expectType<PaprUpdateFilter<TestDocument>>({
          $push: {
            tags: { $each: ['foo'], $sort: 1 },
          },
        });

        expectType<PaprUpdateFilter<TestDocument>>({ $push: { list: { direct: 'foo' } } });
        expectType<PaprUpdateFilter<TestDocument>>({
          $push: { list: { $each: [{ direct: 'foo' }] } },
        });
      });

      test('invalid types', () => {
        // @ts-expect-error Type mismatch
        expectType<PaprUpdateFilter<TestDocument>>({ $push: { tags: 123 } });
        // @ts-expect-error Type mismatch
        expectType<PaprUpdateFilter<TestDocument>>({ $push: { tags: { $each: 123 } } });
        // @ts-expect-error Type mismatch
        expectType<PaprUpdateFilter<TestDocument>>({ $push: { tags: { $each: [123] } } });

        // @ts-expect-error Type mismatch
        expectType<PaprUpdateFilter<TestDocument>>({ $push: { list: { direct: 123 } } });
      });

      test('invalid keys', () => {
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $push: { foo: 'foo' } });
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $push: { bar: 123 } });
      });
    });

    describe('$setOnInsert', () => {
      describe('top-level keys', () => {
        test('valid types', () => {
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { _id: new ObjectId() } });

          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { foo: 'foo' } });

          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { bar: 123 } });

          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { ham: new Date() } });

          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { tags: ['foo', 'bar'] } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { _id: 'foo' } });

          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { foo: 123 } });

          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { bar: 'foo' } });

          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { ham: 123 } });

          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { tags: 'foo' } });

          expectType<PaprUpdateFilter<TestDocument>>({
            $setOnInsert: {
              nestedObject: {
                deep: { deeper: 'foo' },
                // @ts-expect-error Type mismatch
                direct: 'foo',
              },
            },
          });
        });

        describe('existing nested keys using dot notation', () => {
          test('valid types', () => {
            expectType<PaprUpdateFilter<TestDocument>>({
              $setOnInsert: { 'nestedObject.direct': true },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              $setOnInsert: { 'nestedObject.other': 123 },
            });

            expectType<PaprUpdateFilter<TestDocument>>({
              $setOnInsert: { 'nestedObject.deep': { deeper: 'foo' } },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              $setOnInsert: { 'nestedObject.deep.deeper': 'foo' },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              $setOnInsert: { 'nestedObject.deep.other': 123 },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              $setOnInsert: { 'nestedObject.level2.level3.level4.level5.level6ID': 'foo' },
            });

            expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'tags.0': 'foo' } });

            expectType<PaprUpdateFilter<TestDocument>>({
              $setOnInsert: { 'list.0.direct': 'foo' },
            });
            expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'list.1.other': 123 } });

            expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'list.direct': 'foo' } });
            expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'list.other': 123 } });
          });

          test('invalid types', () => {
            expectType<PaprUpdateFilter<TestDocument>>({
              // @ts-expect-error Type mismatch
              $setOnInsert: { 'nestedObject.direct': 'foo' },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              // @ts-expect-error Type mismatch
              $setOnInsert: { 'nestedObject.other': 'foo' },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              // @ts-expect-error Type mismatch
              $setOnInsert: { 'nestedObject.deep.deeper': 123 },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              // @ts-expect-error Type mismatch
              $setOnInsert: { 'nestedObject.deep.other': 'foo' },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              // @ts-expect-error Type mismatch
              $setOnInsert: { 'nestedObject.level2.level3.level4.level5.level6ID': 123 },
            });

            // @ts-expect-error Type mismatch
            expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'tags.0': 123 } });

            // @ts-expect-error Type mismatch
            expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'list.0.direct': 123 } });
            // @ts-expect-error Type mismatch
            expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'list.1.other': 'foo' } });
          });
        });
      });

      test('invalid keys', () => {
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { inexistent: 'foo' } });

        expectType<PaprUpdateFilter<TestDocument>>({
          // @ts-expect-error Invalid key
          $setOnInsert: { 'nestedObject.inexistent': 'foo' },
        });
        expectType<PaprUpdateFilter<TestDocument>>({
          // @ts-expect-error Invalid key
          $setOnInsert: { 'nestedObject.deep.inexistent': 'foo' },
        });
        expectType<PaprUpdateFilter<TestDocument>>({
          // @ts-expect-error Invalid key
          $setOnInsert: { 'nestedObject.inexistent.deeper': 'foo' },
        });

        expectType<PaprUpdateFilter<TestDocument>>({
          // @ts-expect-error Invalid key
          $setOnInsert: { 'list.0.inexistent': 'foo' },
        });
        expectType<PaprUpdateFilter<TestDocument>>({
          // @ts-expect-error Invalid key
          $setOnInsert: { 'inexistent.0.other': 'foo' },
        });
      });

      describe('array filters', () => {
        test('valid types', () => {
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'tags.$': 'foo' } });
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'tags.$[bla]': 'foo' } });
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'tags.$[]': 'foo' } });

          // These are not yet enforced in the `PaprMatchKeysAndValues` type
          // expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'list.$.direct': 'foo' } });
          // expectType<PaprUpdateFilter<TestDocument>>({
          //   $setOnInsert: { 'list.$[bla].direct': 'foo' },
          // });
          // expectType<PaprUpdateFilter<TestDocument>>({
          //   $setOnInsert: { 'list.$[].direct': 'foo' },
          // });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'tags.$': 123 } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'tags.$[bla]': 123 } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'tags.$[]': 123 } });

          // These are not yet enforced in the `PaprMatchKeysAndValues` type
          // expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'list.$.direct': 123 } });
          // expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'list.$[bla].direct': 123 } });
          // expectType<PaprUpdateFilter<TestDocument>>({ $setOnInsert: { 'list.$[].direct': 123 } });
        });
      });
    });

    describe('$unset', () => {
      describe('top-level keys', () => {
        test('valid types', () => {
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { _id: 1 } });
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { foo: 1 } });
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { bar: '' } });
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { ham: true } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { _id: 'foo' } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { foo: 2 } });
        });

        describe('existing nested keys using dot notation', () => {
          test('valid types', () => {
            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'nestedObject.direct': 1 } });
            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'nestedObject.other': 1 } });

            expectType<PaprUpdateFilter<TestDocument>>({
              $unset: { 'nestedObject.deep': 1 },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              $unset: { 'nestedObject.deep.deeper': 1 },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              $unset: { 'nestedObject.deep.other': 1 },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              $unset: { 'nestedObject.level2.level3.level4.level5.level6ID': 1 },
            });

            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'tags.0': 1 } });

            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'list.0.direct': 1 } });
            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'list.1.other': 1 } });

            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'list.direct': 1 } });
            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'list.other': 1 } });
          });

          test('invalid types', () => {
            // @ts-expect-error Type mismatch
            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'nestedObject.direct': 123 } });
            // @ts-expect-error Type mismatch
            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'nestedObject.other': 123 } });
            expectType<PaprUpdateFilter<TestDocument>>({
              // @ts-expect-error Type mismatch
              $unset: { 'nestedObject.deep.deeper': 123 },
            });
            expectType<PaprUpdateFilter<TestDocument>>({
              // @ts-expect-error Type mismatch
              $unset: { 'nestedObject.deep.other': 123 },
            });

            // @ts-expect-error Type mismatch
            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'tags.0': 123 } });

            // @ts-expect-error Type mismatch
            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'list.0.direct': 123 } });
            // @ts-expect-error Type mismatch
            expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'list.1.other': 123 } });
          });
        });
      });

      test('invalid keys', () => {
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $unset: { inexistent: 'foo' } });

        expectType<PaprUpdateFilter<TestDocument>>({
          // @ts-expect-error Invalid key
          $unset: { 'nestedObject.inexistent': 'foo' },
        });
        expectType<PaprUpdateFilter<TestDocument>>({
          // @ts-expect-error Invalid key
          $unset: { 'nestedObject.deep.inexistent': 'foo' },
        });
        expectType<PaprUpdateFilter<TestDocument>>({
          // @ts-expect-error Invalid key
          $unset: { 'nestedObject.inexistent.deeper': 'foo' },
        });

        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'list.0.inexistent': 'foo' } });
        // @ts-expect-error Invalid key
        expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'inexistent.0.other': 'foo' } });
      });

      describe('array filters', () => {
        test('valid types', () => {
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'tags.$': 1 } });
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'tags.$[bla]': 1 } });
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'tags.$[]': 1 } });

          // These are not enforced in the `OnlyFieldsOfType` type
          // expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'list.$.direct': 1 } });
          // expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'list.$[bla].direct': 1 } });
          // expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'list.$[].direct': 1 } });
        });

        test('invalid types', () => {
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'tags.$': 123 } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'tags.$[bla]': 123 } });
          // @ts-expect-error Type mismatch
          expectType<PaprUpdateFilter<TestDocument>>({ $unset: { 'tags.$[]': 123 } });

          // These are not yet supported in the `OnlyFieldsOfType` type
          // expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.$.direct': 123 } });
          // expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.$[bla].direct': 123 } });
          // expectType<PaprUpdateFilter<TestDocument>>({ $set: { 'list.$[].direct': 123 } });
        });
      });
    });
  });
});
