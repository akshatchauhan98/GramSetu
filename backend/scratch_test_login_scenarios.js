import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

import User from './models/User.js';
import { normalizeIndianMobile, isValidIndianMobile, isEmail } from './services/geocodingService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'gramsetu_secret';

// Helper function simulating the login handler logic
async function simulateLogin({ identifier, password, role }) {
  if (!identifier || !password) {
    return { status: 400, message: 'Email/mobile and password are required.' };
  }

  const rawIdentifier = String(identifier).trim();
  let user = null;
  let identifierType = 'mobile';
  let normalizedMobile = '';

  if (isEmail(rawIdentifier)) {
    identifierType = 'email';
    const normalizedEmail = rawIdentifier.toLowerCase();
    user = await User.findOne({ email: normalizedEmail });
  } else {
    identifierType = 'mobile';
    normalizedMobile = normalizeIndianMobile(rawIdentifier);

    if (!isValidIndianMobile(rawIdentifier)) {
      return { status: 400, message: 'Please enter a valid 10-digit mobile number.' };
    }

    user = await User.findOne({
      $or: [
        { phone: normalizedMobile },
        { phone: `+91${normalizedMobile}` },
        { phone: new RegExp(normalizedMobile + '$') }
      ]
    });
  }

  if (!user) {
    return { status: 401, message: 'Invalid email/mobile or password.' };
  }

  if (role && user.role !== role) {
    return { status: 403, message: `This account is registered as ${user.role}.` };
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatch) {
    return { status: 401, message: 'Invalid email/mobile or password.' };
  }

  const token = jwt.sign({ userId: user._id.toString(), role: user.role }, JWT_SECRET, { expiresIn: '7d' });
  const userResponse = user.toObject();
  delete userResponse.passwordHash;

  return {
    status: 200,
    success: true,
    token,
    user: { ...userResponse, id: user._id.toString() }
  };
}

async function runTests() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('=== RUNNING ALL 6 LOGIN TEST SCENARIOS ===\n');

  // TEST A: Mobile + correct password
  const resA = await simulateLogin({ identifier: '9335247487', password: '9335247487', role: 'farmer' });
  console.log('TEST A (Mobile 9335247487):', resA.status === 200 ? '✅ PASSED' : '❌ FAILED', resA.status, resA.user?.name || resA.message);

  // TEST B: Mobile with spaces & +91
  const resB = await simulateLogin({ identifier: '+91 9335 247 487', password: '9335247487', role: 'farmer' });
  console.log('TEST B (Mobile +91 9335 247 487):', resB.status === 200 ? '✅ PASSED' : '❌ FAILED', resB.status, resB.user?.name || resB.message);

  // TEST C: Email (case insensitive)
  const resC = await simulateLogin({ identifier: 'AyushiSing7819@Gmail.Com', password: '9335247487', role: 'farmer' });
  console.log('TEST C (Email AyushiSing7819@Gmail.Com):', resC.status === 200 ? '✅ PASSED' : '❌ FAILED', resC.status, resC.user?.name || resC.message);

  // TEST D: Correct identifier + wrong password
  const resD = await simulateLogin({ identifier: '9335247487', password: 'WrongPassword123', role: 'farmer' });
  console.log('TEST D (Wrong password):', resD.status === 401 && resD.message === 'Invalid email/mobile or password.' ? '✅ PASSED' : '❌ FAILED', resD.status, resD.message);

  // TEST E: Unknown mobile number
  const resE = await simulateLogin({ identifier: '9898989898', password: 'password123', role: 'farmer' });
  console.log('TEST E (Unknown mobile):', resE.status === 401 && resE.message === 'Invalid email/mobile or password.' ? '✅ PASSED' : '❌ FAILED', resE.status, resE.message);

  // TEST F: Invalid mobile format
  const resF = await simulateLogin({ identifier: '12345', password: 'password123', role: 'farmer' });
  console.log('TEST F (Invalid mobile format 12345):', resF.status === 400 && resF.message === 'Please enter a valid 10-digit mobile number.' ? '✅ PASSED' : '❌ FAILED', resF.status, resF.message);

  await mongoose.disconnect();
}

runTests().catch(console.error);
