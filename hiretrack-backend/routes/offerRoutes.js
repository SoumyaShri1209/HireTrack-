const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createOffer,
  getOffers,
  updateOffer,
  deleteOffer,
  compareOffers,
} = require('../controllers/offerController');

// All offer routes require authentication
router.use(protect);

router.route('/')
  .post(createOffer)
  .get(getOffers);

router.post('/compare', compareOffers);

router.route('/:id')
  .patch(updateOffer)
  .delete(deleteOffer);

module.exports = router;