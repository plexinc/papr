import User from './User';
import { connect, disconnect } from './papr';

await connect();

const users = await User.find({ firstName: 'John' });
console.log(users);

await disconnect();
