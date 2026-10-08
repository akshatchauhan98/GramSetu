import crypto from 'node:crypto';
import path from 'node:path';
import fs from 'node:fs';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import twilio from 'twilio';
import multer from 'multer';

import User from './models/User.js';
import Mill from './models/mill.js';
import Location from './models/Location.js';
import MSP from './models/MSP.js';
import Price from './models/Price.js';
import OpenAI from 'openai';
import { isEmail, normalizeIndianMobile, isValidIndianMobile } from './services/geocodingService.js';

dotenv.config();

const openaiApiKey = process.env.OPENAI_API_KEY;
console.log(`🤖 OpenAI API: ${openaiApiKey ? 'configured' : 'not configured'}`);
const openaiVisionModel = process.env.OPENAI_VISION_MODEL || 'gpt-4o-mini';
const openaiClient = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;


// =====================================================
// TWILIO VERIFY & SMS HELPERS
// =====================================================

let cachedVerifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID || 'VA3064b26b845b688f50a70ad178155ee7';

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    console.warn('⚠️ Twilio credentials missing from process.env');
    throw new Error('Twilio service is not configured on server.');
  }

  return twilio(accountSid, authToken);
}

function formatE164Phone(toPhone) {
  let formatted = String(toPhone).trim().replace(/\s+/g, '');
  if (!formatted.startsWith('+')) {
    const digitsOnly = formatted.replace(/\D/g, '');
    if (digitsOnly.length === 10) {
      formatted = `+91${digitsOnly}`;
    } else {
      formatted = `+${digitsOnly}`;
    }
  }
  return formatted;
}

async function getOrCreateVerifyServiceSid() {
  if (cachedVerifyServiceSid) return cachedVerifyServiceSid;

  const client = getTwilioClient();
  try {
    const services = await client.verify.v2.services.list({ limit: 10 });
    const existing = services.find(s => s.friendlyName === 'GramSetu Auth' || s.friendlyName === 'GramSetu');
    if (existing) {
      cachedVerifyServiceSid = existing.sid;
      return cachedVerifyServiceSid;
    }
    const created = await client.verify.v2.services.create({ friendlyName: 'GramSetu Auth' });
    cachedVerifyServiceSid = created.sid;
    return cachedVerifyServiceSid;
  } catch (err) {
    console.error('Error fetching/creating Twilio Verify service:', err.message);
    throw err;
  }
}

async function sendTwilioVerifyOtp(toPhone) {
  const client = getTwilioClient();
  const serviceSid = await getOrCreateVerifyServiceSid();
  const formattedTo = formatE164Phone(toPhone);

  return await client.verify.v2
    .services(serviceSid)
    .verifications.create({
      to: formattedTo,
      channel: 'sms'
    });
}

async function checkTwilioVerifyOtp(toPhone, code) {
  const client = getTwilioClient();
  const serviceSid = await getOrCreateVerifyServiceSid();
  const formattedTo = formatE164Phone(toPhone);

  return await client.verify.v2
    .services(serviceSid)
    .verificationChecks.create({
      to: formattedTo,
      code: String(code).trim()
    });
}


const app = express();

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  credentials: true
}));

app.use(express.json());
app.use(express.static(path.resolve('../frontend/public')));
app.use(express.static(path.resolve('../frontend/dist')));

// =====================================================
// CONFIGURATION
// =====================================================

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// =====================================================
// ENVIRONMENT CHECK
// =====================================================

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is missing from .env');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.error('❌ JWT_SECRET is missing from .env');
  process.exit(1);
}

// =====================================================
// AUTH MIDDLEWARE
// =====================================================

// Enable Mongoose query buffering so queries wait for connection
mongoose.set('bufferCommands', true);

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization || '';

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return res.status(401).json({
      message: 'Authentication token is required.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token.'
    });
  }
}

// =====================================================
// FALLBACK IN-MEMORY STORE (FOR OFFLINE / Atlas IP Issues)
// =====================================================
const fallbackUsers = new Map();

function saveToFallbackStore(userData) {
  if (userData.email) fallbackUsers.set(userData.email.toLowerCase(), userData);
  if (userData.phone) fallbackUsers.set(userData.phone.replace(/\D/g, ''), userData);
}

// Seed demo users in fallback store
(async () => {
  const defaultHash = await bcrypt.hash('password123', 10);
  const demoUser = {
    _id: 'mem_farmer_1',
    name: 'Ram Singh',
    email: 'farmer@gramsetu.com',
    phone: '9876543210',
    passwordHash: defaultHash,
    role: 'farmer',
    village: 'Rampur',
    district: 'Moradabad',
    state: 'Uttar Pradesh',
    crop: 'Paddy',
    toObject() { return { ...this }; },
    async save() {
      saveToFallbackStore(this);
      return this;
    }
  };
  saveToFallbackStore(demoUser);
})();

mongoose.connection.once('open', async () => {
  try {
    const mandiCount = await Price.countDocuments({ priceType: 'mandi' });
    if (mandiCount === 0) {
      console.log('🌱 Seeding initial AGMARKNET mandi records into gramsetu.prices...');
      await syncMandiPrices();
    }
  } catch (err) {
    console.warn('Auto-seed prices notice:', err.message);
  }
});

async function checkDbConnected(req, res, next) {
  if (mongoose.connection.readyState === 1) {
    return next();
  }
  try {
    let attempts = 0;
    while (mongoose.connection.readyState !== 1 && attempts < 10) {
      await new Promise(r => setTimeout(r, 300));
      attempts++;
    }
  } catch (e) {}
  next();
}

// =====================================================
// HEALTH CHECK
// =====================================================

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GramSetu backend is running',
    database:
      mongoose.connection.readyState === 1
        ? 'connected'
        : 'disconnected'
  });
});

// =====================================================
// AUTH - REGISTER
// =====================================================

app.post('/api/auth/register', checkDbConnected, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      role,
      village,
      district,
      state,
      city,
      pincode,
      crop,
      otherCrops,
      land,
      landUnit,
      irrigation,
      language
    } = req.body;

    const selectedRole = role || 'farmer';

    // -----------------------------------------------
    // Required fields
    // -----------------------------------------------

    if (!name || !password) {
      return res.status(400).json({
        message: 'Name and password are required.'
      });
    }

    if (!state) {
      return res.status(400).json({
        message: 'Please select a state.'
      });
    }

    if (!district) {
      return res.status(400).json({
        message: 'Please select a district.'
      });
    }

    if (!village) {
      return res.status(400).json({
        message: 'Please select a village.'
      });
    }

    // Farmer mobile number is mandatory
    if (selectedRole === 'farmer' && !phone) {
      return res.status(400).json({
        message: 'Mobile number is required for farmer registration.'
      });
    }

    // Mill/Government can use email or phone
    if (selectedRole !== 'farmer' && !email && !phone) {
      return res.status(400).json({
        message: 'Email or phone number is required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must contain at least 6 characters.'
      });
    }

    // -----------------------------------------------
    // Basic phone validation
    // -----------------------------------------------

    if (phone) {
      const cleanPhone = String(phone).replace(/\D/g, '');

      if (cleanPhone.length < 10) {
        return res.status(400).json({
          message: 'Please enter a valid mobile number.'
        });
      }
    }

    // -----------------------------------------------
    // Check existing user
    // -----------------------------------------------

    const conditions = [];

    if (email) {
      conditions.push({
        email: email.toLowerCase()
      });
    }

    if (phone) {
      conditions.push({
        phone
      });
    }

    const existingUser =
      conditions.length > 0
        ? await User.findOne({ $or: conditions })
        : null;

    if (existingUser) {
      return res.status(400).json({
        message: 'User with this email or phone already exists.'
      });
    }

    // -----------------------------------------------
    // Hash password
    // -----------------------------------------------

    const passwordHash = await bcrypt.hash(password, 10);

    // -----------------------------------------------
    // Create user
    // -----------------------------------------------

    const user = await User.create({
      name,

      email: email
        ? email.toLowerCase()
        : undefined,

      phone,

      passwordHash,

      role: selectedRole,

      village,
      district,
      state,
      city,
      pincode,

      crop,
      otherCrops,

      land,

      landUnit: landUnit || 'Acres',

      irrigation,

      language: language || 'hi',

      voiceEnabled: true,

      voiceSpeed: 'slow',

      // Notification preferences
      notifications: {
        sms: true,
        whatsapp: true,
        inApp: true,
        dailyMarketPrice: true,
        mspChange: true,
        voice: true
      },

      notificationLanguage: 'both',

      // Will become true after OTP verification
      phoneVerified: false
    });

    // -----------------------------------------------
    // Create JWT
    // -----------------------------------------------

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },

      JWT_SECRET,

      {
        expiresIn: '7d'
      }
    );

    // -----------------------------------------------
    // Remove password from response
    // -----------------------------------------------

    const userResponse = user.toObject();

    delete userResponse.passwordHash;

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    res.status(201).json({
      success: true,

      message: 'Account created successfully.',

      token,

      user: {
        ...userResponse,
        id: user._id.toString()
      }
    });

  } catch (error) {
    console.error('Register error:', error);

    res.status(500).json({
      message: 'Registration failed.',
      error: error.message
    });
  }
});

// =====================================================
// AUTH - LOGIN
// =====================================================

app.post('/api/auth/login', checkDbConnected, async (req, res) => {
  try {
    const {
      identifier,
      password,
      role
    } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        message: 'Email/mobile and password are required.'
      });
    }

    const rawIdentifier = String(identifier).trim();
    let user = null;
    let identifierType = 'mobile';
    let normalizedMobile = '';

    if (isEmail(rawIdentifier)) {
      identifierType = 'email';
      const normalizedEmail = rawIdentifier.toLowerCase();

      if (mongoose.connection.readyState === 1) {
        try {
          user = await User.findOne({ email: normalizedEmail });
        } catch (err) {
          console.warn('DB query error on login (email):', err.message);
        }
      }
      if (!user) {
        user = fallbackUsers.get(normalizedEmail);
      }
    } else {
      identifierType = 'mobile';
      normalizedMobile = normalizeIndianMobile(rawIdentifier);

      // Validate mobile format for 10-digit Indian numbers starting with 6-9
      if (!isValidIndianMobile(rawIdentifier)) {
        return res.status(400).json({
          message: 'Please enter a valid 10-digit mobile number.'
        });
      }

      if (mongoose.connection.readyState === 1) {
        try {
          user = await User.findOne({
            $or: [
              { phone: normalizedMobile },
              { phone: `+91${normalizedMobile}` },
              { phone: new RegExp(normalizedMobile + '$') }
            ]
          });
        } catch (err) {
          console.warn('DB query error on login (mobile):', err.message);
        }
      }
      if (!user) {
        user = fallbackUsers.get(normalizedMobile);
      }
    }

    // Safe Development Debugging Log (NEVER log password or passwordHash!)
    console.log({
      loginAttempt: true,
      identifierType,
      normalizedMobile: identifierType === 'mobile' ? normalizedMobile : undefined,
      userFound: Boolean(user),
      userRole: user ? user.role : undefined
    });

    if (!user) {
      return res.status(401).json({
        message: 'Invalid email/mobile or password.'
      });
    }

    // -----------------------------------------------
    // Check role
    // -----------------------------------------------

    if (role && user.role !== role) {
      return res.status(403).json({
        message: `This account is registered as ${user.role}.`
      });
    }

    // -----------------------------------------------
    // Check password
    // -----------------------------------------------

    const passwordMatch = await bcrypt.compare(
      password,
      user.passwordHash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: 'Invalid email/mobile or password.'
      });
    }

    // -----------------------------------------------
    // Create JWT
    // -----------------------------------------------

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        role: user.role
      },

      JWT_SECRET,

      {
        expiresIn: '7d'
      }
    );

    // -----------------------------------------------
    // Remove password
    // -----------------------------------------------

    const userResponse = typeof user.toObject === 'function' ? user.toObject() : { ...user };

    delete userResponse.passwordHash;

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    res.json({
      success: true,

      message: 'Login successful.',

      token,

      user: {
        ...userResponse,
        id: user._id.toString()
      }
    });

  } catch (error) {
    console.error('Login error:', error);

    res.status(500).json({
      message: 'GramSetu is temporarily unable to sign you in. Please try again.',
      error: error.message
    });
  }
});


// =====================================================
// AUTH - FORGOT PASSWORD (EMAIL)
// =====================================================

app.post('/api/auth/forgot-password', checkDbConnected, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: 'Please provide a valid email address.'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({ email: normalizedEmail });
      } catch (err) {
        console.warn('DB lookup failed, checking fallback store:', err.message);
      }
    }

    if (!user) {
      user = fallbackUsers.get(normalizedEmail);
    }

    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

      user.passwordResetToken = resetTokenHash;
      user.passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
      if (typeof user.save === 'function') {
        await user.save();
      }

      console.log(`🔑 [DEV MODE] Password Reset Token for ${user.email}: ${resetToken}`);
      console.log(`🔗 [DEV MODE] Reset Link: http://localhost:5173/reset-password?token=${resetToken}`);
    }

    res.json({
      success: true,
      message: 'If an account exists for this email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Forgot password email error:', error);
    res.status(500).json({
      message: 'Password recovery request failed.',
      error: error.message
    });
  }
});

// =====================================================
// AUTH - VERIFY RESET TOKEN
// =====================================================

app.post('/api/auth/verify-reset-token', checkDbConnected, async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        valid: false,
        message: 'Reset token is required.'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({
          passwordResetToken: tokenHash,
          passwordResetExpires: { $gt: new Date() }
        });
      } catch (err) {
        console.warn('DB lookup failed, checking fallback store:', err.message);
      }
    }

    if (!user) {
      for (const u of fallbackUsers.values()) {
        if (u.passwordResetToken === tokenHash && u.passwordResetExpires > new Date()) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return res.status(400).json({
        valid: false,
        message: 'Invalid or expired password reset token.'
      });
    }

    res.json({
      success: true,
      valid: true,
      message: 'Reset token is valid.'
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(500).json({
      valid: false,
      message: 'Unable to verify reset token.'
    });
  }
});

// =====================================================
// AUTH - RESET PASSWORD (EMAIL)
// =====================================================

app.post('/api/auth/reset-password', checkDbConnected, async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        message: 'Token and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters.'
      });
    }

    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({
          passwordResetToken: tokenHash,
          passwordResetExpires: { $gt: new Date() }
        });
      } catch (err) {
        console.warn('DB lookup failed, checking fallback store:', err.message);
      }
    }

    if (!user) {
      for (const u of fallbackUsers.values()) {
        if (u.passwordResetToken === tokenHash && u.passwordResetExpires > new Date()) {
          user = u;
          break;
        }
      }
    }

    if (!user) {
      return res.status(400).json({
        message: 'Invalid or expired password reset link. Please request a new one.'
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    if (typeof user.save === 'function') {
      await user.save();
    }

    res.json({
      success: true,
      message: 'Your password has been reset successfully. Please sign in with your new password.'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Password reset failed.',
      error: error.message
    });
  }
});

// =====================================================
// AUTH - FORGOT PASSWORD (MOBILE OTP)
// =====================================================

app.post('/api/auth/forgot-password-mobile', checkDbConnected, async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: 'Mobile number is required.'
      });
    }

    if (!isValidIndianMobile(phone)) {
      return res.status(400).json({
        message: 'Please enter a valid 10-digit mobile number.'
      });
    }

    const cleanPhone = normalizeIndianMobile(phone);
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({
          $or: [
            { phone: cleanPhone },
            { phone: `+91${cleanPhone}` },
            { phone: new RegExp(cleanPhone + '$') }
          ]
        });
      } catch (err) {
        console.warn('DB lookup failed, checking fallback store:', err.message);
      }
    }

    if (!user) {
      user = fallbackUsers.get(cleanPhone);
    }

    if (!user) {
      return res.json({
        success: true,
        message: 'If this mobile number is registered, a 6-digit OTP has been sent via SMS.'
      });
    }

    // Cryptographically secure 6-digit random OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    user.passwordResetOtp = otpHash;
    user.passwordResetOtpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 mins
    user.passwordResetOtpAttempts = 0;

    if (typeof user.save === 'function') {
      await user.save();
    }
    saveToFallbackStore(user);

    // Trigger Twilio Verify SMS
    try {
      await sendTwilioVerifyOtp(user.phone || cleanPhone);
      console.log(`✅ Twilio Verify SMS dispatched to mobile`);
    } catch (smsError) {
      console.error('Twilio Verify SMS delivery notice:', smsError.message, smsError.code);
      console.log(`🔑 [DEV MODE] Local OTP generated for mobile ${cleanPhone}: ${otp}`);
    }

    res.json({
      success: true,
      message: 'If this mobile number is registered, a 6-digit OTP has been sent via SMS.'
    });
  } catch (error) {
    console.error('Forgot password mobile error:', error);
    res.status(500).json({
      message: 'Unable to send OTP right now. Please try again.',
      error: error.message
    });
  }
});

// =====================================================
// AUTH - VERIFY RESET OTP (MOBILE)
// =====================================================

app.post('/api/auth/verify-reset-otp', checkDbConnected, async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Mobile number and OTP are required.'
      });
    }

    const cleanPhone = normalizeIndianMobile(phone);
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({
          $or: [
            { phone: cleanPhone },
            { phone: `+91${cleanPhone}` },
            { phone: new RegExp(cleanPhone + '$') }
          ]
        });
      } catch (err) {
        console.warn('DB lookup failed, checking fallback store:', err.message);
      }
    }

    if (!user) {
      user = fallbackUsers.get(cleanPhone);
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP. Please try again.'
      });
    }

    // Check Twilio Verify Service
    let isApproved = false;
    try {
      const check = await checkTwilioVerifyOtp(user.phone || cleanPhone, otp);
      if (check && check.status === 'approved') {
        isApproved = true;
      }
    } catch (verifyErr) {
      // Ignore Twilio error, fallback to local hash check
    }

    // Fallback check using local SHA-256 OTP hash
    if (!isApproved && user.passwordResetOtp && user.passwordResetOtpExpires) {
      if (new Date() > new Date(user.passwordResetOtpExpires)) {
        return res.status(400).json({
          success: false,
          message: 'OTP expired. Please request a new OTP.'
        });
      }

      if ((user.passwordResetOtpAttempts || 0) >= 5) {
        user.passwordResetOtp = undefined;
        user.passwordResetOtpExpires = undefined;
        if (typeof user.save === 'function') await user.save();
        return res.status(400).json({
          success: false,
          message: 'Maximum failed OTP attempts reached. Please request a new OTP.'
        });
      }

      const inputHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
      if (inputHash === user.passwordResetOtp) {
        isApproved = true;
      } else {
        user.passwordResetOtpAttempts = (user.passwordResetOtpAttempts || 0) + 1;
        if (typeof user.save === 'function') await user.save();
        return res.status(400).json({
          success: false,
          message: `Incorrect OTP. Please try again. (${5 - user.passwordResetOtpAttempts} attempts remaining)`
        });
      }
    }

    if (!isApproved) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect OTP. Please try again.'
      });
    }

    return res.json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify OTP.',
      error: error.message
    });
  }
});


// =====================================================
// AUTH - RESET PASSWORD (MOBILE OTP)
// =====================================================

app.post('/api/auth/reset-password-mobile', checkDbConnected, async (req, res) => {
  try {
    const { phone, otp, newPassword } = req.body;

    if (!phone || !otp || !newPassword) {
      return res.status(400).json({
        message: 'Mobile number, OTP, and new password are required.'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        message: 'Password must contain at least 8 characters.'
      });
    }

    const cleanPhone = normalizeIndianMobile(phone);
    let user = null;

    if (mongoose.connection.readyState === 1) {
      try {
        user = await User.findOne({
          $or: [
            { phone: cleanPhone },
            { phone: `+91${cleanPhone}` },
            { phone: new RegExp(cleanPhone + '$') }
          ]
        });
      } catch (err) {
        console.warn('DB lookup failed, checking fallback store:', err.message);
      }
    }

    if (!user) {
      user = fallbackUsers.get(cleanPhone);
    }

    if (!user) {
      return res.status(400).json({
        message: 'Invalid request or user not found.'
      });
    }

    // Step A: Check Twilio Verify Service
    let isApproved = false;
    try {
      const check = await checkTwilioVerifyOtp(user.phone || phone, otp);
      if (check && check.status === 'approved') {
        isApproved = true;
      }
    } catch (verifyErr) {
      console.warn('Twilio Verify Check notice:', verifyErr.message);
    }

    // Step B: Fallback check using local SHA-256 OTP hash if active
    if (!isApproved && user.passwordResetOtp && user.passwordResetOtpExpires) {
      if (new Date() <= new Date(user.passwordResetOtpExpires) && (user.passwordResetOtpAttempts || 0) < 5) {
        const inputHash = crypto.createHash('sha256').update(String(otp).trim()).digest('hex');
        if (inputHash === user.passwordResetOtp) {
          isApproved = true;
        } else {
          user.passwordResetOtpAttempts = (user.passwordResetOtpAttempts || 0) + 1;
          if (typeof user.save === 'function') await user.save();
        }
      }
    }

    if (!isApproved) {
      return res.status(400).json({
        message: 'Invalid or expired OTP. Please try again.'
      });
    }

    // Update password with bcrypt hash
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;
    user.passwordResetOtp = undefined;
    user.passwordResetOtpExpires = undefined;
    user.passwordResetOtpAttempts = 0;

    if (typeof user.save === 'function') {
      await user.save();
    }
    saveToFallbackStore(user);

    res.json({
      success: true,
      message: 'Your password has been reset successfully. Please sign in with your new password.'
    });
  } catch (error) {
    console.error('Reset password mobile error:', error);
    res.status(500).json({
      message: 'Password reset failed.',
      error: error.message
    });
  }
});

// =====================================================
// AUTH - CURRENT USER
// =====================================================

app.get(
  '/api/auth/me',
  checkDbConnected,
  authenticateToken,
  async (req, res) => {
    try {
      let user = null;

      if (mongoose.connection.readyState === 1) {
        try {
          user = await User.findById(req.userId).select('-passwordHash');
        } catch (dbErr) {
          console.warn('DB error in /api/auth/me:', dbErr.message);
        }
      }

      if (!user) {
        for (const u of fallbackUsers.values()) {
          const uId = u._id ? u._id.toString() : (u.id || '');
          if (uId === req.userId) {
            user = u;
            break;
          }
        }
      }

      if (!user) {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      const userResponse = typeof user.toObject === 'function' ? user.toObject() : { ...user };
      delete userResponse.passwordHash;

      res.json({
        success: true,
        user: {
          ...userResponse,
          id: user._id ? user._id.toString() : user.id
        }
      });

    } catch (error) {
      console.error('Get user error:', error);

      res.status(500).json({
        message: 'Unable to get user profile.'
      });
    }
  }
);


// =====================================================
// MSP - MINIMUM SUPPORT PRICE ENDPOINTS
// =====================================================

// GET /api/msp - Fetch all MSP records (with optional query filters: season, marketingSeason, crop)
app.get('/api/msp', checkDbConnected, async (req, res) => {
  try {
    const { season, marketingSeason, crop } = req.query;
    const filter = {};

    if (season) {
      filter.season = new RegExp(`^${season.trim()}$`, 'i');
    }
    if (marketingSeason) {
      filter.marketingSeason = new RegExp(`^${marketingSeason.trim()}$`, 'i');
    }
    if (crop) {
      const searchRegex = new RegExp(crop.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      filter.$or = [
        { crop: searchRegex },
        { cropAliases: searchRegex }
      ];
    }

    let records = [];
    if (mongoose.connection.readyState === 1) {
      records = await MSP.find(filter).sort({ crop: 1 });
    }

    return res.json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    console.error('Get MSP error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch MSP records.',
      error: error.message
    });
  }
});

// GET /api/msp/:crop - Search MSP records by crop name or crop alias
app.get('/api/msp/:crop', checkDbConnected, async (req, res) => {
  try {
    const rawCropParam = req.params.crop ? decodeURIComponent(req.params.crop).trim() : '';

    if (!rawCropParam) {
      return res.status(400).json({
        success: false,
        message: 'Crop parameter is required.'
      });
    }

    const escapedParam = rawCropParam.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const searchRegex = new RegExp(escapedParam, 'i');

    let records = [];

    if (mongoose.connection.readyState === 1) {
      records = await MSP.find({
        $or: [
          { crop: searchRegex },
          { cropAliases: searchRegex }
        ]
      }).sort({ crop: 1 });
    }

    if (!records || records.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'MSP data not available for this crop'
      });
    }

    return res.json({
      success: true,
      count: records.length,
      query: rawCropParam,
      data: records
    });
  } catch (error) {
    console.error('Get MSP by crop error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch MSP data for the specified crop.',
      error: error.message
    });
  }
});


// =====================================================
// PRICES API ENDPOINTS (MANDI, MILL OFFERS, COMPARISON)
// =====================================================

// GET /api/prices/mandi - Retrieve APMC Mandi prices with location and crop filters
app.get('/api/prices/mandi', checkDbConnected, async (req, res) => {
  try {
    const { state, district, market, crop, variety, date } = req.query;
    const filter = { priceType: 'mandi' };

    if (state) filter.state = new RegExp(`^${state.trim()}$`, 'i');
    if (district) filter.district = new RegExp(`^${district.trim()}$`, 'i');
    if (market) filter.market = new RegExp(`^${market.trim()}$`, 'i');
    if (crop) filter.crop = new RegExp(crop.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (variety) filter.variety = new RegExp(`^${variety.trim()}$`, 'i');
    if (date) filter.priceDate = date.trim();

    const records = await Price.find(filter).sort({ priceDate: -1, district: 1 });

    return res.json({
      success: true,
      count: records.length,
      lastSuccessfulSyncAt: new Date().toISOString(),
      data: records
    });
  } catch (error) {
    console.error('Get Mandi prices error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch Mandi price records.',
      error: error.message
    });
  }
});

// GET /api/prices/mill - Retrieve submitted mill offer prices
app.get('/api/prices/mill', checkDbConnected, async (req, res) => {
  try {
    const { millId, crop, district, state, date } = req.query;
    const filter = { priceType: 'mill' };

    if (millId) filter.millId = millId;
    if (crop) filter.crop = new RegExp(crop.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (district) filter.district = new RegExp(`^${district.trim()}$`, 'i');
    if (state) filter.state = new RegExp(`^${state.trim()}$`, 'i');
    if (date) filter.priceDate = date.trim();

    const records = await Price.find(filter).sort({ priceDate: -1 }).populate('millId', 'name district state phone email');

    const now = new Date();
    const formattedRecords = records.map(r => {
      const obj = r.toObject ? r.toObject() : { ...r };
      const offerDate = new Date(obj.priceDate);
      const diffDays = (now - offerDate) / (1000 * 60 * 60 * 24);
      obj.freshness = diffDays <= 7 ? 'Active / Fresh' : 'Mill offer needs update';
      return obj;
    });

    return res.json({
      success: true,
      count: formattedRecords.length,
      data: formattedRecords
    });
  } catch (error) {
    console.error('Get Mill prices error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch Mill offer records.',
      error: error.message
    });
  }
});

// GET /api/prices/mill - Retrieve active submitted mill offer prices
app.get('/api/prices/mill', checkDbConnected, async (req, res) => {
  try {
    const { millId, crop, district, state, date, status } = req.query;
    const filter = { priceType: 'mill' };

    if (status && status !== 'all') {
      filter.status = status;
    } else if (!status) {
      filter.status = 'active';
    }

    if (millId) filter.millId = millId;
    if (crop) filter.crop = new RegExp(crop.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    if (district) filter.district = new RegExp(`^${district.trim()}$`, 'i');
    if (state) filter.state = new RegExp(`^${state.trim()}$`, 'i');
    if (date) filter.priceDate = date.trim();

    const records = await Price.find(filter).sort({ priceDate: -1, offerPrice: -1 }).populate('millId', 'name district state phone email');

    const now = new Date();
    const formattedRecords = records.map(r => {
      const obj = r.toObject ? r.toObject() : { ...r };
      const offerDate = new Date(obj.priceDate);
      const diffDays = (now - offerDate) / (1000 * 60 * 60 * 24);
      obj.freshness = diffDays <= 7 ? 'Active / Fresh' : 'Mill offer needs update';
      return obj;
    });

    return res.json({
      success: true,
      count: formattedRecords.length,
      data: formattedRecords
    });
  } catch (error) {
    console.error('Get Mill prices error:', error);
    return res.status(500).json({
      success: false,
      message: 'Unable to fetch Mill offer records.',
      error: error.message
    });
  }
});

// POST /api/prices/mill - Authenticated endpoint for mill users to submit/update an offer
app.post('/api/prices/mill', authenticateToken, checkDbConnected, async (req, res) => {
  try {
    const { millId, crop, variety, offerPrice, unit } = req.body;

    if (!millId || !crop || offerPrice === undefined || offerPrice === null) {
      return res.status(400).json({
        success: false,
        message: 'millId, crop, and offerPrice are required.'
      });
    }

    const numOfferPrice = Number(offerPrice);
    if (isNaN(numOfferPrice) || numOfferPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'offerPrice must be a positive number greater than zero.'
      });
    }

    const mill = await Mill.findById(millId);
    if (!mill) {
      return res.status(404).json({
        success: false,
        message: 'Referenced mill does not exist.'
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    const priceDoc = await Price.findOneAndUpdate(
      {
        priceType: 'mill',
        millId: mill._id,
        crop: crop.trim(),
        variety: (variety || 'Common').trim()
      },
      {
        $set: {
          priceType: 'mill',
          millId: mill._id,
          millName: mill.name,
          crop: crop.trim(),
          variety: (variety || 'Common').trim(),
          state: mill.state || 'Uttar Pradesh',
          district: mill.district || 'Ghazipur',
          offerPrice: numOfferPrice,
          unit: unit || 'INR/quintal',
          priceDate: todayStr,
          status: 'active',
          source: 'Mill submitted offer',
          verified: false
        }
      },
      { new: true, upsert: true }
    );

    return res.json({
      success: true,
      message: 'Mill offer submitted successfully.',
      data: priceDoc
    });
  } catch (error) {
    console.error('Submit mill offer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to submit mill offer.',
      error: error.message
    });
  }
});

// PUT /api/prices/mill/:priceId - Authenticated endpoint for mill users to update an offer
app.put('/api/prices/mill/:priceId', authenticateToken, checkDbConnected, async (req, res) => {
  try {
    const { priceId } = req.params;
    const { offerPrice } = req.body;

    const numOfferPrice = Number(offerPrice);
    if (isNaN(numOfferPrice) || numOfferPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'offerPrice must be a positive number greater than zero.'
      });
    }

    const priceDoc = await Price.findByIdAndUpdate(
      priceId,
      {
        $set: {
          offerPrice: numOfferPrice,
          priceDate: new Date().toISOString().split('T')[0],
          status: 'active'
        }
      },
      { new: true }
    );

    if (!priceDoc) {
      return res.status(404).json({
        success: false,
        message: 'Mill offer not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Mill offer updated successfully.',
      data: priceDoc
    });
  } catch (error) {
    console.error('Update mill offer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update mill offer.',
      error: error.message
    });
  }
});

// DELETE /api/prices/mill/:priceId - Authenticated endpoint for mill users to deactivate an offer
app.delete('/api/prices/mill/:priceId', authenticateToken, checkDbConnected, async (req, res) => {
  try {
    const { priceId } = req.params;

    const priceDoc = await Price.findByIdAndUpdate(
      priceId,
      {
        $set: {
          status: 'inactive'
        }
      },
      { new: true }
    );

    if (!priceDoc) {
      return res.status(404).json({
        success: false,
        message: 'Mill offer not found.'
      });
    }

    return res.json({
      success: true,
      message: 'Mill offer deactivated successfully.',
      data: priceDoc
    });
  } catch (error) {
    console.error('Deactivate mill offer error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to deactivate mill offer.',
      error: error.message
    });
  }
});

// GET /api/prices/compare - Combined comparison endpoint (MSP vs Mandi vs Mill Offer)
app.get('/api/prices/compare', checkDbConnected, async (req, res) => {
  try {
    const { crop, state, district } = req.query;
    const searchCrop = (crop || 'Paddy').trim();
    const searchState = (state || 'Uttar Pradesh').trim();
    const searchDistrict = (district || '').trim();

    // 1. Fetch Government MSP from gramsetu.msp
    const searchRegex = new RegExp(searchCrop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const mspDoc = await MSP.findOne({
      $or: [
        { crop: searchRegex },
        { cropAliases: searchRegex }
      ]
    });

    // 2. Fetch Mandi Price from gramsetu.prices (priceType: 'mandi')
    const cropRegex = new RegExp(searchCrop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const mandiFilter = { priceType: 'mandi', crop: cropRegex };
    if (searchDistrict) mandiFilter.district = new RegExp(`^${searchDistrict}$`, 'i');
    if (searchState) mandiFilter.state = new RegExp(`^${searchState}$`, 'i');

    const mandiDoc = await Price.findOne(mandiFilter).sort({ priceDate: -1 });

    // 3. Fetch active Mill Offers from gramsetu.prices (priceType: 'mill', status: 'active')
    const millFilter = { priceType: 'mill', status: 'active', crop: cropRegex };
    if (searchDistrict) millFilter.district = new RegExp(`^${searchDistrict}$`, 'i');

    const millOffers = await Price.find(millFilter).sort({ offerPrice: -1, priceDate: -1 }).populate('millId', 'name district state').limit(5);

    return res.json({
      success: true,
      crop: mspDoc ? mspDoc.crop : searchCrop,
      msp: mspDoc ? {
        price: mspDoc.mspPerQuintal,
        unit: mspDoc.unit || 'INR/quintal',
        season: mspDoc.season,
        marketingSeason: mspDoc.marketingSeason,
        source: mspDoc.source,
        sourceUrl: mspDoc.sourceUrl
      } : null,
      mandi: mandiDoc ? {
        modalPrice: mandiDoc.modalPrice,
        minPrice: mandiDoc.minPrice,
        maxPrice: mandiDoc.maxPrice,
        market: mandiDoc.market,
        district: mandiDoc.district,
        state: mandiDoc.state,
        date: mandiDoc.priceDate,
        source: mandiDoc.source,
        sourceUrl: mandiDoc.sourceUrl
      } : null,
      millOffers: millOffers.map(m => {
        const millObj = m.millId && typeof m.millId === 'object' ? m.millId : null;
        return {
          millId: millObj ? millObj._id : m.millId,
          millName: m.millName || (millObj ? millObj.name : 'Registered UP Exporter/Mill'),
          offerPrice: m.offerPrice,
          unit: m.unit,
          date: m.priceDate,
          district: m.district || (millObj ? millObj.district : ''),
          source: m.source || 'Mill submitted offer'
        };
      })
    });
  } catch (error) {
    console.error('Compare prices error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve price comparison data.',
      error: error.message
    });
  }
});

// =====================================================
// LOCATIONS - GET ALL STATES & UTs
// =====================================================

app.get('/api/locations/states', checkDbConnected, async (req, res) => {
  try {
    const states = await Location.distinct('state');
    states.sort();

    res.json({
      success: true,
      count: states.length,
      states
    });
  } catch (error) {
    console.error('Get states error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch states.',
      error: error.message
    });
  }
});

// =====================================================
// LOCATIONS - GET DISTRICTS BY STATE
// =====================================================

app.get('/api/locations/districts/:state', checkDbConnected, async (req, res) => {
  try {
    const stateName = decodeURIComponent(req.params.state).trim();

    const districts = await Location.distinct('district', {
      state: { $regex: `^${stateName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    });

    districts.sort();

    res.json({
      success: true,
      state: stateName,
      count: districts.length,
      districts
    });
  } catch (error) {
    console.error('Get districts error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch districts.',
      error: error.message
    });
  }
});

// =====================================================
// LOCATIONS - GET VILLAGES BY STATE AND DISTRICT
// =====================================================

app.get('/api/locations/villages/:state/:district', checkDbConnected, async (req, res) => {
  try {
    const stateName = decodeURIComponent(req.params.state).trim();
    const districtName = decodeURIComponent(req.params.district).trim();
    const searchQuery = String(req.query.q || '').trim();

    const filter = {
      state: { $regex: `^${stateName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      district: { $regex: `^${districtName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
    };

    if (searchQuery) {
      filter.village = { $regex: searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' };
    }

    const villages = await Location.distinct('village', filter);
    villages.sort();

    res.json({
      success: true,
      state: stateName,
      district: districtName,
      count: villages.length,
      villages
    });
  } catch (error) {
    console.error('Get villages error:', error);
    res.status(500).json({
      success: false,
      message: 'Unable to fetch villages.',
      error: error.message
    });
  }
});

// =====================================================
// AUTH - UPDATE PROFILE
// =====================================================

app.put(
  '/api/auth/profile',
  checkDbConnected,
  authenticateToken,
  async (req, res) => {
    try {

      const allowedFields = [
        'name',
        'phone',
        'village',
        'district',
        'state',
        'city',
        'pincode',
        'crop',
        'otherCrops',
        'land',
        'landUnit',
        'irrigation',
        'language',
        'voiceEnabled',
        'voiceSpeed',
        'notifications',
        'notificationLanguage'
      ];

      const updates = {};

      allowedFields.forEach((field) => {

        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }

      });

      // If phone number changes,
      // it must be verified again.
      if (
        updates.phone !== undefined &&
        updates.phone !== ''
      ) {
        updates.phoneVerified = false;
      }

      const user = await User.findByIdAndUpdate(
        req.userId,

        updates,

        {
          new: true,
          runValidators: true
        }
      ).select('-passwordHash');

      if (!user) {
        return res.status(404).json({
          message: 'User not found.'
        });
      }

      res.json({
        success: true,

        message: 'Profile updated successfully.',

        user: {
          ...user.toObject(),
          id: user._id.toString()
        }
      });

    } catch (error) {
      console.error('Profile update error:', error);

      res.status(500).json({
        message: 'Profile update failed.',
        error: error.message
      });
    }
  }
);

// =====================================================
// AUTH - LOGOUT
// =====================================================

app.post(
  '/api/auth/logout',
  authenticateToken,
  (req, res) => {

    // JWT is stateless.
    // Frontend removes the token during logout.

    res.json({
      success: true,
      message: 'Logged out successfully.'
    });

  }
);

// =====================================================
// PRICE - TODAY
// =====================================================

app.get('/api/prices/today', (req, res) => {

  res.json({
    success: true,

    crop: 'Paddy',

    msp: 2203,

    mandiRate: 2150,

    millRate: 2180,

    fairPrice: 2150
  });

});

// =====================================================
// PRICE - BROKER CHECKER
// =====================================================

app.post('/api/prices/check-broker', (req, res) => {

  // Accept both frontend names and backend names
  const brokerPrice =
    Number(
      req.body.brokerPrice ??
      req.body.brokerOffer ??
      1800
    );

  const qty =
    Number(
      req.body.qty ??
      req.body.quantity ??
      50
    );

  const fairPrice =
    Number(
      req.body.fairPrice ??
      2150
    );

  // -----------------------------------------------
  // Calculate price gap
  // -----------------------------------------------

  const gap = fairPrice - brokerPrice;

  // -----------------------------------------------
  // Calculate loss percentage
  // -----------------------------------------------

  const lossPercentage =
    fairPrice > 0
      ? Number(
          ((gap / fairPrice) * 100).toFixed(1)
        )
      : 0;

  // -----------------------------------------------
  // Calculate total loss
  // -----------------------------------------------

  const totalLoss = gap * qty;

  // -----------------------------------------------
  // Alert level
  // -----------------------------------------------

  let alertLevel = 'SAFE';

  if (lossPercentage >= 15) {
    alertLevel = 'RED';
  } else if (lossPercentage >= 5) {
    alertLevel = 'WARNING';
  }

  // -----------------------------------------------
  // Response
  // -----------------------------------------------

  res.json({
    success: true,

    brokerPrice,

    fairPrice,

    gap,

    lossPercentage,

    totalLoss,

    qty,

    alertLevel
  });

});

// =====================================================
// VILLAGE DATA
// =====================================================

app.get('/api/village', (req, res) => {

  res.json({
    success: true,

    id: 'rampur-01',

    name: 'Rampur',

    district: 'Moradabad',

    state: 'Uttar Pradesh',

    areaHectares: 202.98,

    ndvi: 0.74,

    estimatedYieldTonnes: 480
  });

});

async function getAllMillsHelper() {
  let mills = [];
  if (mongoose.connection.readyState === 1) {
    try {
      mills = await Mill.find({}).sort({ name: 1 }).lean();
    } catch (err) {
      console.warn('MongoDB mills query error, falling back to JSON:', err.message);
    }
  }

  if (!mills || mills.length === 0) {
    try {
      const jsonPath = path.resolve('./gramsetu_mills.json');
      const altJsonPath = path.resolve('../gramsetu_mills.json');
      const targetPath = fs.existsSync(jsonPath) ? jsonPath : (fs.existsSync(altJsonPath) ? altJsonPath : null);

      if (targetPath) {
        const raw = fs.readFileSync(targetPath, 'utf8');
        mills = JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed to load fallback mills JSON:', e.message);
    }
  }
  return mills || [];
}

// =====================================================
// MILLS - COMBINED NEARBY WITH PRICES & MSP
// =====================================================

app.get('/api/mills/nearby-with-prices', checkDbConnected, async (req, res) => {
  try {
    let farmerVillage = (req.query.village || '').trim();
    let farmerDistrict = (req.query.district || '').trim();
    let farmerState = (req.query.state || '').trim();

    // Check optional auth token for user profile location if query is missing
    const authHeader = req.headers.authorization || '';
    if (authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.userId) {
          const u = await User.findById(decoded.userId).lean();
          if (u) {
            if (!farmerVillage && u.village) farmerVillage = u.village;
            if (!farmerDistrict && u.district) farmerDistrict = u.district;
            if (!farmerState && u.state) farmerState = u.state;
          }
        }
      } catch (e) {
        // Ignore token error, use query params
      }
    }

    // Default location to Gahmar, Ghazipur if completely empty for consistent demo/test
    if (!farmerVillage && !farmerDistrict) {
      farmerVillage = 'Gahmar';
      farmerDistrict = 'Ghazipur';
      farmerState = 'Uttar Pradesh';
    }

    const searchCrop = (req.query.crop || 'Paddy').trim();
    const searchVariety = (req.query.variety || 'Common').trim();
    const radiusKm = req.query.radiusKm ? parseFloat(req.query.radiusKm) : null;

    // 1. Resolve Farmer Village Coordinates (origin)
    const farmerGeo = await resolveFarmerVillageCoordinates({
      village: farmerVillage,
      district: farmerDistrict,
      state: farmerState
    });

    // 2. Fetch official Government MSP for selected crop
    const searchRegex = new RegExp(searchCrop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const mspDoc = await MSP.findOne({
      $or: [
        { crop: searchRegex },
        { cropAliases: searchRegex }
      ]
    }).lean();

    // 3. Load all candidate mills from database
    const allMills = await Mill.find({}).lean();

    // 4. For each mill, calculate real straight-line distance & fetch active offer
    const processedMills = await Promise.all(
      allMills.map(async (m) => {
        let dist = null;
        let distAvailable = false;
        let distType = null;

        // Calculate straight-line distance if both farmer & mill coordinates exist
        if (farmerGeo.latitude != null && farmerGeo.longitude != null && m.latitude != null && m.longitude != null) {
          dist = calculateDistanceKm(farmerGeo.latitude, farmerGeo.longitude, m.latitude, m.longitude);
          if (dist !== null) {
            distAvailable = true;
            distType = 'straight-line';
          }
        }

        // Fetch live active price offer from gramsetu.prices
        const cropFilter = new RegExp(searchCrop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const offerDoc = await Price.findOne({
          priceType: 'mill',
          $or: [
            { millId: m._id },
            { millName: m.name }
          ],
          crop: cropFilter,
          $or: [
            { status: 'active' },
            { isActive: true }
          ]
        }).sort({ priceDate: -1, createdAt: -1 }).lean();

        const hasOffer = offerDoc && offerDoc.offerPrice > 0;
        const offerPrice = hasOffer ? offerDoc.offerPrice : null;
        const mspPrice = mspDoc ? mspDoc.mspPerQuintal : null;
        const diffFromMsp = (hasOffer && mspPrice > 0) ? (offerPrice - mspPrice) : null;

        const reqMT = (m.availableQuantityMT != null && !isNaN(Number(m.availableQuantityMT)))
          ? Number(m.availableQuantityMT)
          : null;

        return {
          millId: m._id,
          name: m.name || 'Processing Mill',
          village: m.village || '',
          tehsil: m.tehsil || '',
          district: m.district || farmerDistrict,
          state: m.state || farmerState,
          address: m.address || `${m.district || ''}, ${m.state || ''}`,
          latitude: m.latitude || null,
          longitude: m.longitude || null,
          distanceKm: dist,
          distanceType: distType,
          distanceAvailable: distAvailable,
          locationVerified: m.locationVerified || false,
          locationSource: m.locationSource || null,
          crop: searchCrop,
          variety: searchVariety,
          msp: mspPrice,
          requirementMT: reqMT,
          offerPrice,
          unit: hasOffer ? (offerDoc.unit || 'INR/quintal') : 'INR/quintal',
          offerStatus: hasOffer ? 'active' : 'unavailable',
          priceDate: hasOffer ? offerDoc.priceDate : null,
          differenceFromMsp: diffFromMsp,
          verificationSource: hasOffer ? (offerDoc.source || 'Mill submitted offer') : (m.verificationSource || 'Existing GramSetu mill master'),
          phone: Array.isArray(m.phone) ? m.phone : (m.phone ? [m.phone] : []),
          email: Array.isArray(m.email) ? m.email : (m.email ? [m.email] : [])
        };
      })
    );

    // 5. Separate into verified distance mills & unavailable distance mills
    let verifiedDistanceMills = processedMills.filter(m => m.distanceAvailable);
    const unavailableDistanceMills = processedMills.filter(m => !m.distanceAvailable);

    // Optional radiusKm filter for verified mills if radiusKm was specified
    if (radiusKm && !isNaN(radiusKm)) {
      verifiedDistanceMills = verifiedDistanceMills.filter(m => m.distanceKm <= radiusKm);
    }

    // Sort verified mills strictly by distanceKm ASC (nearest first: 2.1 km, 4.8 km, 7.6 km...)
    verifiedDistanceMills.sort((a, b) => a.distanceKm - b.distanceKm);

    // Combine: verified nearest mills first, followed by mills with unavailable distance
    const finalMillsList = [...verifiedDistanceMills, ...unavailableDistanceMills];

    return res.json({
      success: true,
      location: {
        village: farmerVillage,
        district: farmerDistrict,
        state: farmerState,
        latitude: farmerGeo.latitude,
        longitude: farmerGeo.longitude,
        resolved: farmerGeo.resolved
      },
      crop: {
        name: searchCrop,
        variety: searchVariety
      },
      msp: mspDoc ? {
        price: mspDoc.mspPerQuintal,
        unit: mspDoc.unit || 'INR/quintal',
        season: mspDoc.season,
        marketingSeason: mspDoc.marketingSeason,
        source: mspDoc.source,
        sourceUrl: mspDoc.sourceUrl
      } : null,
      totalMills: finalMillsList.length,
      mills: finalMillsList
    });
  } catch (error) {
    console.error('Error fetching nearby mills with prices:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch nearby mills with prices'
    });
  }
});

// =====================================================
// MILLS - GET ALL MILLS
// =====================================================

app.get(
  '/api/mills',
  checkDbConnected,
  async (req, res) => {
    try {
      const mills = await getAllMillsHelper();

      res.json({
        success: true,
        count: mills.length,
        mills
      });
    } catch (error) {
      console.error('Get mills error:', error);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch mills.',
        error: error.message
      });
    }
  }
);

// =====================================================
// MILLS - GET BY STATE
// =====================================================

app.get(
  '/api/mills/state/:state',
  checkDbConnected,
  async (req, res) => {
    try {
      const stateName = req.params.state.trim().toLowerCase();
      const allMills = await getAllMillsHelper();
      const mills = allMills.filter(m => (m.state || '').toLowerCase() === stateName);

      res.json({
        success: true,
        count: mills.length,
        mills
      });
    } catch (error) {
      console.error('Get mills by state error:', error);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch mills.',
        error: error.message
      });
    }
  }
);

// =====================================================
// MILLS - GET BY DISTRICT
// =====================================================

app.get(
  '/api/mills/district/:district',
  checkDbConnected,
  async (req, res) => {
    try {
      const districtName = req.params.district.trim().toLowerCase();
      const allMills = await getAllMillsHelper();
      const mills = allMills.filter(m => (m.district || '').toLowerCase() === districtName);

      res.json({
        success: true,
        count: mills.length,
        mills
      });
    } catch (error) {
      console.error('Get mills by district error:', error);
      res.status(500).json({
        success: false,
        message: 'Unable to fetch mills.',
        error: error.message
      });
    }
  }
);

// =====================================================
// MILLS - SEARCH
// =====================================================

app.get(
  '/api/mills/search',
  checkDbConnected,
  async (req, res) => {

    try {

      const search =
        String(req.query.q || '').trim();

      if (!search) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required.'
        });
      }

      const mills = await Mill.find({
        $or: [

          {
            name: {
              $regex: search,
              $options: 'i'
            }
          },

          {
            district: {
              $regex: search,
              $options: 'i'
            }
          },

          {
            state: {
              $regex: search,
              $options: 'i'
            }
          },

          {
            crops: {
              $regex: search,
              $options: 'i'
            }
          }

        ]
      })
        .sort({ name: 1 })
        .limit(100)
        .lean();

      res.json({
        success: true,
        count: mills.length,
        mills
      });

    } catch (error) {

      console.error(
        'Search mills error:',
        error
      );

      res.status(500).json({
        success: false,
        message: 'Unable to search mills.',
        error: error.message
      });

    }

  }
);

// =====================================================
// AI VISION - FARM PHOTO ANALYSIS ENDPOINT
// =====================================================

const uploadMemory = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
  fileFilter: (req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) {
      return cb(new Error('INVALID_FILE_TYPE'));
    }
    cb(null, true);
  }
});

app.post('/api/ai/analyze-farm-image', authenticateToken, (req, res) => {
  console.log('[AI IMAGE] Request received');

  uploadMemory.single('image')(req, res, async (err) => {
    const reqLang = req.body?.language || 'hi';
    const isHi = reqLang === 'hi';

    if (err) {
      console.warn('[AI IMAGE] Upload middleware error:', err.code || err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          code: 'FILE_TOO_LARGE',
          message: isHi ? 'फोटो बहुत बड़ी है। कृपया 10 MB से छोटी फोटो चुनें।' : 'Photo size must be less than 10 MB.'
        });
      }
      return res.status(400).json({
        success: false,
        code: 'INVALID_IMAGE',
        message: isHi ? 'केवल JPG, PNG, या WEBP फोटो प्रारूप समर्थित हैं।' : 'Only JPG, PNG, or WEBP image formats are supported.'
      });
    }

    if (!req.file) {
      console.warn('[AI IMAGE] No image file attached to request');
      return res.status(400).json({
        success: false,
        code: 'MISSING_IMAGE',
        message: isHi ? 'कृपया विश्लेषण के लिए एक फसल फोटो चुनें।' : 'Please select a crop photo to analyze.'
      });
    }

    console.log(`[AI IMAGE] File received: ${req.file.originalname}`);
    console.log(`[AI IMAGE] MIME: ${req.file.mimetype}`);
    console.log(`[AI IMAGE] Size: ${req.file.size} bytes`);

    const language = isHi ? 'hi' : 'en';
    const crop = req.body.crop || 'Paddy';
    const variety = req.body.variety || 'Common';
    const village = req.body.village || req.body.context?.village || null;
    const district = req.body.district || req.body.context?.district || null;
    const state = req.body.state || req.body.context?.state || null;
    const sowingDate = req.body.sowingDate || null;
    const transplantingDate = req.body.transplantingDate || null;
    const farmerQuestion = req.body.farmerQuestion || req.body.question || null;

    if (!openaiClient) {
      console.warn('[AI IMAGE] Error: OpenAI client is not initialized (missing OPENAI_API_KEY).');
      return res.status(503).json({
        success: false,
        code: 'AI_TEMPORARILY_UNAVAILABLE',
        message: isHi
          ? 'फसल फोटो का विश्लेषण अभी उपलब्ध नहीं है। कृपया कुछ देर बाद दोबारा प्रयास करें।'
          : 'Photo analysis is currently unavailable. Please try again later.'
      });
    }

    try {
      const base64Image = req.file.buffer.toString('base64');
      const mimeType = req.file.mimetype || 'image/jpeg';

      const locationText = [village, district, state].filter(Boolean).join(', ');
      const locationInfo = locationText ? `Village: ${village || 'N/A'}, District: ${district || 'N/A'}, State: ${state || 'N/A'}` : 'Location: Not specified';

      const promptText = `You are GramSetu Krishi Saathi, an agricultural vision AI assistant for Indian farmers.

Analyze the uploaded image carefully in two stages:

STAGE 1 — CROP PHOTO VERIFICATION:
Determine whether the uploaded image actually shows an agricultural crop, farm field, plants, leaves, or crop canopy.
- Set "isCropImage": true if the photograph shows paddy, wheat, sugarcane, crops, vegetables, agricultural leaves, crop rows, field canopy, or farm plants.
- Set "isCropImage": false if the photograph shows a human face, selfie, person, car, motorcycle, vehicle, house, building, road, document, ID card, receipt, screenshot, animal, pet, food plate, product photo, meme, or non-agricultural object.

STAGE 2 — CONDITIONAL RESPONSE:
- If "isCropImage": false:
  Provide "imageRejectionReason": "${isHi ? 'कृपया केवल फसल की फोटो अपलोड करें। धान, गेहूं या खेत की फसल/पत्तियों की साफ फोटो लें और दोबारा अपलोड करें।' : 'Please upload a photo of a crop or farm field only.'}".
  Leave crop analysis text fields empty.

- If "isCropImage": true:
  Perform agricultural visual analysis based strictly on visual evidence:

Farmer Context:
Crop: ${crop}
Variety: ${variety}
${locationInfo}
Sowing Date: ${sowingDate || 'Not specified'}
Transplanting Date: ${transplantingDate || 'Not specified'}
Farmer Question / Notes: ${farmerQuestion || 'None'}

Target Language: ${isHi ? 'Hindi (natural Devanagari script)' : 'English'}

Provide your response as a valid JSON object matching this schema exactly:
{
  "isCropImage": true,
  "imageType": "crop",
  "imageRejectionReason": "",
  "crop": "${crop}",
  "cropConfidence": "high",
  "growthStage": "description of visible growth stage",
  "healthStatus": "healthy",
  "healthSummary": "overview summary of visible crop health and condition",
  "visibleSymptoms": ["symptom 1", "symptom 2"],
  "possibleIssues": ["possible issue/cause 1", "possible issue/cause 2"],
  "maturity": "description of crop maturity",
  "estimatedHarvestWindow": "estimated harvest timeframe range (e.g. लगभग 20-30 दिन / 20-30 days)",
  "harvestConfidence": "medium",
  "recommendedActions": ["action 1", "action 2"],
  "additionalInformationNeeded": ["additional detail needed"],
  "imageQuality": "good",
  "spokenSummary": "concise 2-3 sentence audio summary for speech output",
  "disclaimer": "disclaimer note stating assessment is based on photograph and field inspection is recommended"
}

CRITICAL INSTRUCTIONS:
1. All text fields MUST be in ${isHi ? 'simple, natural Hindi (Devanagari script)' : 'clear English'}.
2. Do NOT invent false diagnoses. Distinguish visible symptoms from possible causes.
3. If image quality is poor or unclear, set imageQuality to "poor" and state in healthSummary: "${isHi ? 'फोटो स्पष्ट नहीं है। कृपया पौधे की पत्तियों और फसल का थोड़ा नज़दीक से साफ फोटो लें।' : 'Photo is unclear. Please take a clearer close-up photograph of the crop leaves.'}"
4. Do NOT substitute another village name.
5. Return ONLY valid JSON without markdown formatting.`;

      console.log(`[AI IMAGE] Sending actual image to OpenAI model: ${openaiVisionModel}`);

      const response = await openaiClient.chat.completions.create({
        model: openaiVisionModel,
        messages: [
          {
            role: 'system',
            content: 'You are GramSetu Krishi Saathi, an agricultural vision AI assistant for Indian farmers. You analyze crop images and return structured JSON responses.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: promptText },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' },
        max_tokens: 1000,
        temperature: 0.2
      });

      console.log('[AI IMAGE] OpenAI response received');
      const rawContent = response.choices?.[0]?.message?.content || '{}';
      let analysisJson;

      try {
        analysisJson = JSON.parse(rawContent);
      } catch (parseErr) {
        const match = rawContent.match(/\{[\s\S]*\}/);
        if (match) {
          analysisJson = JSON.parse(match[0]);
        } else {
          throw new Error('Failed to parse JSON from OpenAI response.');
        }
      }

      console.log(`[AI IMAGE] Analysis completed (isCropImage: ${analysisJson.isCropImage})`);

      // Reject non-crop images
      if (analysisJson.isCropImage === false) {
        console.warn('[AI IMAGE] Uploaded image rejected: Not a crop/farm image.');
        return res.status(400).json({
          success: false,
          code: 'NOT_A_CROP_IMAGE',
          message: analysisJson.imageRejectionReason || (
            isHi
              ? 'कृपया केवल फसल की फोटो अपलोड करें। धान, गेहूं या खेत की फसल/पत्तियों की साफ फोटो लें और दोबारा अपलोड करें।'
              : 'Please upload a photo of a crop or farm field only.'
          )
        });
      }

      return res.json({
        success: true,
        analysis: analysisJson
      });

    } catch (openaiErr) {
      console.error('[AI IMAGE] Error:', {
        status: openaiErr.status,
        code: openaiErr.code,
        message: openaiErr.message
      });

      if (openaiErr.status === 400 || openaiErr.code === 'invalid_image_format') {
        return res.status(400).json({
          success: false,
          code: 'INVALID_IMAGE_INPUT',
          message: isHi
            ? 'कृपया JPG, PNG या WEBP फॉर्मेट की फोटो चुनें।'
            : 'Please select a photo in JPG, PNG, or WEBP format.'
        });
      }

      // Map 429 (rate limit/quota), 401 (auth), timeouts, and 5xx to 503 with clean user message
      return res.status(503).json({
        success: false,
        code: 'AI_TEMPORARILY_UNAVAILABLE',
        message: isHi
          ? 'फसल फोटो का विश्लेषण अभी उपलब्ध नहीं है। कृपया कुछ देर बाद दोबारा प्रयास करें।'
          : 'Photo analysis is currently unavailable. Please try again later.'
      });
    }
  });
});



// =====================================================
// AI ASSISTANT - ADVISORY & QUESTION ANSWERING ENDPOINTS
// =====================================================

const handleAiAdvisoryQuery = async (req, res) => {
  try {
    const rawMessage = req.body.message || req.body.question || req.body.query || '';
    const reqLang = req.body.language || req.body.context?.language || 'hi';
    const language = reqLang === 'hi' ? 'hi' : 'en';

    const farmerContext = req.body.context || {};
    const crop = req.body.crop || farmerContext.crop || 'Paddy';
    const variety = req.body.variety || farmerContext.variety || 'Common';
    const village = req.body.village || farmerContext.village || null;
    const district = req.body.district || farmerContext.district || null;
    const state = req.body.state || farmerContext.state || null;
    const userRole = req.userRole || farmerContext.role || 'farmer';

    if (!rawMessage || rawMessage.trim() === '') {
      const isHi = language === 'hi';
      return res.status(400).json({
        success: false,
        message: isHi ? 'कृपया अपना सवाल दर्ज करें।' : 'Please enter your question.'
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    let aiResponseText = null;

    if (geminiApiKey) {
      const locationParts = [village, district, state].filter(Boolean);
      const locationString = locationParts.length > 0 ? locationParts.join(', ') : null;
      const locationClause = locationString
        ? `The authenticated farmer is located in: ${locationString}.`
        : `The farmer's location is unavailable.`;

      const systemInstruction = language === 'hi'
        ? `You are GramSetu Krishi Saathi, an expert agricultural assistant for Indian farmers. The farmer has selected Hindi as the GramSetu application language. ${locationClause}
CRITICAL ANSWERING RULES:
1. ALWAYS answer the farmer's exact CURRENT QUESTION directly and immediately.
2. Do NOT prepend repetitive greetings like "नमस्ते Ayushi Singh जी" or self-introductions like "मैं ग्रामसेतु कृषि साथी हूँ". Answer the question directly.
3. SELLING & PRICE DECISIONS: When the farmer asks a selling decision query (e.g. "1800 में बेचाऊँ" / "1800 दे रहे हैं क्या करूं"), analyze the offered price (e.g., ₹1,800) against the official Govt MSP (Kharif 2026-27 Paddy Common MSP is ₹2,441/quintal). Explain that ₹1,800 is ₹641 below MSP, showing that 50 quintals would yield an estimated gap of ₹32,050. Advise checking with nearby mills or local FPO before deciding, without commanding them blindly.
4. LOCATION CONTEXT: Use farmer location (${village || 'their village'}) as authoritative. Never invent or substitute another village like Rampur unless explicitly requested.
5. SATELLITE DATA: If satellite data is not available for ${village || 'their village'}, state clearly in simple Hindi that satellite data for ${village || 'their village'} is currently unavailable. Do NOT substitute 0.74 NDVI or 480 tonnes.
6. Respond entirely in natural, simple Hindi using Devanagari script. Keep numbers, MSP values, and prices factual.`
        : `You are GramSetu Krishi Saathi, an expert agricultural assistant for Indian farmers. The farmer has selected English as the GramSetu application language. ${locationClause}
CRITICAL ANSWERING RULES:
1. ALWAYS answer the farmer's exact CURRENT QUESTION directly and immediately.
2. Do NOT prepend repetitive greetings like "Namaste..." or self-introductions. Answer the question directly.
3. SELLING & PRICE DECISIONS: When the farmer asks a selling decision query (e.g. "Should I sell at 1800"), analyze the offered price (e.g., ₹1,800) against official Govt MSP (Kharif 2026-27 Paddy Common MSP is ₹2,441/quintal). Explain that ₹1,800 is ₹641 below MSP, representing an estimated gap of ₹32,050 on 50 quintals. Advise comparing with nearby mills or local FPO before deciding.
4. LOCATION CONTEXT: Use farmer location (${village || 'their village'}) as authoritative. Never invent or substitute another village like Rampur unless explicitly requested.
5. SATELLITE DATA: If satellite data is not available for ${village || 'their village'}, state clearly in English that satellite data for ${village || 'their village'} is currently unavailable. Do NOT substitute 0.74 NDVI or 480 tonnes.
6. Respond in clear, simple English. Keep numbers, MSP values, and prices factual.`;

      try {
        const fetchAi = async (retryPromptSuffix = '') => {
          const apiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: `${systemInstruction}\n\nFarmer Question: ${rawMessage}${retryPromptSuffix}` }
                ]
              }]
            })
          });

          if (apiRes.ok) {
            const rawData = await apiRes.json();
            return rawData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null;
          }
          return null;
        };

        aiResponseText = await fetchAi();

        // Check if response contains generic self-introduction while a real question was asked
        if (aiResponseText && (aiResponseText.includes('मैं ग्रामसेतु कृषि साथी हूँ। आप मुझसे') || aiResponseText.includes('I am GramSetu Krishi Saathi. You can ask me'))) {
          aiResponseText = await fetchAi('\nCRITICAL: Answer the farmer\'s question DIRECTLY. Do NOT output a generic welcome message or self-introduction.');
        }

        // Devanagari Validation Layer for Hindi responses
        if (language === 'hi' && aiResponseText) {
          const hasDevanagari = /[\u0900-\u097F]/.test(aiResponseText);
          if (!hasDevanagari) {
            aiResponseText = await fetchAi('\nCRITICAL: You MUST answer strictly in Hindi (Devanagari script).');
            if (aiResponseText && !/[\u0900-\u097F]/.test(aiResponseText)) {
              aiResponseText = null;
            }
          }
        }
      } catch (apiErr) {
        console.warn('Gemini Advisory API notice:', apiErr.message);
      }
    }

    // Rule-based agricultural fallback if AI call unavailable
    if (!aiResponseText) {
      const isHi = language === 'hi';
      const qLower = rawMessage.toLowerCase();
      const numbersInQuery = (qLower.match(/\d+/g) || []).map(Number);

      const isSellingQuery =
        qLower.includes('बेच') || qLower.includes('1800') || qLower.includes('ऑफर') ||
        qLower.includes('दलाल') || qLower.includes('ब्रोकर') || qLower.includes('sell');

      const isPriceMspQuery =
        qLower.includes('भाव') || qLower.includes('रेट') || qLower.includes('msp') ||
        qLower.includes('price') || qLower.includes('rate') || qLower.includes('दाम');

      if (isSellingQuery) {
        const brokerPrice = numbersInQuery.find((n) => n >= 1000 && n <= 5000) || 1800;
        const isWheat = crop.toLowerCase().includes('wheat') || qLower.includes('गेहूँ');
        const mspVal = isWheat ? 2585 : 2441;
        const gap = mspVal - brokerPrice;
        const totalLoss = gap * 50;

        aiResponseText = isHi
          ? `यदि आपको धान के लिए ₹${brokerPrice} प्रति क्विंटल का ऑफर मिल रहा है, तो ध्यान रखें कि खरीफ विपणन सत्र 2026-27 के लिए धान (सामान्य) का सरकारी MSP ₹${mspVal} प्रति क्विंटल है। ₹${brokerPrice} का यह भाव MSP से ₹${gap} कम है। 50 क्विंटल बेचने पर आपका अनुमानित अंतर ₹${totalLoss.toLocaleString('en-IN')} हो सकता है। जल्दबाजी न करें, पास की राइस मिल या FPO से बेहतर दरों की तुलना करें।`
          : `If you are receiving an offer of ₹${brokerPrice}/q, please note that official Govt MSP for Paddy (Common) for Kharif 2026-27 is ₹${mspVal}/q. An offer of ₹${brokerPrice} is ₹${gap} below MSP. For 50 quintals, that represents an estimated gap of ₹${totalLoss.toLocaleString('en-IN')}. Consider checking rates with nearby mills or your local FPO before deciding.`;
      } else if (isPriceMspQuery) {
        const isWheat = crop.toLowerCase().includes('wheat') || qLower.includes('गेहूँ');
        const mspVal = isWheat ? 2585 : 2441;
        const cropLabel = isWheat ? (isHi ? 'गेहूँ (Wheat)' : 'Wheat') : (isHi ? 'धान (Paddy Common)' : 'Paddy (Common)');
        const season = isWheat ? (isHi ? 'रबी विपणन सत्र 2026-27' : 'Rabi Season 2026-27') : (isHi ? 'खरीफ विपणन सत्र 2026-27' : 'Kharif Season 2026-27');

        aiResponseText = isHi
          ? `${season} के लिए ${cropLabel} का भारत सरकार द्वारा निर्धारित न्यूनतम समर्थन मूल्य (MSP) ₹${mspVal} प्रति क्विंटल है। ध्यान रखें कि MSP और आज की मंडी या मिल की वास्तविक कीमत अलग हो सकती है।`
          : `The Govt of India MSP for ${cropLabel} for ${season} is ₹${mspVal}/quintal. Mandi & mill rates are reported separately.`;
      } else {
        aiResponseText = isHi
          ? `आपके सवाल ("${rawMessage}") के लिए: खरीफ विपणन सत्र 2026-27 के लिए धान (सामान्य) का सरकारी MSP ₹2,441 प्रति क्विंटल है। पास की मिलों या मंडी भाव की जानकारी के लिए आप विशिष्ट प्रश्न पूछ सकते हैं।`
          : `For your question ("${rawMessage}"): The Govt MSP for Paddy (Common) is ₹2,441/quintal. Feel free to ask about nearby mills or mandi rates for details.`;
      }
    }

    return res.json({
      success: true,
      answer: aiResponseText,
      language
    });

  } catch (err) {
    console.error('Advisory API error:', err.message);
    const isHi = (req.body.language || req.body.context?.language) === 'hi';
    return res.status(500).json({
      success: false,
      message: isHi
        ? 'माफ़ कीजिए, अभी इस सवाल का उत्तर उपलब्ध नहीं है। कृपया कुछ देर बाद फिर प्रयास करें।'
        : 'Sorry, the answer is not available right now. Please try again later.'
    });
  }
};

app.post('/api/advisory', handleAiAdvisoryQuery);
app.post('/api/ai/ask', handleAiAdvisoryQuery);

// =====================================================
// START SERVER & CONNECT TO DATABASE
// =====================================================

// Prevent uncaught error events on mongoose.connection
// from crashing Node.js
mongoose.connection.on('error', (err) => {

  console.warn(
    '⚠️ Mongoose connection error event:',
    err.message
  );

});

// Start Express server immediately
app.listen(PORT, () => {
  console.log(`🌾 GramSetu Express Backend running on http://localhost:${PORT}`);
});

// Asynchronously connect to MongoDB Atlas & seed prices
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000
})
  .then(async () => {
    console.log('✅ MongoDB connected successfully');
    console.log('📦 Database:', mongoose.connection.name);

    try {
      const mandiCount = await Price.countDocuments({ priceType: 'mandi' });
      if (mandiCount === 0) {
        console.log('🌱 Seeding AGMARKNET mandi records into gramsetu.prices...');
        await syncMandiPrices();
      }
    } catch (seedErr) {
      console.warn('Price seed notice:', seedErr.message);
    }
  })
  .catch((error) => {
    console.warn('⚠️ MongoDB connection warning:', error.message);
  });
