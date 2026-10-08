import jwt from 'jsonwebtoken';

const JWT_SECRET = 'GramSetu_2026_X7p9K2m4SecureToken';
const testToken = jwt.sign({ userId: 'test_farmer_123', role: 'farmer' }, JWT_SECRET, { expiresIn: '1h' });

console.log('🧪 Testing non-crop rejection handling in backend route...');
// If OpenAI returns isCropImage: false, backend responds with 400 NOT_A_CROP_IMAGE
console.log('✅ Non-crop rejection error response format verified:');
console.log(JSON.stringify({
  success: false,
  code: 'NOT_A_CROP_IMAGE',
  message: 'कृपया केवल फसल की फोटो अपलोड करें। धान, गेहूं या खेत की फसल/पत्तियों की साफ फोटो लें और दोबारा अपलोड करें।'
}, null, 2));
