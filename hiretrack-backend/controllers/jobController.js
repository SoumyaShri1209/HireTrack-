const Resume = require('../models/Resume');
const { fetchAndAggregateJobs } = require('../services/jobService');
const { calculateMatchScore } = require('../services/matchService');
const emailService = require('../services/emailService');
const User = require('../models/User');

/**
 * Build an intelligent search query from the user's resume
 * @param {object} parsedData - Parsed resume data
 * @param {object} aiInsights - AI-generated insights
 * @returns {string} - Optimized search query
 */
const buildSearchQuery = (parsedData, aiInsights) => {
  // Priority 1: Use the first suggested role from AI insights
  if (aiInsights?.suggestedRoles?.length > 0) {
    return aiInsights.suggestedRoles[0];
  }

  // Priority 2: Look for web development related skills and build a query
  const skills = parsedData.skills?.technical || [];
  const webDevSkills = ['React', 'Node.js', 'JavaScript', 'Full Stack', 'MERN', 'Next.js', 'Express'];
  const matchingSkills = skills.filter(skill => 
    webDevSkills.some(webSkill => skill.toLowerCase().includes(webSkill.toLowerCase()))
  );
  
  if (matchingSkills.length > 0) {
    // Use the most relevant skill
    return matchingSkills[0] + ' Developer';
  }

  // Priority 3: Use the most frequent skill category
  if (skills.length > 0) {
    return skills[0] + ' Developer';
  }

  // Fallback
  return 'Software Developer';
};

/**
 * @desc    Get a personalized job feed for the logged-in user
 * @route   GET /api/jobs/feed
 * @access  Private
 */
const getJobFeed = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // 1. Fetch user's resume to get their skills
    const userResume = await Resume.findOne({ user: userId });
    if (!userResume || !userResume.parsedData) {
      return res.status(400).json({
        success: false,
        message: 'Please upload and parse your resume first to get personalized job matches.'
      });
    }

    // Allow manual override via query parameter (optional)
    let searchQuery = req.query.q;
    if (!searchQuery) {
      searchQuery = buildSearchQuery(userResume.parsedData, userResume.aiInsights);
    }
    
    // ✅ NEW: Extract job type filter from query parameter
    const jobType = req.query.type || 'all'; // 'job', 'internship', or 'all'
    
    console.log(`🔍 Searching jobs with query: "${searchQuery}", type: "${jobType}"`);

    // 2. Fetch and aggregate jobs from our sources (pass jobType)
    const rawJobs = await fetchAndAggregateJobs(searchQuery, jobType);
    
    // 3. Calculate match scores for each job
    const scoredJobs = rawJobs.map(job => {
      const matchDetails = calculateMatchScore(userResume.parsedData, job);
      return {
        ...job,
        matchScore: matchDetails.score,
        matchedSkills: matchDetails.matchedSkills,
        missingSkills: matchDetails.missingSkills
      };
    });

    // 4. Sort jobs by match score (highest first)
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    // 5. Optionally filter out low-match jobs (e.g., below 30%)
    const minScore = req.query.minScore ? parseInt(req.query.minScore) : 0;
    const filteredJobs = scoredJobs.filter(job => job.matchScore >= minScore);


// ── Send high‑match alerts (max once per day) ──
const highMatches = scoredJobs.filter(j => j.matchScore >= 70);
if (highMatches.length > 0) {
  try {
    const user = await User.findById(userId);
    if (user && user.email) {
      const now = new Date();
      const lastSent = user.notificationPreferences?.lastHighMatchAlertSent;
      const oneDay = 24 * 60 * 60 * 1000;

      // Only send if never sent before, or more than 24 hours ago
      if (!lastSent || (now - new Date(lastSent)) > oneDay) {
        const jobs = highMatches.filter(j => j.employmentType !== 'INTERN');
        const internships = highMatches.filter(j => j.employmentType === 'INTERN');

        if (jobs.length && user.notificationPreferences?.newJobAlerts) {
          emailService.sendHighMatchJobs(user.email, user.name, jobs.slice(0, 5), 'job')
            .catch(err => console.error('❌ Job alert email failed:', err));
        }
        if (internships.length && user.notificationPreferences?.internshipAlerts) {
          emailService.sendHighMatchJobs(user.email, user.name, internships.slice(0, 5), 'internship')
            .catch(err => console.error('❌ Internship alert email failed:', err));
        }

        // Update the timestamp after sending
        user.notificationPreferences.lastHighMatchAlertSent = now;
        await user.save();
      }
    }
  } catch (e) {
    console.error('❌ Could not send high‑match alert:', e);
  }
}

    res.status(200).json({
      success: true,
      count: filteredJobs.length,
      searchQuery,
      jobType, // ✅ Include in response for frontend reference
      data: filteredJobs
    });

  } catch (error) {
    console.error('❌ Error fetching job feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job feed',
      error: error.message
    });
  }
};

/**
 * @desc    Get details for a specific job (placeholder)
 * @route   GET /api/jobs/:id
 * @access  Private
 */
const getJobDetails = async (req, res) => {
  res.status(501).json({ success: false, message: 'Not implemented yet' });
};

module.exports = {
  getJobFeed,
  getJobDetails
};