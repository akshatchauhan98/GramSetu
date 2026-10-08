import mongoose from 'mongoose';

const millSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    district: {
      type: String,
      trim: true
    },

    state: {
      type: String,
      trim: true
    },

    crops: {
      type: [String],
      default: []
    },

    availableQuantityMT: {
      type: mongoose.Schema.Types.Mixed
    },

    phone: {
      type: [String],
      default: []
    },

    email: {
      type: [String],
      default: []
    },

    verificationSource: {
      type: String,
      trim: true
    },

    village: {
      type: String,
      trim: true
    },

    tehsil: {
      type: String,
      trim: true
    },

    address: {
      type: String,
      trim: true
    },

    latitude: {
      type: Number,
      default: null
    },

    longitude: {
      type: Number,
      default: null
    },

    locationSource: {
      type: String,
      trim: true
    },

    locationVerified: {
      type: Boolean,
      default: false
    },

    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: undefined
      }
    }
  },
  {
    timestamps: true,
    collection: 'mills'
  }
);

millSchema.index({ location: '2dsphere' });


const Mill = mongoose.model('Mill', millSchema);

export default Mill;