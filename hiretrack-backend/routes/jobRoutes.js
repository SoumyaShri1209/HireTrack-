
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getJobFeed, getJobDetails } = require('../controllers/jobController');

/**
 * @swagger
 * tags:
 *   name: Jobs
 *   description: Job feed and matching endpoints
 */

// All job routes are private, requiring authentication
router.use(protect);

/**
 * @swagger
 * /jobs/feed:
 *   get:
 *     summary: Get personalized job feed with match scores
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Manual search query (overrides AI-suggested query)
 *         example: "React Developer"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, job, internship]
 *           default: all
 *         description: Filter by employment type
 *       - in: query
 *         name: minScore
 *         schema:
 *           type: integer
 *           minimum: 0
 *           maximum: 100
 *           default: 0
 *         description: Minimum match score percentage to include in results
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 searchQuery:
 *                   type: string
 *                 jobType:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       jobId:
 *                         type: string
 *                       title:
 *                         type: string
 *                       company:
 *                         type: string
 *                       location:
 *                         type: string
 *                       source:
 *                         type: string
 *                       matchScore:
 *                         type: integer
 *                       matchedSkills:
 *                         type: array
 *                         items:
 *                           type: string
 *                       missingSkills:
 *                         type: array
 *                         items:
 *                           type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       400:
 *         description: Resume not uploaded yet
 */
router.get('/feed', getJobFeed);

/**
 * @swagger
 * /jobs/{id}:
 *   get:
 *     summary: Get detailed information about a specific job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The job's unique identifier
 *     responses:
 *       200:
 *         description: Job details retrieved successfully
 *       401:
 *         description: Unauthorized - invalid or missing token
 *       404:
 *         description: Job not found
 *       501:
 *         description: Not implemented yet (placeholder)
 */
router.get('/:id', getJobDetails); // A placeholder for future expansion

module.exports = router;