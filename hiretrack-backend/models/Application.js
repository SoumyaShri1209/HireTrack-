const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // ✅ Store job details directly (no reference to Job collection)
    job: {
      jobId: { type: String, required: true }, // External ID from JSearch
      title: { type: String, required: true },
      company: { type: String, required: true },
      location: String,
      url: String,
      source: String,
      postedAt: Date,
      salary: String,
      employmentType: String,
    },
    status: {
      type: String,
      enum: [
        'applied',
        'phone_screen',
        'interview',
        'offer',
        'accepted',
        'rejected',
      ],
      default: 'applied',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    notes: String,
    interviews: [
      {
        type: {
          type: String,
          enum: ['phone', 'video', 'onsite', 'technical'],
        },
        scheduledDate: Date,
        notes: String,
        completed: {
          type: Boolean,
          default: false,
        },
      },
    ],
    customFields: {
      recruiterName: String,
      recruiterEmail: String,
      referral: String,
      coverLetterUsed: String,
    },
    assignmentDeadline: Date, // Deadline for any assignment/task related to this application
    assignmentReminderSent: { type: Boolean, default: false },
    matchScore: Number, // Snapshot of match score when applied
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate applications for the same job by the same user
applicationSchema.index({ user: 1, 'job.jobId': 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);