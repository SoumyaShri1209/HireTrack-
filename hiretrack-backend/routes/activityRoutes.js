const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserActivity } = require('../controllers/activityController');

router.use(protect);

router.get('/', getUserActivity);

module.exports = router;