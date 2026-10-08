import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true
    },

    phone: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },

    passwordHash: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ['farmer', 'mill', 'government'],
      default: 'farmer'
    },

    // Farmer details
    village: {
      type: String,
      trim: true
    },

    district: {
      type: String,
      trim: true
    },

    state: {
      type: String,
      trim: true
    },

    city: {
      type: String,
      trim: true
    },

    pincode: {
      type: String,
      trim: true
    },

    crop: {
      type: String,
      trim: true
    },

    otherCrops: {
      type: String,
      trim: true
    },

    land: {
      type: String,
      trim: true
    },

    landUnit: {
      type: String,
      trim: true,
      default: 'Acres'
    },

    irrigation: {
      type: String,
      trim: true
    },

    // Language and voice preferences
    language: {
      type: String,
      enum: ['hi', 'en'],
      default: 'hi'
    },

    voiceEnabled: {
      type: Boolean,
      default: true
    },

    voiceSpeed: {
      type: String,
      enum: ['slow', 'normal', 'fast'],
      default: 'slow'
    },

    // Notification preferences
    notifications: {
      sms: {
        type: Boolean,
        default: true
      },

      whatsapp: {
        type: Boolean,
        default: true
      },

      inApp: {
        type: Boolean,
        default: true
      },

      dailyMarketPrice: {
        type: Boolean,
        default: true
      },

      mspChange: {
        type: Boolean,
        default: true
      },

      voice: {
        type: Boolean,
        default: true
      }
    },

    // Notification language
    notificationLanguage: {
      type: String,
      enum: ['hi', 'en', 'both'],
      default: 'both'
    },

    // Mobile verification
    phoneVerified: {
      type: Boolean,
      default: false
    },

    // Password reset fields
    passwordResetToken: {
      type: String
    },
    passwordResetExpires: {
      type: Date
    },
    passwordResetOtp: {
      type: String
    },
    passwordResetOtpExpires: {
      type: Date
    },
    passwordResetOtpAttempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

export default User;