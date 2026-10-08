import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    state: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    district: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    village: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    subdistrict: {
      type: String,
      trim: true
    },

    pincode: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    collection: 'locations'
  }
);

locationSchema.index({ state: 1, district: 1 });
locationSchema.index({ state: 1, district: 1, village: 1 }, { unique: true });

const Location = mongoose.model('Location', locationSchema);

export default Location;
