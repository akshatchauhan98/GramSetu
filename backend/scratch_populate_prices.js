import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Price from './models/Price.js';
import Mill from './models/Mill.js';
import { syncMandiPrices } from './sync_mandi_prices.js';

dotenv.config();

async function populatePrices() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected!');

  console.log('Running syncMandiPrices()...');
  const res = await syncMandiPrices();
  console.log('Sync Result:', res);

  // Seed sample mill offer
  const sampleMill = await Mill.findOne({});
  if (sampleMill) {
    const todayStr = new Date().toISOString().split('T')[0];
    const offer = await Price.updateOne(
      {
        priceType: 'mill',
        millId: sampleMill._id,
        crop: 'Paddy',
        variety: 'Common',
        priceDate: todayStr
      },
      {
        $set: {
          priceType: 'mill',
          millId: sampleMill._id,
          millName: sampleMill.name,
          crop: 'Paddy',
          variety: 'Common',
          state: sampleMill.state || 'Uttar Pradesh',
          district: sampleMill.district || 'Saharanpur',
          offerPrice: 2500,
          unit: 'INR/quintal',
          priceDate: todayStr,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          source: 'Mill submitted offer',
          verified: true
        }
      },
      { upsert: true }
    );
    console.log(`✅ Mill offer created for ${sampleMill.name}`);
  }

  const mandiTotal = await Price.countDocuments({ priceType: 'mandi' });
  const millTotal = await Price.countDocuments({ priceType: 'mill' });
  console.log(`\nFinal Totals in 'gramsetu.prices':`);
  console.log(` - Mandi records: ${mandiTotal}`);
  console.log(` - Mill offer records: ${millTotal}`);

  await mongoose.disconnect();
  process.exit(0);
}

populatePrices().catch(console.error);
