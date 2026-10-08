import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

async function testPassword() {
  await mongoose.connect(process.env.MONGODB_URI);

  const testPhone = '9335247487';
  const testPass = '9335247487';

  const user = await User.findOne({ phone: testPhone });
  console.log('User found by phone 9335247487:', user ? { id: user._id, name: user.name, phone: user.phone, role: user.role } : 'Not found');

  if (user) {
    const match = await bcrypt.compare(testPass, user.passwordHash);
    console.log(`Bcrypt compare for password "${testPass}":`, match);

    // Also check if password was 9353247487
    const matchAlt = await bcrypt.compare('9353247487', user.passwordHash);
    console.log(`Bcrypt compare for password "9353247487":`, matchAlt);
  }

  await mongoose.disconnect();
}

testPassword().catch(console.error);
