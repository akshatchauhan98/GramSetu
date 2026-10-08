import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

console.log('Testing OpenAI API Direct Call...');
console.log('Key configured:', !!process.env.OPENAI_API_KEY);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testCall() {
  try {
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: 'Hello' }],
      max_tokens: 10
    });
    console.log('✅ OpenAI Response Received:', response.choices[0].message.content);
  } catch (err) {
    console.error('❌ OpenAI Error Raw Status:', err.status);
    console.error('❌ OpenAI Error Code:', err.code);
    console.error('❌ OpenAI Error Type:', err.type);
    console.error('❌ OpenAI Error Message:', err.message);
  }
}

testCall();
