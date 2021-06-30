import { URL } from 'url';
import mongoose from 'mongoose';
import { COLLECTIONS } from './setup.js';

function isValidUrl(value) {
  try {
    // native url package will throw a TypeError on invalid urls
    // eslint-disable-next-line no-new
    new URL(value);
    return true;
  } catch (err) {
    return false;
  }
}

const sampleSchema = new mongoose.Schema(
  {
    age: Number,
    binary: Buffer,
    city: String,
    firstName: {
      required: true,
      type: String,
    },
    lastName: {
      required: true,
      type: String,
    },
    localization: Object,
    reference: {
      required: true,
      type: mongoose.Schema.Types.ObjectId,
    },
    reviews: [
      {
        _id: false,
        score: Number,
      },
    ],
    scores: [Number],
    source: {
      default: 'mongoose',
      enum: COLLECTIONS,
      required: true,
      type: String,
    },
    url: {
      required: true,
      type: String,
      validate: {
        message: '{VALUE} is not valid!',
        validator: isValidUrl,
      },
    },
    zip: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('mongoose', sampleSchema);
