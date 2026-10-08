async function testPricesApi() {
  const BASE = 'http://localhost:5000/api';

  console.log('--- 1. Testing GET /api/prices/mandi ---');
  const mandiRes = await fetch(`${BASE}/prices/mandi`).then(r => r.json());
  console.log(`Success: ${mandiRes.success}, Count: ${mandiRes.count}`);
  if (mandiRes.data && mandiRes.data.length > 0) {
    console.log('Sample Mandi Record:', mandiRes.data[0]);
  }

  console.log('\n--- 2. Testing GET /api/prices/mandi?crop=Paddy ---');
  const paddyMandi = await fetch(`${BASE}/prices/mandi?crop=Paddy`).then(r => r.json());
  console.log(`Paddy Mandi Count: ${paddyMandi.count}`);

  console.log('\n--- 3. Testing GET /api/prices/mandi?state=Uttar%20Pradesh ---');
  const upMandi = await fetch(`${BASE}/prices/mandi?state=Uttar%20Pradesh`).then(r => r.json());
  console.log(`UP Mandi Count: ${upMandi.count}`);

  console.log('\n--- 4. Testing GET /api/prices/mill ---');
  const millRes = await fetch(`${BASE}/prices/mill`).then(r => r.json());
  console.log(`Success: ${millRes.success}, Count: ${millRes.count}`);
  if (millRes.data && millRes.data.length > 0) {
    console.log('Sample Mill Offer Record:', millRes.data[0]);
  }

  console.log('\n--- 5. Testing GET /api/prices/compare?crop=Paddy&district=Ghazipur ---');
  const compareRes = await fetch(`${BASE}/prices/compare?crop=Paddy&district=Ghazipur`).then(r => r.json());
  console.log('Comparison Response:', JSON.stringify(compareRes, null, 2));

  console.log('\n--- 6. Testing GET /api/prices/compare?crop=Wheat ---');
  const compareWheat = await fetch(`${BASE}/prices/compare?crop=Wheat`).then(r => r.json());
  console.log('Wheat Comparison Response:', JSON.stringify(compareWheat, null, 2));
}

testPricesApi().catch(console.error);
