import User from './User.ts';
import { connect, disconnect } from './papr.ts';

await connect();

const user = await User.insertOne({
  firstName: 'John',
  lastName: 'Wick',
});
console.log(user);

await disconnect();
