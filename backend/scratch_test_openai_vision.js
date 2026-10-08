import fs from 'node:fs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'GramSetu_2026_X7p9K2m4SecureToken';
const testToken = jwt.sign({ userId: 'test_farmer_123', role: 'farmer' }, JWT_SECRET, { expiresIn: '1h' });

async function runVisionTest() {
  console.log('🧪 Starting OpenAI Vision API Test against GramSetu Backend...');

  // Create a minimal 1x1 green JPEG image buffer
  const sampleGreenJpeg = Buffer.from(
    '/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=',
    'base64'
  );

  const formData = new FormData();
  const blob = new Blob([sampleGreenJpeg], { type: 'image/jpeg' });
  formData.append('image', blob, 'test_crop.jpg');
  formData.append('language', 'hi');
  formData.append('crop', 'Paddy');
  formData.append('variety', 'Common');
  formData.append('village', 'Gahmar');
  formData.append('district', 'Ghazipur');
  formData.append('state', 'Uttar Pradesh');
  formData.append('sowingDate', '2026-06-15');
  formData.append('transplantingDate', '2026-07-10');

  try {
    const res = await fetch('http://localhost:5000/api/ai/analyze-farm-image', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${testToken}`
      },
      body: formData
    });

    console.log(`📡 Response Status: ${res.status}`);
    const data = await res.json();
    console.log('📦 Response Data:', JSON.stringify(data, null, 2));

  } catch (err) {
    console.error('❌ Test Execution Error:', err.message);
  }
}

runVisionTest();
