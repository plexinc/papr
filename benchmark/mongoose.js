import { URL } from 'url';
import mongoose from 'mongoose';
import { COLLECTIONS } from './setup.js';

function isValidUrl(value) {
  try {
    // native url package will throw a TypeError on invalid urls
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
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    localization: Object,
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
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
      type: String,
      enum: COLLECTIONS,
      required: true,
    },
    url: {
      type: String,
      required: true,
      validate: {
        validator: isValidUrl,
        message: '{VALUE} is not valid!',
      },
    },
    zip: Number,
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('mongoose', sampleSchema);
