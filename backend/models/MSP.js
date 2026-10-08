import mongoose from 'mongoose';

const mspSchema = new mongoose.Schema(
  {
    crop: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    cropAliases: [
      {
        type: String,
        trim: true,
        index: true
      }
    ],
    season: {
      type: String,
      trim: true,
      index: true
    },
    marketingSeason: {
      type: String,
      trim: true,
      index: true
    },
    mspPerQuintal: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      default: 'INR/quintal'
    },
    source: {
      type: String,
      default: 'Government of India'
    },
    sourceUrl: {
      type: String
    },
    verified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'msp'
  }
);

// Useful MongoDB indexes
mspSchema.index({ crop: 1, season: 1 });
mspSchema.index({ cropAliases: 1 });

const MSP = mongoose.model('MSP', mspSchema);

export default MSP;
