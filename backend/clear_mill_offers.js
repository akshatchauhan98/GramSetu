import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Price from './models/Price.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function clearMillOffers() {
  try {
    await mongoose.connect(MONGODB_URI);
    const result = await Price.deleteMany({ priceType: 'mill' });
    console.log(`🧹 Cleared ${result.deletedCount} sample mill offers from 'gramsetu.prices'.`);
    process.exit(0);
  } catch (err) {
    console.error('Error clearing mill offers:', err);
    process.exit(1);
  }
}

clearMillOffers();
