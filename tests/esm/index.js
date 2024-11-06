// This test does not use Jest because we want to test
// that the output of the build process works under native Node.js ESM syntax
// On May 2023, Jest (29.5.0) does not support ESM syntax without transpiling
import assert from 'assert';
import { MongoClient, ObjectId } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Papr, { schema, types } from 'papr';

const COLLECTION = 'samples';
const DB = 'esm';

let connection;
let papr;
let mongoServer;

async function setup() {
  mongoServer = await MongoMemoryServer.create();

  const uri = mongoServer.getUri();

  console.log(`Testing with MongoDB v${process.env.MONGOMS_VERSION} on ${uri}${DB}`);

  connection = await MongoClient.connect(uri);
  const db = connection.db(DB);

  await db.collection(COLLECTION).deleteMany({});

  papr = new Papr();
  papr.initialize(db);
}

async function run() {
  const sampleSchema = schema(
    {
      age: types.number(),
      city: types.string(),
      firstName: types.string({ required: true }),
      lastName: types.string({ required: true }),
    },
    {
      timestamps: true,
    }
  );

  const Sample = papr.model(COLLECTION, sampleSchema);

  await papr.updateSchemas();

  assert.ok(Sample);
  assert.strictEqual(typeof Sample.find, 'function');

  // insert documents

  const doc1 = await Sample.insertOne({
    age: 40,
    firstName: 'John',
    lastName: 'Wick',
  });
  assert.strictEqual(typeof doc1, 'object');
  assert.strictEqual(typeof doc1._id, 'object');
  assert.ok(doc1._id instanceof ObjectId);
  assert.strictEqual(doc1.age, 40);
  assert.strictEqual(doc1.firstName, 'John');
  assert.strictEqual(doc1.lastName, 'Wick');

  const doc2 = await Sample.insertOne({
    firstName: 'John',
    lastName: 'Doe',
  });
  assert.strictEqual(typeof doc2, 'object');

  // finding documents

  const docs = await Sample.find({ firstName: 'John' }, { sort: { lastName: 1 } });

  assert.ok(Array.isArray(docs));
  assert.strictEqual(docs.length, 2);
  // The documents are sorted by their last name
  assert.strictEqual(docs[0]._id.toString(), doc2._id.toString());
  assert.strictEqual(docs[1]._id.toString(), doc1._id.toString());
}

async function teardown() {
  await connection.close();
  await mongoServer.stop();
}

await setup();
await run();
await teardown();

console.log('OK');
