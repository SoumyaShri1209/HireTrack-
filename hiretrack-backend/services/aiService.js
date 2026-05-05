
let genAI;

async function getGenAI() {
  if (!genAI) {
    // Dynamic import works in CommonJS
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
}

/**
 * Helper: Timeout wrapper for async promises
 */
function withTimeout(promise, ms) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)
    )
  ]);
}

/**
 * Helper: Retry with exponential backoff (optional but robust)
 */
async function callWithRetry(fn, maxRetries = 2) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      const delay = 2000 * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} in ${delay}ms...`);
      await new Promise(r => setTimeout(r, delay));
    }
  }
}

/**
 * Parse resume text using Gemini AI
 * @param {string} resumeText - Raw text extracted from PDF
 * @returns {Promise<object>} - Structured resume data
 */
async function parseResumeWithAI(resumeText) {
  try {
    const genAIInstance = await getGenAI();
    const model = genAIInstance.getGenerativeModel({
      model: "gemini-2.5-flash-lite", // ✅ Free tier model
      generationConfig: {
        temperature: 0,
        maxOutputTokens: 4000,
        responseMimeType: "application/json",
      }
    });

    // Enhanced prompt with explicit name extraction guidance
    const prompt = `You are an expert resume parser. Extract the following structured information from the resume text below. Be meticulous.

⚠️ CRITICAL: The "name" field is MANDATORY if a person's full name appears anywhere in the text. The name is usually the largest, boldest text at the very top of the first page, often on its own line. Look for patterns like "Soumya Shri", "John A. Doe", "Dr. Michael Chen". Do NOT leave it null if a name exists.

Resume Text:
${resumeText}

Return ONLY a valid JSON object with this EXACT structure (use null for missing fields, empty arrays for empty lists):
{
  "personalInfo": {
    "name": "Full Name or null",
    "email": "email@example.com or null",
    "phone": "+91-XXXXXXXXXX or null",
    "location": "City, Country or null",
    "linkedin": "linkedin.com/in/username or null",
    "github": "github.com/username or null",
    "portfolio": "portfolio URL or null"
  },
  "summary": "Professional summary or null",
  "skills": {
    "technical": ["skill1", "skill2"],
    "soft": ["skill1"],
    "tools": ["tool1"]
  },
  "experience": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "MMM YYYY",
      "endDate": "MMM YYYY or Present",
      "current": false,
      "description": "Brief role description",
      "achievements": ["Achievement 1"]
    }
  ],
  "education": [
    {
      "institution": "University Name",
      "degree": "B.Tech/M.Tech/etc",
      "field": "Computer Science",
      "startDate": "YYYY",
      "endDate": "YYYY",
      "gpa": "8.5/10"
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "What it does",
      "technologies": ["React", "Node.js"],
      "link": "github.com/user/project"
    }
  ],
  "certifications": [
    {
      "name": "Cert Name",
      "issuer": "Org",
      "date": "MMM YYYY"
    }
  ]
}

IMPORTANT RULES:
- If a field is not found, use null or empty array [].
- For "name", do your absolute best to extract it. If you are unsure, provide the most likely candidate from the top of the resume.
- Return ONLY the JSON. No explanations, no markdown code blocks.`;

    const result = await callWithRetry(() =>
      withTimeout(model.generateContent(prompt), 30000)
    );
    const response = await result.response;

    let parsedData;
    try {
      parsedData = JSON.parse(response.text());
    } catch (parseError) {
      // Fallback: clean up markdown if model returned it anyway
      let jsonText = response.text().trim();
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      parsedData = JSON.parse(jsonText);
    }

    return parsedData;
  } catch (error) {
    console.error('Gemini parsing error:', error.message);
    throw new Error('Failed to parse resume with Gemini AI: ' + error.message);
  }
}

/**
 * Generate AI insights about the resume using Gemini
 * @param {object} parsedData - Structured resume data
 * @returns {Promise<object>} - AI insights
 */
async function generateResumeInsights(parsedData) {
  try {
    const genAIInstance = await getGenAI();
    const model = genAIInstance.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 2000,
        responseMimeType: "application/json",
      }
    });

    const prompt = `Analyze this resume and provide insights. Return ONLY a JSON object.

Resume Data:
${JSON.stringify(parsedData, null, 2)}

Return a JSON object with this structure:
{
  "strengths": ["Strength 1", "Strength 2", "Strength 3"],
  "areasToImprove": ["Improvement area 1", "Improvement area 2"],
  "suggestedRoles": ["Software Engineer", "Full Stack Developer"],
  "experienceLevel": "entry" OR "mid" OR "senior" OR "lead"
}

IMPORTANT: Return ONLY valid JSON, no explanations.`;

    const result = await callWithRetry(() =>
      withTimeout(model.generateContent(prompt), 30000)
    );
    const response = await result.response;

    let insights;
    try {
      insights = JSON.parse(response.text());
    } catch (parseError) {
      let jsonText = response.text().trim().replace(/```json\n?/g, '').replace(/```\n?/g, '');
      insights = JSON.parse(jsonText);
    }

    return insights;
  } catch (error) {
    console.error('Gemini insights error:', error.message);
    throw new Error('Failed to generate insights with Gemini: ' + error.message);
  }
}

module.exports = {
  parseResumeWithAI,
  generateResumeInsights,
};