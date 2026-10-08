async function testMspEndpoints() {
  const BASE = 'http://localhost:5000/api';

  console.log('1. Testing GET /api/health...');
  const health = await fetch(`${BASE}/health`).then(r => r.json());
  console.log('Health:', health);

  console.log('\n2. Testing GET /api/msp (all records)...');
  const allMsp = await fetch(`${BASE}/msp`).then(r => r.json());
  console.log(`Success: ${allMsp.success}, Count: ${allMsp.count}`);

  console.log('\n3. Testing GET /api/msp/Paddy...');
  const paddy = await fetch(`${BASE}/msp/Paddy`).then(r => r.json());
  console.log('Paddy Response:', JSON.stringify(paddy, null, 2));

  console.log('\n4. Testing GET /api/msp/Wheat...');
  const wheat = await fetch(`${BASE}/msp/Wheat`).then(r => r.json());
  console.log('Wheat Response:', JSON.stringify(wheat, null, 2));

  console.log('\n5. Testing GET /api/msp/NonExistentCrop (404 test)...');
  const notFoundRes = await fetch(`${BASE}/msp/NonExistentCrop`);
  console.log('404 Status:', notFoundRes.status);
  console.log('404 Response:', await notFoundRes.json());
}

testMspEndpoints().catch(console.error);
