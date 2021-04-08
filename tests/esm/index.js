// This test does not use Jest because we want to test
// that the output of the build process works under native Node.js ESM syntax
// At this moment Jest does not support ESM syntax without transpiling
import assert from 'assert';
import { MongoMemoryServer } from 'mongodb-memory-server-global-4.4';
import mongodb from 'mongodb';
import Papr, { schema, types } from 'papr';

const COLLECTION = 'samples';

let connection;
let papr;
let mongoServer;

async function setup() {
  mongoServer = new MongoMemoryServer();

  const uri = await mongoServer.getUri();
  const dbName = await mongoServer.getDbName();

  console.log(`Testing with ${uri}${dbName}`);

  connection = await mongodb.MongoClient.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = connection.db(dbName);

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
    lastName: 'Wick'
  });
  assert.strictEqual(typeof doc1, 'object');
  assert.strictEqual(typeof doc1._id, 'object');
  assert.ok(doc1._id instanceof mongodb.ObjectId);
  assert.strictEqual(doc1.age, 40);
  assert.strictEqual(doc1.firstName, 'John');
  assert.strictEqual(doc1.lastName, 'Wick');

  const doc2 = await Sample.insertOne({
    firstName: 'John',
    lastName: 'Doe'
  });
  assert.strictEqual(typeof doc2, 'object');

  // finding documents

  const docs = await Sample.find(
    { firstName: 'John' },
    { sort: { lastName: 1 } }
  );

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
