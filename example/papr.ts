import mongodb, { MongoClient } from 'mongodb';
import Papr from '../src';

export let client: MongoClient;
const papr = new Papr();

export async function connect(): Promise<void> {
  client = await mongodb.MongoClient.connect('mongodb://localhost:27017', {
    directConnection: true,
  });

  papr.initialize(client.db('test'));

  await papr.updateSchemas();
}

export async function disconnect(): Promise<void> {
  await client.close();
}

export default papr;
