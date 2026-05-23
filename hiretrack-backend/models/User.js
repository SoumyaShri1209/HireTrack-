const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String, required: true, unique: true, lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email'],
    },
    googleId: { type: String, unique: true, sparse: true },
    password: {
      type: String,
      required: function() { return !this.googleId; },
      minlength: 6,
      select: false,
    },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', default: null },
    preferences: {
      desiredRoles: [String],
      locations: [String],
      salaryRange: { min: Number, max: Number },
      remotePreference: { type: String, enum: ['remote', 'hybrid', 'onsite', 'any'], default: 'any' },
    },
    notificationPreferences: {
      newJobAlerts: { type: Boolean, default: true },
      internshipAlerts: { type: Boolean, default: true },
      interviewReminders: { type: Boolean, default: true },
      deadlineReminders: { type: Boolean, default: true },
      hrReplies: { type: Boolean, default: true },
      offerExpiry: { type: Boolean, default: true },
      dailyDigest: { type: Boolean, default: false },
      weeklyDigest: { type: Boolean, default: false },
      lastHighMatchAlertSent: Date,
    },
    notifications: {
      newMatches: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: true },
    },
    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// ✅ FIXED — async only, no next parameter
userSchema.pre('save', async function() {
  console.log('✅ pre-save hook triggered');
  if (!this.isModified('password') || !this.password) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidate) {
  return await bcrypt.compare(candidate, this.password);
};
userSchema.methods.matchPassword = userSchema.methods.comparePassword;

userSchema.methods.generateAccessToken = function() {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, { expiresIn: '15m' });
};
userSchema.methods.generateRefreshToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

// ✅ FIXED — prevents double model registration on nodemon restarts
module.exports = mongoose.models.User || mongoose.model('User', userSchema);