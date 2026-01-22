import User from './User.ts';
import { connect, disconnect } from './papr.ts';

await connect();

const users = await User.bulkWrite([
  {
    insertOne: {
      document: {
        firstName: 'John',
        lastName: 'Wick',
      },
    },
  },
  {
    updateOne: {
      filter: {
        firstName: 'John',
        lastName: 'Doe',
      },
      update: {
        $set: {
          active: true,
          age: 20,
        },
      },
      upsert: true,
    },
  },
]);
console.log(users);

await disconnect();
