// services/emailService.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper to send a plain email
const send = async (to, subject, text) => {
  await transporter.sendMail({
    from: `"HireTrack" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};

// ──────────────── ALERT TEMPLATES ────────────────

exports.sendHighMatchJobs = async (userEmail, userName, jobs, type = 'job') => {
  const label = type === 'internship' ? 'Internship' : 'Job';
  const jobList = jobs
    .map(j => {
      const source = j.source || 'External';
      const url = j.url || '#';
      return `• **${j.title}** at ${j.company} _(${j.matchScore}% match)_
  📌 Source: ${source}
  🔗 Apply: ${url}`;
    })
    .join('\n\n');

  const text = `Hi ${userName},

We found these new matches:

${jobList}

Apply now on HireTrack!

Best,
HireTrack Team`;

  const html = `<p>Hi ${userName},</p>
<p>We found these new matches:</p>
<ol style="line-height:1.6;">
  ${jobs
    .map(j => {
      const source = j.source || 'External';
      const url = j.url || '#';
      return `<li>
        <strong>${j.title}</strong> at ${j.company} <em>(${j.matchScore}% match)</em><br/>
        📌 Source: ${source}<br/>
        🔗 <a href="${url}" target="_blank">Apply here</a>
      </li>`;
    })
    .join('')}
</ol>
<p>Apply now on HireTrack!</p>
<p>Best,<br/>HireTrack Team</p>`;

  await transporter.sendMail({
    from: `"HireTrack" <${process.env.EMAIL_USER}>`,
    to: userEmail,
    subject: `🔥 ${jobs.length} High‑Match ${label}s Found!`,
    text,
    html,
  });
};

exports.sendInterviewReminder = async (userEmail, userName, application) => {
  const jobTitle = application.job?.title || 'the position';
  const company = application.job?.company || 'the company';
  const scheduledDate = application.interviews?.slice(-1)[0]?.scheduledDate
    ? new Date(application.interviews.slice(-1)[0].scheduledDate).toLocaleString()
    : 'soon';
  await send(
    userEmail,
    `⏰ Interview Reminder: ${company}`,
    `Hi ${userName},\n\nYour interview for ${jobTitle} at ${company} is scheduled on ${scheduledDate}.\n\nGood luck!\n\nHireTrack Team`
  );
};

exports.sendHRReply = async (userEmail, userName, application, note) => {
  await send(
    userEmail,
    `📬 Update from ${application.job?.company || 'HR'}`,
    `Hi ${userName},\n\nThere is an update regarding your application for ${application.job?.title || 'a position'}:\n\n"${note}"\n\nCheck HireTrack for more details.\n\nBest,\nHireTrack Team`
  );
};

exports.sendAssignmentDeadline = async (userEmail, userName, assignment) => {
  // Format deadline nicely, fallback if missing
  let deadlineStr = 'Not specified';
  if (assignment.deadline) {
    const d = new Date(assignment.deadline);
    if (!isNaN(d.getTime())) {
      // Show date + time in readable format
      deadlineStr = d.toLocaleString('en-IN', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Kolkata', // adjust to your audience's timezone
      });
    }
  }

  await send(
    userEmail,
    `📝 Assignment Deadline: ${assignment.title}`,
    `Hi ${userName},\n\nYour assignment for ${assignment.title} from ${assignment.company} is due on ${deadlineStr}.\n\nDon't miss it!\n\nHireTrack Team`
  );
};

exports.sendOfferExpiry = async (userEmail, userName, offer) => {
  await send(
    userEmail,
    `⌛ Offer Expiring Soon: ${offer.company}`,
    `Hi ${userName},\n\nThe offer from ${offer.company} for ${offer.role} will expire on ${new Date(offer.offerDeadline).toLocaleDateString()}.\n\nPlease make your decision soon.\n\nHireTrack Team`
  );
};

exports.sendDailyDigest = async (userEmail, userName, newJobs) => {
  if (!newJobs.length) return;
  const list = newJobs.slice(0, 5).map(j => `• ${j.title} at ${j.company}`).join('\n');
  await send(
    userEmail,
    `☀️ Your Daily Job Digest`,
    `Hi ${userName},\n\nHere are today's new matches:\n\n${list}\n\nLog in to see more.\n\nHireTrack Team`
  );
};