const Activity = require('../models/Activity');

/**
 * @desc    Get activity log for the logged‑in user
 * @route   GET /api/activity
 * @access  Private
 */
exports.getUserActivity = async (req, res) => {
  try {
    const activities = await Activity.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(50); // Last 50 events

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error('❌ Fetch activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity log',
    });
  }
};