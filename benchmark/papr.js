// eslint-disable-next-line
import { schema, types } from '../esm/index.js';
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
    scores: types.array(types.number({ required: true })),
    source: types.enum(COLLECTIONS, { required: true }),
    url: types.string({
      pattern: '^https?://.+$',
      required: true,
    }),
    zip: types.number(),
  },
  {
    defaults: { source: 'papr' },
    timestamps: true,
  }
);

const SamplePapr = papr.model('papr', sampleSchema);

export default SamplePapr;
