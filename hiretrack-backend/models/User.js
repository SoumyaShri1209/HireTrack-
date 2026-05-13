const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    resume: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resume',
      default: null,
    },
    preferences: {
      desiredRoles: [String],
      locations: [String],
      salaryRange: {
        min: Number,
        max: Number,
      },
      remotePreference: {
        type: String,
        enum: ['remote', 'hybrid', 'onsite', 'any'],
        default: 'any',
      },
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

// ────────────────────────────────────────────────────────────────
// ✅ CORRECT PRE-SAVE HOOK — async/await style (NO next needed)
// ────────────────────────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// ────────────────────────────────────────────────────────────────
// Password comparison methods
// ────────────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.matchPassword = userSchema.methods.comparePassword;

// ────────────────────────────────────────────────────────────────
// JWT token generation
// ────────────────────────────────────────────────────────────────
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = mongoose.model('User', userSchema);