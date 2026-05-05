const Resume = require('../models/Resume');
const User = require('../models/User');
const Activity = require('../models/Activity'); // ✅ Activity Log
const { extractTextFromPDF } = require('../utils/pdfParser');
const { parseResumeWithAI, generateResumeInsights } = require('../services/aiService');
const fs = require('fs').promises;

/**
 * Upload and parse resume
 * POST /api/resume/upload
 */
exports.uploadResume = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF file',
      });
    }

    const userId = req.user.id;
    const filePath = req.file.path;
    const filename = req.file.filename;
    const filesize = req.file.size;

    console.log(`📄 Processing resume for user ${userId}: ${filename}`);

    // Step 1: Create resume record with 'processing' status
    const resume = await Resume.create({
      user: userId,
      filename,
      filepath: filePath,
      filesize,
      status: 'processing',
    });

    // Step 2: Extract text from PDF
    let rawText;
    try {
      rawText = await extractTextFromPDF(filePath);
      console.log(`✅ Text extracted: ${rawText.length} characters`);
      console.log(`📄 Raw text (first 800 chars):\n${rawText.slice(0, 800)}`);
    } catch (error) {
      resume.status = 'failed';
      resume.processingError = 'Failed to extract text from PDF';
      await resume.save();
      return res.status(500).json({
        success: false,
        message: 'Failed to extract text from PDF',
        error: error.message,
      });
    }

    // Step 3: Parse with AI
    let parsedData;
    try {
      parsedData = await parseResumeWithAI(rawText);
      console.log('✅ AI parsing complete');
    } catch (error) {
      resume.status = 'failed';
      resume.processingError = 'AI parsing failed';
      await resume.save();
      return res.status(500).json({
        success: false,
        message: 'Failed to parse resume with AI',
        error: error.message,
      });
    }

    // Step 4: Generate AI insights
    let aiInsights;
    try {
      aiInsights = await generateResumeInsights(parsedData);
      console.log('✅ AI insights generated');
    } catch (error) {
      console.warn('⚠️ Failed to generate insights:', error.message);
      aiInsights = {
        strengths: [],
        areasToImprove: [],
        suggestedRoles: [],
        experienceLevel: 'mid',
      };
    }

    // Step 5: Fallback for name if AI returned null
    if (!parsedData.personalInfo) {
      parsedData.personalInfo = {};
    }

    if (!parsedData.personalInfo.name) {
      const nameRegex = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/m;
      const match = rawText.match(nameRegex);
      if (match) {
        parsedData.personalInfo.name = match[1].trim();
        console.log(`🔧 Fallback name extracted: "${parsedData.personalInfo.name}"`);
      } else {
        const firstChunk = rawText.slice(0, 300);
        const looseMatch = firstChunk.match(/([A-Z][a-z]+ [A-Z][a-z]+)/);
        if (looseMatch) {
          parsedData.personalInfo.name = looseMatch[1];
          console.log(`🔧 Loose fallback name extracted: "${parsedData.personalInfo.name}"`);
        }
      }
    }

    // Step 6: Update resume with parsed data
    resume.parsedData = {
      rawText,
      ...parsedData,
    };
    resume.aiInsights = aiInsights;
    resume.status = 'completed';
    await resume.save();

    // Step 7: Update user's resume reference
    await User.findByIdAndUpdate(userId, { resume: resume._id });

    console.log(`🎉 Resume processing complete for user ${userId}`);

    // ── Activity Log ──
    await Activity.create({
      user: userId,
      action: 'UPLOADED_RESUME',
      entityType: 'Resume',
      entityId: resume._id,
      details: {},
    }).catch(err => console.error('❌ Failed to log resume activity:', err));

    // Return success response
    res.status(201).json({
      success: true,
      message: 'Resume uploaded and parsed successfully',
      data: {
        resumeId: resume._id,
        personalInfo: resume.parsedData.personalInfo,
        skills: resume.parsedData.skills,
        aiInsights: resume.aiInsights,
      },
    });
  } catch (error) {
    console.error('❌ Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process resume',
      error: error.message,
    });
  }
};

/**
 * Get user's resume
 * GET /api/resume
 */
exports.getResume = async (req, res) => {
  try {
    const userId = req.user.id;
    const resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'No resume found. Please upload your resume first.',
      });
    }

    res.status(200).json({
      success: true,
      data: resume,
    });
  } catch (error) {
    console.error('❌ Get resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve resume',
      error: error.message,
    });
  }
};

/**
 * Delete resume
 * DELETE /api/resume/:id
 */
exports.deleteResume = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.user.id;

    const resume = await Resume.findOne({ _id: resumeId, user: userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Delete the file from disk
    try {
      await fs.unlink(resume.filepath);
      console.log(`🗑️ Deleted file: ${resume.filepath}`);
    } catch (error) {
      console.warn('⚠️ Failed to delete file:', error.message);
    }

    // Delete from database
    await Resume.findByIdAndDelete(resumeId);

    // Remove reference from user
    await User.findByIdAndUpdate(userId, { resume: null });

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully',
    });
  } catch (error) {
    console.error('❌ Delete resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: error.message,
    });
  }
};

/**
 * Update resume manually (if user wants to edit AI-parsed data)
 * PATCH /api/resume/:id
 */
exports.updateResume = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const userId = req.user.id;
    const updates = req.body;

    const resume = await Resume.findOne({ _id: resumeId, user: userId });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Update parsedData fields
    if (updates.personalInfo) {
      resume.parsedData.personalInfo = {
        ...resume.parsedData.personalInfo,
        ...updates.personalInfo,
      };
    }

    if (updates.skills) {
      resume.parsedData.skills = {
        ...resume.parsedData.skills,
        ...updates.skills,
      };
    }

    if (updates.summary) {
      resume.parsedData.summary = updates.summary;
    }

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully',
      data: resume,
    });
  } catch (error) {
    console.error('❌ Update resume error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update resume',
      error: error.message,
    });
  }
};