import fs from 'fs';
import barChart from '@byu-oit/bar-chart';
import { ObjectId } from 'mongodb';
import SampleMongoose from './mongoose.js';
import SamplePapr from './papr.js';
import setup, { db, teardown } from './setup.js';

const CHART_LABELS = ['insert', 'find', 'update'];
const CHART_LEGEND_LABELS = ['mongodb', 'papr', 'mongoose'];
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
  }
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
    reference: new ObjectId(),
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

async function test(library, name, operations, action) {
  const testTimer = timer();

  for (let index = 0; index < operations; index++) {
    await action();
  }

  const time = testTimer();
  const ops = (operations / time).toFixed(2);

  TIMES[library][name] = ops;

  console.log(`${library}.${name} ~ ${ops} ops/sec`);
}

async function run() {
  const mongodb = await db.collection('mongodbtests');

  await test('mongodb', 'insert', INSERT_COUNT, async () => {
    const result = await mongodb.insertOne(randomDocument('mongodb'));
    IDS.mongodb.push(result.insertedId);
  });
  await test('papr', 'insert', INSERT_COUNT, async () => {
    const doc = await SamplePapr.insertOne(randomDocument());
    IDS.papr.push(doc._id);
  });
  await test('mongoose', 'insert', INSERT_COUNT, async () => {
    const doc = await SampleMongoose.create(randomDocument());
    IDS.mongoose.push(doc._id);
  });

  console.log('---');

  await test('mongodb', 'find', FIND_COUNT, async () => {
    await mongodb.find(randomQueryList('mongodb')).toArray();
  });
  await test('papr', 'find', FIND_COUNT, async () => {
    await SamplePapr.find(randomQueryList('papr'));
  });
  await test('mongoose', 'find', FIND_COUNT, async () => {
    await SampleMongoose.find(randomQueryList('mongoose'));
  });

  console.log('---');

  await test('mongodb', 'update', UPDATE_COUNT, async () => {
    await mongodb.updateOne(randomQueryID('mongodb'), { $set: { age: random(100) }, });
  });
  await test('papr', 'update', UPDATE_COUNT, async () => {
    await SamplePapr.updateOne(randomQueryID('papr'), { $set: { age: random(100) }, });
  });
  await test('mongoose', 'update', UPDATE_COUNT, async () => {
    await SampleMongoose.updateOne(randomQueryID('mongoose'), { age: random(100) });
  });

  const chart = barChart({
    colors: [
      '#13aa52',
      '#e5a00d',
      '#800'
    ],
    data: [
      [TIMES.mongodb.insert, TIMES.papr.insert, TIMES.mongoose.insert],
      [TIMES.mongodb.find, TIMES.papr.find, TIMES.mongoose.find],
      [TIMES.mongodb.update, TIMES.papr.update, TIMES.mongoose.update],
    ],
    labels: CHART_LABELS,
    legendLabels: CHART_LEGEND_LABELS
  })
    .replace('<rect x="0" y="0" width="100" height="60" fill="url(#bgGradient)" />', '')
    .replace('stroke: #ccc;', 'stroke: #555;')
    .replace('font-family: "Helvetica Nue", Arial, sans-serif;', 'font-family: "Helvetica Nue", Arial, sans-serif; fill: #fff;');

  fs.writeFileSync('docs/benchmark.svg', chart);
}

await setup();
await run();
await teardown();
