// utils/cronJobs.js
const cron = require('node-cron');
const Application = require('../models/Application');
const Offer = require('../models/Offer');
const emailService = require('../services/emailService');

const startScheduledJobs = () => {
  // Temporarily set to every minute for testing – change back to '0 8 * * *' after verification
  cron.schedule('0 8 * * *', async () => {
    console.log('🔔 Running daily notification checks...');

    // ── Assignment deadlines (within 2 days) ──
    try {
      const upcomingAssignments = await Application.find({
        assignmentDeadline: {
          $lte: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          $gte: new Date()
        },
        assignmentReminderSent: false      // only unsent reminders
      }).populate('user').populate('job');

      for (const app of upcomingAssignments) {
        const user = app.user;
        if (user?.email && user.notificationPreferences?.deadlineReminders) {
          try {
            await emailService.sendAssignmentDeadline(user.email, user.name, {
              title: app.job?.title || 'your assignment',
              company: app.job?.company || 'the company',
              deadline: app.assignmentDeadline
            });
            // Mark as sent so it won't trigger again
            await Application.findByIdAndUpdate(app._id, { assignmentReminderSent: true });
          } catch (err) {
            console.error('❌ Assignment deadline email failed:', err);
          }
        }
      }
    } catch (err) {
      console.error('❌ Error checking assignments:', err);
    }

    // ── Offer expirations (within 3 days) ──
    try {
      const expiringOffers = await Offer.find({
        offerDeadline: {
          $lte: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          $gte: new Date()
        },
        decision: 'pending',
        offerExpiryReminderSent: false    // only unsent reminders
      }).populate('user');

      for (const offer of expiringOffers) {
        const user = offer.user;
        if (user?.email && user.notificationPreferences?.offerExpiry) {
          try {
            await emailService.sendOfferExpiry(user.email, user.name, offer);
            // Mark as sent
            await Offer.findByIdAndUpdate(offer._id, { offerExpiryReminderSent: true });
          } catch (err) {
            console.error('❌ Offer expiry email failed:', err);
          }
        }
      }
    } catch (err) {
      console.error('❌ Error checking offers:', err);
    }
  });
};

module.exports = startScheduledJobs;