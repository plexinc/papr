import User from './User';
import { connect, disconnect } from './papr';

await connect();

const user = await User.insertOne({
  firstName: 'John',
  lastName: 'Wick',
});
console.log(user);

await disconnect();
