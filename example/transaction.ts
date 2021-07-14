import User from './User';
import { client, connect, disconnect } from './papr';

await connect();

const session = client.startSession();

try {
  await session.withTransaction(async () => {
    const user1 = await User.insertOne(
      {
        firstName: 'John',
        lastName: 'Wick',
      },
      { session }
    );
    const user2 = await User.insertOne(
      {
        firstName: 'John',
        lastName: 'Doe',
      },
      { session }
    );
    console.log(user1, user2);
  });
} finally {
  await session.endSession();
}

await disconnect();
