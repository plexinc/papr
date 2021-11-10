import { types, schema } from '../src';
import papr from './papr';

const userSchema = schema(
  {
    active: types.boolean(),
    age: types.number(),
    firstName: types.string({ required: true }),
    lastName: types.string({ required: true }),
  },
  {
    defaults: { active: true },
  }
);

export type UserDocument = typeof userSchema[0];

const User = papr.model('users', userSchema);

export default User;
