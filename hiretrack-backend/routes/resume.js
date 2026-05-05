

const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth'); // ✅ Real auth middleware
const {
  uploadResume,
  getResume,
  deleteResume,
  updateResume,
} = require('../controllers/resumeController');

// All routes below are protected
router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResume);
router.patch('/:id', updateResume);
router.delete('/:id', deleteResume);

module.exports = router;