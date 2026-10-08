import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Mill from '../models/Mill.js';
import { geocodeQuery } from '../services/geocodingService.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

// Delay helper to respect OpenStreetMap rate limit (1 sec delay between external requests)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function enrichMillLocations() {
  console.log('=== GRAMSETU MILL LOCATION ENRICHMENT & GEOINDEXING SCRIPT ===');
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 30000 });
  console.log('Connected to Database:', mongoose.connection.name);

  // Ensure 2dsphere index exists on location field
  console.log('Syncing MongoDB indexes (building location 2dsphere index)...');
  await Mill.syncIndexes();
  console.log('✅ 2dsphere index on location field confirmed.');

  const allMills = await Mill.find({}).lean();
  const totalScanned = allMills.length;

  let alreadyGeocoded = 0;
  let successfullyGeocoded = 0;
  let ambiguousCount = 0;
  let notFoundCount = 0;
  let updatedGeoJsonOnly = 0;

  console.log(`Scanned ${totalScanned} mill records from MongoDB...\n`);

  for (let i = 0; i < allMills.length; i++) {
    const mill = allMills[i];
    const district = (mill.district || '').trim();
    const state = (mill.state || 'Uttar Pradesh').trim();
    const village = (mill.village || '').trim();
    const address = (mill.address || '').trim();

    // Check if lat/lon already exist
    const hasLatLon = mill.latitude != null && mill.longitude != null;
    const hasGeoJson = mill.location && Array.isArray(mill.location.coordinates) && mill.location.coordinates.length === 2;

    if (hasLatLon) {
      alreadyGeocoded++;
      // If missing GeoJSON location object, update it now
      if (!hasGeoJson || !mill.locationVerified) {
        await Mill.updateOne(
          { _id: mill._id },
          {
            $set: {
              location: {
                type: 'Point',
                coordinates: [Number(mill.longitude), Number(mill.latitude)]
              },
              locationVerified: true,
              locationSource: mill.locationSource || 'OpenStreetMap / verified geocoding'
            }
          }
        );
        updatedGeoJsonOnly++;
      }
      continue;
    }

    // Geocode mills without coordinates
    console.log(`[${i + 1}/${totalScanned}] Geocoding: "${mill.name}" (District: ${district || 'N/A'})...`);

    let resolvedGeo = null;

    // Strategy A: Full Mill Name + District + State + India
    if (mill.name && district) {
      const q = `${mill.name}, ${district}, ${state}, India`;
      const res = await geocodeQuery(q, district, state);
      if (res && res.latitude != null && res.longitude != null) {
        resolvedGeo = res;
      }
      await delay(1100);
    }

    // Strategy B: Village / Address + District + State + India
    if (!resolvedGeo && (village || address) && district) {
      const q = `${village || address}, ${district}, ${state}, India`;
      const res = await geocodeQuery(q, district, state);
      if (res && res.latitude != null && res.longitude != null) {
        resolvedGeo = res;
      }
      await delay(1100);
    }

    // Strategy C: District + State + India (district centroid fallback)
    if (!resolvedGeo && district) {
      const q = `${district}, ${state}, India`;
      const res = await geocodeQuery(q, district, state);
      if (res && res.latitude != null && res.longitude != null) {
        resolvedGeo = res;
      }
      await delay(1100);
    }

    if (resolvedGeo && resolvedGeo.latitude != null && resolvedGeo.longitude != null) {
      await Mill.updateOne(
        { _id: mill._id },
        {
          $set: {
            latitude: resolvedGeo.latitude,
            longitude: resolvedGeo.longitude,
            location: {
              type: 'Point',
              coordinates: [Number(resolvedGeo.longitude), Number(resolvedGeo.latitude)]
            },
            locationSource: resolvedGeo.locationSource || 'OpenStreetMap / verified geocoding',
            locationVerified: true
          }
        }
      );
      successfullyGeocoded++;
      console.log(`  ✅ Geocoded: lat=${resolvedGeo.latitude}, lng=${resolvedGeo.longitude}`);
    } else {
      notFoundCount++;
      console.log(`  ⚠️ Location could not be verified for: "${mill.name}"`);
    }
  }

  console.log('\n==================================================');
  console.log('ENRICHMENT SUMMARY RESULT:');
  console.log('==================================================');
  console.log(`Total Mills scanned:       ${totalScanned}`);
  console.log(`Already had coordinates:   ${alreadyGeocoded}`);
  console.log(`GeoJSON structure updated: ${updatedGeoJsonOnly}`);
  console.log(`Newly Geocoded:            ${successfullyGeocoded}`);
  console.log(`Ambiguous/Not found:       ${notFoundCount}`);
  console.log('==================================================\n');

  await mongoose.disconnect();
}

enrichMillLocations().catch((err) => {
  console.error('Enrichment failed:', err);
  process.exit(1);
});
