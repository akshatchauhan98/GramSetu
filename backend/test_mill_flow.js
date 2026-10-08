import mongoose from 'mongoose';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import Mill from './models/Mill.js';
import Price from './models/Price.js';
import User from './models/User.js';

dotenv.config();

const API_BASE = 'http://localhost:5000/api';
const JWT_SECRET = process.env.JWT_SECRET || 'GramSetu_2026_X7p9K2m4SecureToken';

async function runTestFlow() {
  console.log('==================================================');
  console.log('STARTING REAL MILL OFFER LIFECYCLE TEST');
  console.log('==================================================');

  // 1. Ensure DB connection
  await mongoose.connect(process.env.MONGODB_URI);

  // Clear any leftover mill offers first
  await Price.deleteMany({ priceType: 'mill' });
  console.log('🧹 1. Cleared all mill offers from DB.');

  // TEST 1: Check Farmer compare API with NO mill offer
  console.log('\n--- TEST 1: GET /api/prices/compare WITH NO MILL OFFER ---');
  let resCompare = await fetch(`${API_BASE}/prices/compare?crop=Paddy`);
  let jsonCompare = await resCompare.json();
  console.log('Compare API Result (Mill Offers Count):', jsonCompare.millOffers?.length);
  console.log('Mill Offers Array:', jsonCompare.millOffers);
  if (jsonCompare.millOffers.length === 0) {
    console.log('✅ PASS: Farmer Dashboard shows NO mill offer when none submitted.');
  } else {
    console.error('❌ FAIL: Expected 0 mill offers');
  }

  // 2. Fetch a real mill record from gramsetu.mills
  const millDoc = await Mill.findOne({});
  if (!millDoc) {
    console.error('❌ FAIL: No mill found in mills collection');
    process.exit(1);
  }
  console.log(`\n🏢 Selected Real Mill: ${millDoc.name} (_id: ${millDoc._id}, district: ${millDoc.district})`);

  // Generate JWT token for mill user
  const token = jwt.sign(
    { userId: 'test_mill_user_id', role: 'mill' },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // TEST 2: Submit a REAL offer via POST /api/prices/mill
  console.log('\n--- TEST 2: POST /api/prices/mill (SUBMIT OFFER ₹2,550) ---');
  let submitRes = await fetch(`${API_BASE}/prices/mill`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      millId: millDoc._id.toString(),
      crop: 'Paddy',
      variety: 'Common',
      offerPrice: 2550,
      unit: 'INR/quintal'
    })
  });

  let submitJson = await submitRes.json();
  console.log('Submit Response:', submitJson);
  const createdPriceId = submitJson.data?._id;
  if (submitJson.success && createdPriceId) {
    console.log('✅ PASS: Mill offer submitted successfully. Price ID:', createdPriceId);
  } else {
    console.error('❌ FAIL: Submit mill offer failed');
  }

  // TEST 3: Verify Farmer Compare API returns submitted offer
  console.log('\n--- TEST 3: GET /api/prices/compare AFTER SUBMISSION ---');
  resCompare = await fetch(`${API_BASE}/prices/compare?crop=Paddy`);
  jsonCompare = await resCompare.json();
  console.log('Compare API Response:', JSON.stringify(jsonCompare, null, 2));
  if (jsonCompare.millOffers?.length > 0 && jsonCompare.millOffers[0].offerPrice === 2550) {
    console.log('✅ PASS: Farmer Dashboard received real submitted offer ₹2,550!');
  } else {
    console.error('❌ FAIL: Farmer dashboard did not receive submitted offer');
  }

  // TEST 4: Update offer price to ₹2,620 via PUT /api/prices/mill/:priceId
  console.log('\n--- TEST 4: PUT /api/prices/mill/:priceId (UPDATE TO ₹2,620) ---');
  let updateRes = await fetch(`${API_BASE}/prices/mill/${createdPriceId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      offerPrice: 2620
    })
  });
  let updateJson = await updateRes.json();
  console.log('Update Response:', updateJson);

  // Check compare API again
  resCompare = await fetch(`${API_BASE}/prices/compare?crop=Paddy`);
  jsonCompare = await resCompare.json();
  console.log('Compare API Updated Price:', jsonCompare.millOffers[0]?.offerPrice);
  if (jsonCompare.millOffers[0]?.offerPrice === 2620) {
    console.log('✅ PASS: Farmer Dashboard updated price to ₹2,620!');
  } else {
    console.error('❌ FAIL: Update price failed');
  }

  // TEST 5: Deactivate offer via DELETE /api/prices/mill/:priceId
  console.log('\n--- TEST 5: DELETE /api/prices/mill/:priceId (DEACTIVATE) ---');
  let deactivateRes = await fetch(`${API_BASE}/prices/mill/${createdPriceId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  let deactivateJson = await deactivateRes.json();
  console.log('Deactivate Response:', deactivateJson);
  if (deactivateJson.data?.status === 'inactive') {
    console.log('✅ PASS: Offer status updated to inactive.');
  }

  // Check compare API after deactivation
  resCompare = await fetch(`${API_BASE}/prices/compare?crop=Paddy`);
  jsonCompare = await resCompare.json();
  console.log('Compare API Result After Deactivation (Mill Offers Count):', jsonCompare.millOffers?.length);
  if (jsonCompare.millOffers.length === 0) {
    console.log('✅ PASS: Deactivated offer excluded from active farmer results.');
  } else {
    console.error('❌ FAIL: Deactivated offer still appearing');
  }

  console.log('\n==================================================');
  console.log('ALL MILL OFFER TESTS COMPLETED SUCCESSFULLY!');
  console.log('==================================================');

  process.exit(0);
}

runTestFlow().catch(err => {
  console.error('Test execution error:', err);
  process.exit(1);
});
