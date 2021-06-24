import mongodb from 'mongodb';
import mongoose from 'mongoose';
import Papr from '../esm/index.js';
import arg from 'arg';

const args = arg({
  '--url': String,
  '-u': '--url'
});

const DATABASE = 'benchmark';
const URL = Object.prototype.hasOwnProperty.call(args, '--url') && args['--url'].length > 0 ? args['--url'] : 'mongodb://localhost:27017';

export const COLLECTIONS = ['mongodb', 'mongoose', 'papr'];

export const papr = new Papr();

export let db;

export default async function setup() {
  const connection = await mongodb.MongoClient.connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
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

  mongoose.connect(`${URL}/${DATABASE}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}