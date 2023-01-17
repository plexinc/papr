import { describe, expect, test } from '@jest/globals';
import { ObjectId } from 'mongodb';
import { expectType } from 'ts-expect';
import { PaprFilter } from '../mongodbTypes';

describe('mongodb', () => {
  interface Schema {
    _id: ObjectId;
    foo: string;
    bar: number;
    ham?: Date;
    nestedList: {
      direct: string;
      other?: number;
    }[];
    nestedObject: {
      deep: {
        deeper: string;
        other?: number;
      };
      direct: boolean;
      other?: number;
    };
  }

  describe('PaprFilter', () => {
    test('valid types', () => {
      expect(true).toBeTruthy();

      expectType<PaprFilter<Schema>>({ _id: new ObjectId() });
      expectType<PaprFilter<Schema>>({ foo: 'foo' });
      expectType<PaprFilter<Schema>>({ bar: 123 });
      expectType<PaprFilter<Schema>>({ ham: new Date() });

      expectType<PaprFilter<Schema>>({ nestedObject: { deep: { deeper: 'foo' }, direct: true } });

      expectType<PaprFilter<Schema>>({ 'nestedObject.direct': true });
      expectType<PaprFilter<Schema>>({ 'nestedObject.other': 123 });
      expectType<PaprFilter<Schema>>({ 'nestedObject.deep.deeper': 'foo' });
      expectType<PaprFilter<Schema>>({ 'nestedObject.deep.other': 123 });

      expectType<PaprFilter<Schema>>({ 'nestedList.0.direct': 'foo' });
      expectType<PaprFilter<Schema>>({ 'nestedList.1.other': 123 });
    });

    test('invalid types on existing keys', () => {
      expect(true).toBeTruthy();

      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ _id: 'foo' });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ foo: true });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ bar: 'foo' });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ ham: 123 });

      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ nestedObject: { deep: { deeper: 'foo' }, direct: 'foo' } });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ nestedObject: { deep: { deeper: 123 }, direct: true } });

      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedObject.direct': 'foo' });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedObject.other': 'foo' });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedObject.deep.deeper': 123 });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedObject.deep.other': 'foo' });

      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedList.0.direct': 123 });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedList.1.other': 'foo' });
    });

    test('invalid keys', () => {
      expect(true).toBeTruthy();

      // @ts-expect-error Invalid key
      expectType<PaprFilter<Schema>>({ inexistent: 'foo' });

      // @ts-expect-error Invalid key
      expectType<PaprFilter<Schema>>({ 'nestedObject.inexsitent': 'foo' });
      // @ts-expect-error Invalid key
      expectType<PaprFilter<Schema>>({ 'nestedObject.deep.inexistent': 'foo' });
      // @ts-expect-error Invalid key
      expectType<PaprFilter<Schema>>({ 'nestedObject.inexistent.deeper': 'foo' });

      // @ts-expect-error Invalid key
      expectType<PaprFilter<Schema>>({ 'nestedList.0.inexistent': 'foo' });
      // @ts-expect-error Invalid key
      expectType<PaprFilter<Schema>>({ 'inexistent.0.other': 'foo' });
    });

    test('filter operators with valid types', () => {
      expect(true).toBeTruthy();

      expectType<PaprFilter<Schema>>({ _id: { $in: [new ObjectId()] } });
      expectType<PaprFilter<Schema>>({ foo: { $eq: 'foo' } });
      expectType<PaprFilter<Schema>>({ bar: { $gt: 123 } });
      expectType<PaprFilter<Schema>>({ ham: { $nin: [new Date()] } });

      expectType<PaprFilter<Schema>>({ 'nestedObject.direct': { $eq: true } });
      expectType<PaprFilter<Schema>>({ 'nestedObject.other': { $lt: 123 } });
      expectType<PaprFilter<Schema>>({ 'nestedObject.deep.deeper': { $in: ['foo'] } });
      expectType<PaprFilter<Schema>>({ 'nestedObject.deep.other': { $gte: 123 } });

      expectType<PaprFilter<Schema>>({ 'nestedList.0.direct': { $ne: 'foo' } });
      expectType<PaprFilter<Schema>>({ 'nestedList.1.other': { $ne: 123 } });
    });

    test('filter operators with invalid types', () => {
      expect(true).toBeTruthy();

      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ _id: { $in: ['foo'] } });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ foo: { $eq: true } });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ bar: { $gt: 'foo' } });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ ham: { $nin: [123] } });

      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedObject.direct': { $eq: 'foo' } });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedObject.other': { $lt: true } });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedObject.deep.deeper': { $in: [123] } });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedObject.deep.other': { $gte: 'foo' } });

      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedList.0.direct': { $ne: 123 } });
      // @ts-expect-error Type mismatch
      expectType<PaprFilter<Schema>>({ 'nestedList.1.other': { $ne: 'foo' } });
    });
  });
});
