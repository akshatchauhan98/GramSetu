import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mill from './models/Mill.js';

dotenv.config();

async function inspectAllMills() {
  await mongoose.connect(process.env.MONGODB_URI);
  const mills = await Mill.find({}).lean();
  console.log(`Total mills: ${mills.length}`);

  const ghazipurMills = mills.filter(m => /ghazipur/i.test(m.district || '') || /ghazipur/i.test(m.address || '') || /gahmar/i.test(m.address || ''));
  console.log(`\nMills matching Ghazipur/Gahmar: ${ghazipurMills.length}`);
  ghazipurMills.forEach(m => {
    console.log(`- ${m.name} | Village: "${m.village}" | Tehsil: "${m.tehsil}" | Dist: "${m.district}" | Address: "${m.address}" | Lat: ${m.latitude} | Lon: ${m.longitude} | Verified: ${m.locationVerified}`);
  });

  console.log('\nSample 20 mills from collection:');
  mills.slice(0, 20).forEach((m, idx) => {
    console.log(`${idx + 1}. ${m.name} | ${m.village || ''} | ${m.tehsil || ''} | ${m.district || ''} | Lat: ${m.latitude} | Lon: ${m.longitude} | Verified: ${m.locationVerified}`);
  });

  await mongoose.disconnect();
}

inspectAllMills().catch(console.error);
