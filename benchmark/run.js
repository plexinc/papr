import fs from 'fs';
import { ObjectId, Decimal128 } from 'mongodb';
import mongoose from 'mongoose';
import SampleMongoose from './mongoose.js';
import SamplePapr from './papr.js';
import setup, { db, teardown } from './setup.js';

const INSERT_COUNT = 10000;
const FIND_COUNT = 10000;
const UPDATE_COUNT = 10000;
const IDS = {
  mongodb: [],
  mongoose: [],
  papr: [],
};
const TIMES = {
  mongodb: {
    find: 0,
    insert: 0,
    update: 0,
  },
  mongoose: {
    find: 0,
    insert: 0,
    update: 0,
  },
  papr: {
    find: 0,
    insert: 0,
    update: 0,
  },
};
const NS_PER_S = 1e9;
const RESULTS = [];

function printResult(line) {
  RESULTS.push(line);
  console.log(line);
}

function timer() {
  const start = process.hrtime.bigint();

  return () => {
    const diff = Number(process.hrtime.bigint() - start);

    return diff / NS_PER_S;
  };
}

function random(max) {
  return Math.floor(Math.random() * max);
}

function randomDecimal(max, type) {
  const cents = random(99);
  const dollars = random(max);
  return type === 'mongoose'
    ? new mongoose.Types.Decimal128(`${dollars}.${cents}`)
    : new Decimal128(`${dollars}.${cents}`);
}

function randomURL() {
  return `https://example.com/${random(1000)}`;
}

function randomDocument(source, type) {
  return {
    age: random(60),
    firstName: 'John',
    lastName: 'Doe',
    localization: {
      foo: 'bar',
    },
    reference: type === 'mongoose' ? new mongoose.Types.ObjectId() : new ObjectId(),
    reviews: [
      { score: random(10) },
      { score: random(10) },
      { score: random(10) },
      { score: random(10) },
      { score: random(10) },
    ],
    salary: randomDecimal(100000, type),
    scores: [random(100), random(100)],
    ...(source && { source }),
    url: randomURL(),
    zip: random(10000),
  };
}

function randomQueryID(source) {
  return { _id: IDS[source][random(IDS[source].length)] };
}

function randomQueryList(source) {
  const query = {
    _id: { $in: [] },
  };

  for (let i = 0; i < 10; i++) {
    query._id.$in.push(IDS[source][random(IDS[source].length)]);
  }

  return query;
}

async function test(library, name, operations, action) {
  const testTimer = timer();

  for (let index = 0; index < operations; index++) {
    await action();
  }

  const time = testTimer();
  const ops = (operations / time).toFixed(2);

  TIMES[library][name] = operations / time;

  printResult(`${library}.${name} ~ ${ops} ops/sec`);
}

async function run() {
  const mongodb = await db.collection('mongodbtests');

  await test('mongodb', 'insert', INSERT_COUNT, async () => {
    const result = await mongodb.insertOne(randomDocument('mongodbtests'));
    IDS.mongodb.push(result.insertedId);
  });
  await test('papr', 'insert', INSERT_COUNT, async () => {
    const doc = await SamplePapr.insertOne(randomDocument());
    IDS.papr.push(doc._id);
  });
  await test('mongoose', 'insert', INSERT_COUNT, async () => {
    const doc = await SampleMongoose.create(randomDocument(undefined, 'mongoose'));
    IDS.mongoose.push(doc._id);
  });

  printResult('---');

  await test('mongodb', 'find', FIND_COUNT, async () => {
    await mongodb.find(randomQueryList('mongodb')).toArray();
  });
  await test('papr', 'find', FIND_COUNT, async () => {
    await SamplePapr.find(randomQueryList('papr'));
  });
  await test('mongoose', 'find', FIND_COUNT, async () => {
    await SampleMongoose.find(randomQueryList('mongoose'));
  });

  printResult('---');

  await test('mongodb', 'update', UPDATE_COUNT, async () => {
    await mongodb.updateOne(randomQueryID('mongodb'), { $set: { age: random(100) } });
  });
  await test('papr', 'update', UPDATE_COUNT, async () => {
    await SamplePapr.updateOne(randomQueryID('papr'), { $set: { age: random(100) } });
  });
  await test('mongoose', 'update', UPDATE_COUNT, async () => {
    await SampleMongoose.updateOne(randomQueryID('mongoose'), { age: random(100) });
  });
}

async function save() {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const data = {
    benchmark: {
      charts: {
        find: JSON.stringify({
          caption: 'Operations per second',
          data: [
            {
              colour: '#13aa52',
              label: 'mongodb',
              value: TIMES.mongodb.find,
            },
            {
              colour: '#e5a00d',
              label: 'papr',
              value: TIMES.papr.find,
            },
            {
              colour: '#800',
              label: 'mongoose',
              value: TIMES.mongoose.find,
            },
          ],
          options: {
            labels: true,
          },
          title: 'Finds',
          type: 'review',
        }),
        insert: JSON.stringify({
          caption: 'Operations per second',
          data: [
            {
              colour: '#13aa52',
              label: 'mongodb',
              value: TIMES.mongodb.insert,
            },
            {
              colour: '#e5a00d',
              label: 'papr',
              value: TIMES.papr.insert,
            },
            {
              colour: '#800',
              label: 'mongoose',
              value: TIMES.mongoose.insert,
            },
          ],
          options: {
            labels: true,
          },
          title: 'Inserts',
          type: 'review',
        }),
        update: JSON.stringify({
          caption: 'Operations per second',
          data: [
            {
              colour: '#13aa52',
              label: 'mongodb',
              value: TIMES.mongodb.update,
            },
            {
              colour: '#e5a00d',
              label: 'papr',
              value: TIMES.papr.update,
            },
            {
              colour: '#800',
              label: 'mongoose',
              value: TIMES.mongoose.update,
            },
          ],
          options: {
            labels: true,
          },
          title: 'Updates',
          type: 'review',
        }),
      },
      configuration: [
        `- node.js ${process.version}`,
        `- mongodb v${pkg.devDependencies.mongodb}`,
        `- papr v${pkg.version}`,
        `- mongoose v${pkg.devDependencies.mongoose}`,
        '- MongoDB server v6.0',
      ].join('\n'),
      date: new Date().toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
      results: RESULTS.join('\n'),
    },
  };

  fs.writeFileSync('docs/data.json', JSON.stringify(data, null, 2));
}

await setup();
await run();
await save();
await teardown();
