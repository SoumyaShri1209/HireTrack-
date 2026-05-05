const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    application: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Application',
      required: true,
    },
    // ✅ Changed to optional – the application already contains the job details
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: false,
    },
    
    // Offer details for comparison
    company: String,
    role: String,
    
    compensation: {
      ctc: Number,              // Cost to Company (annual)
      baseSalary: Number,
      bonus: Number,
      stockOptions: String,
      currency: {
        type: String,
        default: 'INR',
      },
    },
    
    location: {
      city: String,
      country: String,
      workMode: {
        type: String,
        enum: ['remote', 'hybrid', 'onsite'],
      },
    },
    
    joiningDetails: {
      joiningDate: Date,
      noticePeriod: String,     // "Immediate", "30 days", etc.
      probationPeriod: String,  // "3 months", "6 months"
    },
    
    benefits: [String],         // ["Health Insurance", "WFH", "Gym"]
    
    // Decision tracking
    offerReceivedDate: Date,
    offerDeadline: Date,
    offerExpiryReminderSent: { type: Boolean, default: false },
    
    decision: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'negotiating'],
      default: 'pending',
    },
    
    notes: String,              // User's thoughts on the offer
    
    // Comparison score (calculated by AI)
    comparisonScore: Number,    // 0-100 based on market data
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
offerSchema.index({ user: 1, decision: 1 });

module.exports = mongoose.model('Offer', offerSchema);