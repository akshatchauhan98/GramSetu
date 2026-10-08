import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mill from './models/Mill.js';

dotenv.config();

async function checkDistricts() {
  await mongoose.connect(process.env.MONGODB_URI);
  const mills = await Mill.find({}).lean();

  const districtCounts = {};
  let nullCoords = 0;
  let hasCoords = 0;

  mills.forEach(m => {
    const d = m.district || 'Unknown';
    districtCounts[d] = (districtCounts[d] || 0) + 1;
    if (m.latitude == null || m.longitude == null) {
      nullCoords++;
    } else {
      hasCoords++;
    }
  });

  console.log('District distribution across all 103 mills:');
  console.log(districtCounts);
  console.log(`Has Coords: ${hasCoords}, Null Coords: ${nullCoords}`);

  console.log('\nMills with Null Coords:');
  mills.filter(m => m.latitude == null || m.longitude == null).forEach(m => {
    console.log(`- ${m.name} | Village: "${m.village || ''}" | Tehsil: "${m.tehsil || ''}" | District: "${m.district || ''}" | Address: "${m.address || ''}"`);
  });

  await mongoose.disconnect();
}

checkDistricts().catch(console.error);
