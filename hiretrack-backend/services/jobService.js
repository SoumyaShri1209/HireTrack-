
const axios = require('axios');

/**
 * Guess the job source platform from the apply URL
 * @param {string} url - The job application link
 * @returns {string} - Inferred platform name
 */
const guessSourceFromUrl = (url) => {
  if (!url) return 'External';
  
  const lowerUrl = url.toLowerCase();
  
  if (lowerUrl.includes('linkedin.com')) return 'LinkedIn';
  if (lowerUrl.includes('indeed.com')) return 'Indeed';
  if (lowerUrl.includes('glassdoor.com')) return 'Glassdoor';
  if (lowerUrl.includes('monster.com')) return 'Monster';
  if (lowerUrl.includes('ziprecruiter.com')) return 'ZipRecruiter';
  if (lowerUrl.includes('naukri.com')) return 'Naukri';
  if (lowerUrl.includes('internshala.com')) return 'Internshala';
  if (lowerUrl.includes('upwork.com')) return 'Upwork';
  if (lowerUrl.includes('wellfound.com') || lowerUrl.includes('angel.co')) return 'Wellfound';
  if (lowerUrl.includes('greenhouse.io')) return 'Greenhouse';
  if (lowerUrl.includes('lever.co')) return 'Lever';
  if (lowerUrl.includes('workday.com')) return 'Workday';
  if (lowerUrl.includes('google.com/search')) return 'Google Jobs';
  
  // If it's a company career page
  if (lowerUrl.includes('/careers') || lowerUrl.includes('/jobs')) return 'Company Site';
  
  return 'External';
};

/**
 * Fetches job listings from the JSearch API.
 * @param {string} query - Search keyword (e.g., "software engineer").
 * @param {string} jobType - 'all', 'job', or 'internship'.
 * @returns {Promise<Array>} - A promise that resolves to an array of job objects.
 */
const fetchJSearchJobs = async (query = 'software engineer', jobType = 'all') => {
  try {
    console.log(`🔍 Fetching jobs from JSearch for query: "${query}", type: "${jobType}"...`);
    
    const params = {
      query: query,
      page: '1',
      num_pages: '1', // Fetch just one page to stay within free tier limits
      country: 'in',   // Focus on India for HireTrack
      date_posted: 'week' // Only recent jobs
    };

    // Add employment type filter based on jobType
    if (jobType === 'internship') {
      params.employment_types = 'INTERN';
    } else if (jobType === 'job') {
      // Use 'FULLTIME' to exclude internships
      params.employment_types = 'FULLTIME';
    }
    // For 'all', we omit the filter entirely

    const options = {
      method: 'GET',
      url: 'https://jsearch.p.rapidapi.com/search',
      params,
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
        'X-RapidAPI-Host': process.env.RAPIDAPI_HOST
      }
    };

    const response = await axios.request(options);
    
    if (response.data.status === 'OK') {
      console.log('🔍 First raw job object:', JSON.stringify(response.data.data[0], null, 2));
      console.log(`✅ Fetched ${response.data.data.length} jobs from JSearch.`);
      return response.data.data;
    } else {
      console.error('❌ JSearch API returned an error:', response.data);
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching jobs from JSearch:', error.message);
    return [];
  }
};

/**
 * Normalizes job data from different sources into a consistent format.
 * @param {object} job - Raw job object from any source.
 * @param {string} source - The name of the API source (e.g., 'jsearch').
 * @returns {object} - A normalized job object.
 */
const normalizeJobData = (job, source) => {
  let normalized = {};

  if (source === 'jsearch') {
    // Infer the platform from the apply link
    const inferredSource = guessSourceFromUrl(job.job_apply_link);
    
    normalized = {
      jobId: job.job_id,                              // Unique ID for "already applied" check
      title: job.job_title,
      company: job.employer_name,
      location: job.job_city ? `${job.job_city}, ${job.job_country}` : job.job_location || 'Remote',
      description: job.job_description,
      requirements: job.job_highlights?.Qualifications?.join(' ') || '',
      url: job.job_apply_link,
      postedAt: job.job_posted_at_datetime_utc,        // For "time ago" display
      salary: job.job_min_salary ? `${job.job_min_salary} - ${job.job_max_salary}` : null,
      source: inferredSource,                          // ✅ Now displays "LinkedIn", "Indeed", etc.
      employmentType: job.job_employment_type || null, // FULLTIME, INTERN, etc.
      isRemote: job.job_is_remote || false,            // ✅ Added for remote filtering
    };
  } else if (source === 'himalayas') {
    normalized = {
      jobId: job.id,
      title: job.title,
      company: job.companyName,
      location: 'Remote',
      description: job.description,
      requirements: '',
      url: job.applicationLink,
      postedAt: job.pubDate,
      salary: job.salary,
      source: 'Himalayas',
      employmentType: 'FULLTIME', // Himalayas is remote jobs only
      isRemote: true,
    };
  }

  // Clean up any undefined or null values
  Object.keys(normalized).forEach(key => {
    if (normalized[key] === undefined || normalized[key] === null) {
      normalized[key] = key === 'salary' ? 'Not specified' : '';
    }
  });

  return normalized;
};

/**
 * Deduplicates an array of jobs based on a unique combination of title and company.
 * @param {Array} jobs - An array of normalized job objects.
 * @returns {Array} - A new array with duplicates removed.
 */
const deduplicateJobs = (jobs) => {
  const seen = new Map();
  
  return jobs.filter(job => {
    const key = `${job.title}-${job.company}`.toLowerCase().trim();
    if (seen.has(key)) return false;
    seen.set(key, true);
    return true;
  });
};

/**
 * Fetches, normalizes, and deduplicates jobs from all configured sources.
 * @param {string} query - The search query.
 * @param {string} jobType - 'all', 'job', or 'internship'.
 * @returns {Promise<Array>} - A promise that resolves to a clean array of job objects.
 */
const fetchAndAggregateJobs = async (query, jobType = 'all') => {
  // 1. Fetch from all sources in parallel
  const [jsearchJobs] = await Promise.all([
    fetchJSearchJobs(query, jobType)
  ]);

  // 2. Normalize the data from each source
  const normalizedJSearch = jsearchJobs.map(job => normalizeJobData(job, 'jsearch'));

  // 3. Combine all jobs into a single array
  const allJobs = [...normalizedJSearch];

  // 4. Deduplicate the combined list
  const uniqueJobs = deduplicateJobs(allJobs);

  console.log(`📊 Aggregated a total of ${allJobs.length} jobs, ${uniqueJobs.length} of which are unique.`);
  return uniqueJobs;
};

module.exports = {
  fetchAndAggregateJobs,
  deduplicateJobs
};