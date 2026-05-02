import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'instructor', 'admin', 'content_manager'],
    default: 'student',
    index: true
  },
  avatar: { type: String },
  bio: { type: String },
  dateOfBirth: { type: Date },
  phone: { type: String },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: true },
    }
  },
  gamification: {
    points: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{
      name: { type: String },
      awardedAt: { type: Date, default: Date.now },
      description: { type: String }
    }],
  },
  isActive: { type: Boolean, default: true, index: true },
  lastLogin: { type: Date },
  tokenVersion: { type: Number, default: 0 },
  emailVerified: { type: Boolean, default: false, index: true },
  verificationToken: { type: String },
  verificationTokenExpiry: { type: Date },
  passwordResetToken: { type: String },
  passwordResetTokenExpiry: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.index({ role: 1, createdAt: -1 });
userSchema.index({ email: 1, isActive: 1 });
userSchema.index({ lastLogin: -1 });

export const User = mongoose.model('User', userSchema);
