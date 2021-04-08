import mongodb, { MongoClient } from 'mongodb';
import Papr from '../src';

let connection: MongoClient;
const papr = new Papr();

export async function connect(): Promise<void> {
  connection = await mongodb.MongoClient.connect('mongodb://localhost:27017', {
    useUnifiedTopology: true,
  });

  papr.initialize(connection.db('test'));

  await papr.updateSchemas();
}

export async function disconnect(): Promise<void> {
  await connection.close();
}

export default papr;
