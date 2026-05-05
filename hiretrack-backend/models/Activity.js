const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'APPLIED',
        'MOVED_STAGE',
        'ADDED_INTERVIEW',
        'UPLOADED_RESUME',
        'CREATED_OFFER',
        'UPDATED_OFFER',
        'DELETED_OFFER',
        'DELETED_APPLICATION',
        'UPDATED_APPLICATION',
      ],
    },
    entityType: {
      type: String,
      enum: ['Application', 'Resume', 'Offer'],
      required: true,
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    details: {
      type: Object,
      default: {},
    },
  },
  { timestamps: true }
);

// Index for fast retrieval of a user's activities
activitySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Activity', activitySchema);