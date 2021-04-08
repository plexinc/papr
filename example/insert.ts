import { connect, disconnect } from './papr';
import User from './User';

await connect();

const user = await User.insertOne({
  firstName: 'John',
  lastName: 'Wick',
});
console.log(user);

await disconnect();
