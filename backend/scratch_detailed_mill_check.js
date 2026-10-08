import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mill from './models/Mill.js';
import User from './models/User.js';
import { calculateDistanceKm } from './services/geocodingService.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Gahmar, Ghazipur, UP coordinates: lat 25.4992, lon 83.8089
const GAHMAR_LAT = 25.4992;
const GAHMAR_LON = 83.8089;

async function checkDetails() {
  console.log('Connecting to MONGODB_URI...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 10000 });
  console.log('=== MILL DATABASE INSPECTION FOR GAHMAR ===');

  const mills = await Mill.find({}).lean();
  console.log(`Total mills in database: ${mills.length}\n`);

  let verifiedCount = 0;
  let unverifiedCount = 0;
  let w10 = 0, w25 = 0, w50 = 0, w75 = 0;
  let closestMill = null;
  let minDistance = Infinity;

  const results = [];

  for (const m of mills) {
    const hasLatLon = m.latitude != null && m.longitude != null;
    const isVerified = m.locationVerified === true && hasLatLon;

    if (hasLatLon) {
      verifiedCount++;
      const dist = calculateDistanceKm(GAHMAR_LAT, GAHMAR_LON, m.latitude, m.longitude);
      if (dist !== null) {
        if (dist <= 10) w10++;
        if (dist <= 25) w25++;
        if (dist <= 50) w50++;
        if (dist <= 75) w75++;

        if (dist < minDistance) {
          minDistance = dist;
          closestMill = { name: m.name, dist, district: m.district, village: m.village };
        }

        results.push({
          name: m.name,
          district: m.district,
          state: m.state,
          lat: m.latitude,
          lon: m.longitude,
          distKm: dist,
          verified: isVerified,
          locationObj: m.location
        });
      }
    } else {
      unverifiedCount++;
      results.push({
        name: m.name,
        district: m.district,
        state: m.state,
        lat: null,
        lon: null,
        distKm: null,
        verified: false,
        locationObj: m.location
      });
    }
  }

  results.sort((a, b) => {
    if (a.distKm === null) return 1;
    if (b.distKm === null) return -1;
    return a.distKm - b.distKm;
  });

  console.log('Top 15 Mills sorted by distance to Gahmar (25.4992, 83.8089):');
  results.slice(0, 15).forEach((r, idx) => {
    console.log(`${idx + 1}. ${r.name} | ${r.district}, ${r.state} | Dist: ${r.distKm !== null ? r.distKm + ' km' : 'N/A'} | Verified: ${r.verified} | GeoJSON: ${JSON.stringify(r.locationObj)}`);
  });

  console.log('\n--- STATS FOR GAHMAR (25.4992, 83.8089) ---');
  console.log(`- Mills with coordinates: ${verifiedCount}`);
  console.log(`- Mills without coordinates: ${unverifiedCount}`);
  console.log(`- Within 10 km: ${w10}`);
  console.log(`- Within 25 km: ${w25}`);
  console.log(`- Within 50 km: ${w50}`);
  console.log(`- Within 75 km: ${w75}`);
  console.log(`- Actual nearest mill: ${closestMill ? closestMill.name + ' (' + closestMill.district + ')' : 'None'}`);
  console.log(`- Actual nearest distance: ${minDistance !== Infinity ? minDistance + ' km' : 'N/A'}`);

  // Check farmer user profile for Gahmar
  const gahmarUser = await User.findOne({ village: /Gahmar/i });
  console.log('\nFarmer user record for Gahmar:', gahmarUser ? { id: gahmarUser._id, name: gahmarUser.name, village: gahmarUser.village, district: gahmarUser.district, state: gahmarUser.state } : 'None found');

  await mongoose.disconnect();
}

checkDetails().catch(console.error);
