import User from './User.ts';
import { connect, disconnect } from './papr.ts';

await connect();

const users = await User.find({ firstName: 'John' });
console.log(users);

await disconnect();
