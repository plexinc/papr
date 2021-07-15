import mongodbLib from 'mongodb';
import SampleMongoose from './mongoose.js';
import SamplePapr from './papr.js';
import setup, { db } from './setup.js';

const INSERT_COUNT = 10000;
const FIND_COUNT = 10000;
const UPDATE_COUNT = 10000;
const IDS = {
  mongodb: [],
  mongoose: [],
  papr: [],
};
const NS_PER_S = 1e9;

function timer() {
  const time = process.hrtime();

  return () => {
    const diff = process.hrtime(time);
    const ns = diff[0] * NS_PER_S + diff[1];

    return Number(ns / NS_PER_S);
  };
}

function random(max) {
  return Math.floor(Math.random() * max);
}

function randomURL() {
  return `https://example.com/${random(1000)}`;
}

function randomDocument(source) {
  return {
    age: random(60),
    firstName: 'John',
    lastName: 'Doe',
    localization: {
      foo: 'bar',
    },
    reference: new mongodbLib.ObjectId(),
    reviews: [
      { score: random(10) },
      { score: random(10) },
      { score: random(10) },
      { score: random(10) },
      { score: random(10) },
    ],
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

async function test(name, operations, action) {
  const testTimer = timer();

  for (let index = 0; index < operations; index++) {
    await action();
  }

  const time = testTimer();
  const ops = (operations / time).toFixed(2);

  console.log(`${name} ~ ${ops} ops/sec`);
}

async function run() {
  const mongodb = await db.collection('mongodbtests');

  await test('mongodb.insertOne', INSERT_COUNT, async () => {
    const result = await mongodb.insertOne(randomDocument('mongodb'));
    IDS.mongodb.push(result.insertedId);
  });
  await test('papr.insertOne', INSERT_COUNT, async () => {
    const doc = await SamplePapr.insertOne(randomDocument());
    IDS.papr.push(doc._id);
  });
  await test('mongoose.create', INSERT_COUNT, async () => {
    const doc = await SampleMongoose.create(randomDocument());
    IDS.mongoose.push(doc._id);
  });

  console.log('---');

  await test('mongodb.find', FIND_COUNT, async () => {
    await mongodb.find(randomQueryList('mongodb')).toArray();
  });
  await test('papr.find', FIND_COUNT, async () => {
    await SamplePapr.find(randomQueryList('papr'));
  });
  await test('mongoose.find', FIND_COUNT, async () => {
    await SampleMongoose.find(randomQueryList('mongoose'));
  });

  console.log('---');

  await test('mongodb.updateOne', UPDATE_COUNT, async () => {
    await mongodb.updateOne(randomQueryID('mongodb'), { $set: { age: random(100) }, });
  });
  await test('papr.updateOne', UPDATE_COUNT, async () => {
    await SamplePapr.updateOne(randomQueryID('papr'), { $set: { age: random(100) }, });
  });
  await test('mongoose.updateOne', UPDATE_COUNT, async () => {
    await SampleMongoose.updateOne(randomQueryID('mongoose'), { age: random(100) });
  });

  process.exit(0);
}

await setup();
await run();
