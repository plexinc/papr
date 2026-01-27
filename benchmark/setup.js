import arg from 'arg';
import { MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import Papr from '../lib/index.js';

const help = `
  USAGE

    pnpm benchmark --option arg

  OPTIONS

    --help | -h   Shows this help message
    --db   | -d   Name of the database used for benchmarking
    --url  | -u   Mongo instance used for benchmarking
`;

const args = arg({
  '--db': String,
  '--help': Boolean,
  '--url': String,
  '-d': '--db',
  '-h': '--help',
  '-u': '--url',
});

if (args['--help']) {
  console.log(help);
  process.exit(0);
}

const DATABASE = args['--db'] && args['--db'] ? args['--db'] : `benchmark-${Date.now()}`;
const URL = args['--url'] && args['--url'].length > 0 ? args['--url'] : 'mongodb://localhost:27017';

export const COLLECTIONS = ['mongodbtests', 'mongoosetests', 'paprtests'];

export const papr = new Papr();

export let db;

export default async function setup() {
  const connection = await MongoClient.connect(URL, {
    directConnection: true,
  });
  db = connection.db(DATABASE);

  for (const collectionName of COLLECTIONS) {
    const collection = await db.collection(collectionName);

    await collection.deleteMany({});

    await collection.createIndex({ firstName: 1, lastName: 1 });
    await collection.createIndex({ source: 1 });
  }

  papr.initialize(db);
  papr.updateSchemas();

  await mongoose.connect(`${URL}/${DATABASE}`, {
    directConnection: true,
  });
}

export async function teardown() {
  await db.dropDatabase();

  process.exit(0);
}
