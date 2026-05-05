const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Original file info
    filename: {
      type: String,
      required: true,
    },
    filepath: {
      type: String,
      required: true,
    },
    filesize: Number,
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    // AI-extracted data
    parsedData: {
      rawText: String, // Full text from PDF
      
      // Structured info extracted by Claude
      personalInfo: {
        name: String,
        email: String,
        phone: String,
        location: String,
        linkedin: String,
        github: String,
        portfolio: String,
      },
      
      summary: String, // Professional summary
      
      skills: {
        technical: [String],    // e.g., ["React", "Node.js", "Python"]
        soft: [String],         // e.g., ["Leadership", "Communication"]
        tools: [String],        // e.g., ["Git", "Docker", "AWS"]
      },
      
      experience: [
        {
          company: String,
          position: String,
          startDate: String,
          endDate: String,
          current: Boolean,
          description: String,
          achievements: [String],
        },
      ],
      
      education: [
        {
          institution: String,
          degree: String,
          field: String,
          startDate: String,
          endDate: String,
          gpa: String,
        },
      ],
      
      projects: [
        {
          name: String,
          description: String,
          technologies: [String],
          link: String,
        },
      ],
      
      certifications: [
        {
          name: String,
          issuer: String,
          date: String,
        },
      ],
    },
    
    // AI analysis
    aiInsights: {
      strengths: [String],
      areasToImprove: [String],
      suggestedRoles: [String],
      experienceLevel: {
        type: String,
        enum: ['entry', 'mid', 'senior', 'lead'],
      },
    },
    
    // Status
    status: {
      type: String,
      enum: ['processing', 'completed', 'failed'],
      default: 'processing',
    },
    processingError: String,
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
resumeSchema.index({ user: 1 });

module.exports = mongoose.model('Resume', resumeSchema);