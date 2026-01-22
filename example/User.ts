import { schema, types } from '../src/index.ts';
import papr from './papr.ts';

const userSchema = schema(
  {
    active: types.boolean(),
    address: types.object({
      country: types.string({ required: true }),
      zip: types.number({ required: true }),
    }),
    age: types.number(),
    firstName: types.string({ required: true }),
    lastName: types.string({ required: true }),
    orders: types.array(
      types.object({
        product: types.string({ required: true }),
        quantity: types.number({ required: true }),
      })
    ),
    tags: types.array(types.string()),
  },
  {
    defaults: { active: true },
  }
);

export type UserDocument = (typeof userSchema)[0];

const User = papr.model('users', userSchema);

export default User;
