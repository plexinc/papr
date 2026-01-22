import { schema, types } from '../lib/index.js';
import { papr, COLLECTIONS } from './setup.js';

const sampleSchema = schema(
  {
    age: types.number(),
    binary: types.binary(),
    city: types.string(),
    firstName: types.string({ required: true }),
    lastName: types.string({ required: true }),
    localization: types.objectGeneric(types.string({ required: true })),
    reference: types.objectId({ required: true }),
    reviews: types.array(
      types.object(
        {
          score: types.number(),
        },
        {
          required: true,
        }
      )
    ),
    salary: types.decimal(),
    scores: types.array(types.number({ required: true })),
    source: types.enum(COLLECTIONS, { required: true }),
    url: types.string({
      pattern: '^https?://.+$',
      required: true,
    }),
    zip: types.number(),
  },
  {
    defaults: { source: 'paprtests' },
    timestamps: true,
  }
);

const SamplePapr = papr.model('paprtests', sampleSchema);

export default SamplePapr;
