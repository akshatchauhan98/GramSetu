async function testUnauth() {
  const formData = new FormData();
  formData.append('language', 'hi');

  const res = await fetch('http://localhost:5000/api/ai/analyze-farm-image', {
    method: 'POST',
    body: formData
  });

  console.log(`📡 Unauth Status: ${res.status}`);
  const data = await res.json();
  console.log('📦 Unauth Data:', JSON.stringify(data));
}

testUnauth();
