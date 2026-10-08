import mongoose from 'mongoose';

const priceSchema = new mongoose.Schema(
  {
    priceType: {
      type: String,
      enum: ['mandi', 'mill'],
      required: true,
      index: true
    },
    crop: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    variety: {
      type: String,
      default: 'Common',
      trim: true
    },
    state: {
      type: String,
      trim: true,
      index: true
    },
    district: {
      type: String,
      trim: true,
      index: true
    },
    // Mandi-specific fields
    market: {
      type: String,
      trim: true,
      index: true
    },
    minPrice: {
      type: Number,
      default: 0
    },
    modalPrice: {
      type: Number,
      default: 0
    },
    maxPrice: {
      type: Number,
      default: 0
    },
    // Mill-specific fields
    millId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Mill',
      index: true
    },
    millName: {
      type: String,
      trim: true
    },
    offerPrice: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'expired'],
      default: 'active',
      index: true
    },
    expiresAt: {
      type: Date
    },
    // Shared metadata
    unit: {
      type: String,
      default: 'INR/quintal'
    },
    priceDate: {
      type: String,
      required: true,
      index: true
    },
    source: {
      type: String,
      default: 'AGMARKNET / Government of India'
    },
    sourceUrl: {
      type: String,
      default: 'https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi'
    },
    verified: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: 'prices'
  }
);

// Unique compound index for Mandi price entries to prevent duplicate daily ingestion
priceSchema.index(
  { priceType: 1, crop: 1, variety: 1, state: 1, district: 1, market: 1, priceDate: 1 },
  { unique: true, partialFilterExpression: { priceType: 'mandi' } }
);

// Compound index for Mill offers
priceSchema.index(
  { priceType: 1, millId: 1, crop: 1, variety: 1, priceDate: 1 },
  { partialFilterExpression: { priceType: 'mill' } }
);

const Price = mongoose.model('Price', priceSchema);

export default Price;
