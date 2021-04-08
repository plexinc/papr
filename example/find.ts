import { connect, disconnect } from './papr';
import User from './User';

await connect();

const users = await User.find({ firstName: 'John' });
console.log(users);

await disconnect();
