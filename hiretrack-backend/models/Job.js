const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema(
  {
    // ✅ Matches normalized.jobId from JSearch (unique identifier)
    jobId: {
      type: String,
      required: true,
      unique: true,
      
    },
    // ✅ Basic job info
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      default: 'Remote',
    },
    description: {
      type: String,
      default: '',
    },
    requirements: {
      type: String,
      default: '',
    },
    // ✅ Apply link
    url: {
      type: String,
      required: true,
    },
    // ✅ Timestamp for "time ago" display
    postedAt: {
      type: Date,
      default: Date.now,
    },
    // ✅ Salary display string
    salary: {
      type: String,
      default: 'Not specified',
    },
    // ✅ Source platform (LinkedIn, Indeed, etc.)
    source: {
      type: String,
      default: 'JSearch',
    },
    // ✅ Employment type (FULLTIME, INTERN, etc.)
    employmentType: {
      type: String,
      enum: ['FULLTIME', 'INTERN', 'CONTRACT', 'PARTTIME', null],
      default: null,
    },
    // ✅ Track which users saved/applied to this job
    savedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    // ✅ Optional: cache match scores per user (advanced)
    matchScores: {
      type: Map,
      of: Number,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
jobSchema.index({ jobId: 1 });
jobSchema.index({ title: 'text', company: 'text', description: 'text' });

module.exports = mongoose.model('Job', jobSchema);