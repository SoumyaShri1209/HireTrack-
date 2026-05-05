

const Fuse = require('fuse.js');

/**
 * Extracts potential required skills from a job listing.
 * Looks in title, description, and requirements fields.
 * @param {object} job - Normalized job object
 * @returns {string[]} - Array of lowercase skill keywords
 */
const extractJobSkills = (job) => {
  const text = `${job.title || ''} ${job.description || ''} ${job.requirements || ''}`.toLowerCase();
  
  // Common tech skills to look for (you can expand this list)
  const commonSkills = [
    'javascript', 'python', 'java', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin',
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring',
    'mongodb', 'mysql', 'postgresql', 'sql', 'firebase', 'aws', 'azure', 'docker',
    'kubernetes', 'git', 'rest', 'graphql', 'typescript', 'html', 'css', 'tailwind',
    'redux', 'next', 'nestjs', 'golang', 'rust', 'scala', 'tensorflow', 'pytorch'
  ];
  
  const foundSkills = commonSkills.filter(skill => text.includes(skill));
  return [...new Set(foundSkills)]; // Remove duplicates
};

/**
 * Calculates a match score between user skills and job requirements.
 * Uses fuzzy matching to handle variations.
 * @param {object} userResume - The user's parsed resume data
 * @param {object} job - Normalized job object
 * @returns {object} - Match score, matchedSkills, and missingSkills (job skills user lacks)
 */
const calculateMatchScore = (userResume, job) => {
  // 1. User skills (normalized)
  const userSkills = [
    ...(userResume?.skills?.technical || []),
    ...(userResume?.skills?.tools || [])
  ].map(skill => skill.toLowerCase().trim());

  // 2. Job required skills (extracted from job text)
  const jobRequiredSkills = extractJobSkills(job);

  if (jobRequiredSkills.length === 0) {
    return {
      score: 0,
      matchedSkills: [],
      missingSkills: []
    };
  }

  // 3. Fuzzy match each job required skill against user skills
  const fuse = new Fuse(userSkills, {
    includeScore: true,
    threshold: 0.4, // 0.0 = perfect match, 1.0 = no match
  });

  const matchedSkills = [];
  const missingSkills = [];

  jobRequiredSkills.forEach(jobSkill => {
    const result = fuse.search(jobSkill);
    // If Fuse finds a match with score < 0.6, consider it matched
    if (result.length > 0 && result[0].score < 0.6) {
      matchedSkills.push(jobSkill);
    } else {
      missingSkills.push(jobSkill);
    }
  });

  // 4. Calculate match score as percentage of job skills that the user has
  const score = Math.round((matchedSkills.length / jobRequiredSkills.length) * 100);

  return {
    score,
    matchedSkills,
    missingSkills // ✅ Now correctly shows skills the user is missing for this job
  };
};

module.exports = { calculateMatchScore };