const Application = require('../models/Application');
const Job = require('../models/Job'); // We'll need this for job reference
const emailService = require('../services/emailService');
const User = require('../models/User');
const Activity = require('../models/Activity');
/**
 * @desc    Create a new application (when user applies to a job)
 * @route   POST /api/applications
 * @access  Private
 */
exports.createApplication = async (req, res) => {
  try {
    const userId = req.user.id;
    const { job, status, notes, appliedDate, customFields, matchScore } = req.body;

    // Validate that required job fields are present
    if (!job || !job.jobId || !job.title || !job.company) {
      return res.status(400).json({
        success: false,
        message: 'Missing required job information',
      });
    }

    // Check if already applied
    const existing = await Application.findOne({
      user: userId,
      'job.jobId': job.jobId,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job',
      });
    }

    const application = await Application.create({
      user: userId,
      job,
      status: status || 'applied',
      appliedDate: appliedDate || new Date(),
      notes,
      customFields,
      matchScore,
    });

    // 🔍 DEBUG LOG
    console.log('✅ Application saved:', {
      userId,
      jobId: job.jobId,
      applicationId: application._id,
    });

    await Activity.create({
  user: userId,
  action: 'APPLIED',
  entityType: 'Application',
  entityId: application._id,
  details: { jobTitle: job.title, company: job.company },
});

    res.status(201).json({
      success: true,
      message: 'Application saved successfully',
      data: application,
    });
  } catch (error) {
    console.error('❌ Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save application',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all applications for the logged-in user (Kanban board)
 * @route   GET /api/applications
 * @access  Private
 */
exports.getApplications = async (req, res) => {
  try {
    const userId = req.user.id;
    const applications = await Application.find({ user: userId })
      .populate('job')
      .sort('-createdAt');

    // Group by status for Kanban (matching your enum values)
    const kanban = {
      applied: [],
      phone_screen: [],
      interview: [],
      offer: [],
      accepted: [],
      rejected: [],
    };

    applications.forEach(app => {
      if (kanban[app.status] !== undefined) {
        kanban[app.status].push(app);
      }
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: {
        all: applications,
        kanban,
      },
    });
  } catch (error) {
    console.error('❌ Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message,
    });
  }
};

/**
 * @desc    Update application status (drag & drop between Kanban columns)
 * @route   PATCH /api/applications/:id/status
 * @access  Private
 */
exports.updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    const validStatuses = [
      'applied',
      'phone_screen',
      'interview',
      'offer',
      'accepted',
      'rejected',
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const application = await Application.findOneAndUpdate(
      { _id: id, user: userId },
      { status, lastUpdated: new Date() },
      { new: true, runValidators: true }
    ).populate('job');

    await Activity.create({
  user: userId,
  action: 'MOVED_STAGE',
  entityType: 'Application',
  entityId: id,
  details: { newStage: status, company: application.job?.company },
});

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Status updated',
      data: application,
    });
  } catch (error) {
    console.error('❌ Update status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update status',
      error: error.message,
    });
  }
};

/**
 * @desc    Update application details (notes, custom fields, interviews)
 * @route   PATCH /api/applications/:id
 * @access  Private
 */
exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Don't allow updating job or user fields
    delete updates.job;
    delete updates.user;

    const application = await Application.findOneAndUpdate(
      { _id: id, user: userId },
      { ...updates, lastUpdated: new Date() },
      { new: true, runValidators: true }
    ).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false, 
        message: 'Application not found',
      });
    }

    // ── Send HR reply notification if notes changed ──
if (req.body.notes) {
  try {
    const user = await User.findById(userId);
    if (user?.email && user.notificationPreferences?.hrReplies) {
      emailService.sendHRReply(user.email, user.name, application, req.body.notes)
        .catch(err => console.error('❌ HR reply email failed:', err));
    }
  } catch (err) {
    console.error('❌ Could not send HR reply:', err);
  }
}

await Activity.create({
  user: userId,
  action: 'UPDATED_APPLICATION',
  entityType: 'Application',
  entityId: id,
  details: { notes: req.body.notes ? true : false },
});

    res.status(200).json({
      success: true,
      message: 'Application updated',
      data: application,
    });
  } catch (error) {
    console.error('❌ Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message,
    });
  }
};

/**
 * @desc    Add an interview to an application
 * @route   POST /api/applications/:id/interviews
 * @access  Private
 */
exports.addInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const interviewData = req.body;

    const application = await Application.findOne({ _id: id, user: userId });
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    application.interviews.push(interviewData);
    application.lastUpdated = new Date();
    await application.save();

    await Activity.create({
  user: userId,
  action: 'ADDED_INTERVIEW',
  entityType: 'Application',
  entityId: id,
  details: { company: application.job?.company },
});

    // ── Send interview reminder ──
try {
  const user = await User.findById(userId);
  if (user?.email && user.notificationPreferences?.interviewReminders) {
    emailService.sendInterviewReminder(user.email, user.name, application)
      .catch(err => console.error('❌ Interview reminder email failed:', err));
  }
} catch (err) {
  console.error('❌ Could not send interview reminder:', err);
}

    res.status(201).json({
      success: true,
      message: 'Interview added',
      data: application,
    });
  } catch (error) {
    console.error('❌ Add interview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add interview',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete an application
 * @route   DELETE /api/applications/:id
 * @access  Private
 */
exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const application = await Application.findOneAndDelete({ _id: id, user: userId });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    await Activity.create({
  user: userId,
  action: 'DELETED_APPLICATION',
  entityType: 'Application',
  entityId: req.params.id,
  details: {},
});

    res.status(200).json({
      success: true,
      message: 'Application deleted',
    });
  } catch (error) {
    console.error('❌ Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message,
    });
  }
};

/**
 * @desc    Check if user has already applied to a specific job
 * @route   GET /api/applications/check/:jobId
 * @access  Private
 */
exports.checkApplied = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.id;

    // 🔍 DEBUG LOG
    console.log('🔍 Checking applied for:', { userId, jobId });

    // ✅ Query the embedded job.jobId field, not job ObjectId
    const application = await Application.findOne({
      user: userId,
      'job.jobId': jobId,  // ✅ Correct path for embedded job.jobId
    });

    // 🔍 DEBUG LOG
    console.log('🔍 Found application:', application ? application._id : 'None');

    res.status(200).json({
      success: true,
      applied: !!application,
      applicationId: application?._id || null,
      status: application?.status || null,
    });
  } catch (error) {
    console.error('❌ Check applied error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check application status',
      error: error.message,
    });
  }
};