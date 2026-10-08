import http from 'http';

function postRequest(path, data) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(data);
    const req = http.request(`http://localhost:5000${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function getRequest(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    }).on('error', reject);
  });
}

async function testOfferReflection() {
  console.log('=== SUBMITTING MILL OFFER ===');
  // First get a mill ID from nearby endpoint
  const initial = await getRequest('/api/mills/nearby-with-prices?village=Gahmar&district=Ghazipur&state=Uttar%20Pradesh&crop=Paddy&variety=Common');
  const targetMill = initial.mills[0];
  console.log('Target Mill:', targetMill.name, 'ID:', targetMill.millId);

  // Submit offer ₹2500 for Paddy Common
  const offerRes = await postRequest('/api/prices/mill', {
    millId: targetMill.millId,
    millName: targetMill.name,
    crop: 'Paddy',
    variety: 'Common',
    state: targetMill.state || 'Uttar Pradesh',
    district: targetMill.district || 'Ghazipur',
    offerPrice: 2500,
    unit: 'INR/quintal',
    requirementMT: 120
  });

  console.log('Offer Post Result:', offerRes);

  // Re-fetch nearby mills with prices
  const updated = await getRequest('/api/mills/nearby-with-prices?village=Gahmar&district=Ghazipur&state=Uttar%20Pradesh&crop=Paddy&variety=Common');
  const updatedMill = updated.mills.find(m => m.millId === targetMill.millId);

  console.log('\n=== UPDATED MILL CARD ===');
  console.log({
    name: updatedMill.name,
    offerPrice: updatedMill.offerPrice,
    msp: updated.msp.price,
    difference: updatedMill.offerPrice ? (updatedMill.offerPrice - updated.msp.price) : null,
    offerStatus: updatedMill.offerStatus,
    requirementMT: updatedMill.requirementMT
  });
}

testOfferReflection().catch(console.error);
