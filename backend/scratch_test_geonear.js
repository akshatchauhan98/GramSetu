import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mill from './models/Mill.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;
const GAHMAR_LAT = 25.4992;
const GAHMAR_LON = 83.8089;

async function testGeoNear() {
  await mongoose.connect(MONGODB_URI);
  console.log('Testing $geoNear aggregation for Gahmar (25.4992, 83.8089)...');

  const radii = [10, 25, 50, 75];
  let selectedRadius = 75;
  let finalResults = [];

  for (const r of radii) {
    const res = await Mill.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [GAHMAR_LON, GAHMAR_LAT]
          },
          key: 'location',
          distanceField: 'distanceMeters',
          spherical: true,
          maxDistance: r * 1000,
          query: {
            locationVerified: true,
            'location.coordinates': { $exists: true }
          }
        }
      }
    ]);

    console.log(`Radius ${r} km: found ${res.length} verified mills`);

    if (res.length >= 5) {
      selectedRadius = r;
      finalResults = res;
      break;
    }
    if (r === 75) {
      selectedRadius = r;
      finalResults = res;
    }
  }

  console.log(`\nSelected progressive search radius: ${selectedRadius} km`);
  console.log(`Verified mills count within ${selectedRadius} km: ${finalResults.length}`);

  finalResults.forEach((m, idx) => {
    const distKm = Math.round((m.distanceMeters / 1000) * 10) / 10;
    console.log(`${idx + 1}. ${m.name} | ${m.district}, ${m.state} | ${distKm} km`);
  });

  await mongoose.disconnect();
}

testGeoNear().catch(console.error);
