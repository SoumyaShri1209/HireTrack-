const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createApplication,
  getApplications,
  updateStatus,
  updateApplication,
  addInterview,
  deleteApplication,
  checkApplied,
} = require('../controllers/applicationController');

router.use(protect);

router.route('/')
  .post(createApplication)
  .get(getApplications);

router.get('/check/:jobId', checkApplied);

router.route('/:id')
  .patch(updateApplication)
  .delete(deleteApplication);

router.patch('/:id/status', updateStatus);
router.post('/:id/interviews', addInterview);

module.exports = router;