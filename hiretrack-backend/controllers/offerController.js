const Offer = require('../models/Offer');
const Activity = require('../models/Activity'); // ✅ Activity Log

/**
 * @desc    Create a new offer
 * @route   POST /api/offers
 * @access  Private
 */
exports.createOffer = async (req, res) => {
  try {
    // Add the logged-in user's ID
    const offerData = { ...req.body, user: req.user.id };
    const offer = await Offer.create(offerData);

    // Populate references for the response
    await offer.populate(['application', 'job']);

    // ── Activity Log ──
    await Activity.create({
      user: req.user.id,
      action: 'CREATED_OFFER',
      entityType: 'Offer',
      entityId: offer._id,
      details: { company: offer.company, role: offer.role },
    }).catch(err => console.error('❌ Failed to log offer activity:', err));

    res.status(201).json({
      success: true,
      message: 'Offer saved successfully',
      data: offer,
    });
  } catch (error) {
    console.error('❌ Create offer error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create offer',
    });
  }
};

/**
 * @desc    Get all offers for the logged-in user
 * @route   GET /api/offers
 * @access  Private
 */
exports.getOffers = async (req, res) => {
  try {
    const offers = await Offer.find({ user: req.user.id })
      .populate('application')
      .populate('job')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    console.error('❌ Get offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch offers',
    });
  }
};

/**
 * @desc    Update an offer
 * @route   PATCH /api/offers/:id
 * @access  Private
 */
exports.updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    ).populate(['application', 'job']);

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    // ── Activity Log ──
    await Activity.create({
      user: req.user.id,
      action: 'UPDATED_OFFER',
      entityType: 'Offer',
      entityId: offer._id,
      details: { company: offer.company, role: offer.role },
    }).catch(err => console.error('❌ Failed to log offer activity:', err));

    res.status(200).json({
      success: true,
      message: 'Offer updated',
      data: offer,
    });
  } catch (error) {
    console.error('❌ Update offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update offer',
    });
  }
};

/**
 * @desc    Delete an offer
 * @route   DELETE /api/offers/:id
 * @access  Private
 */
exports.deleteOffer = async (req, res) => {
  try {
    const offer = await Offer.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: 'Offer not found',
      });
    }

    // ── Activity Log ──
    await Activity.create({
      user: req.user.id,
      action: 'DELETED_OFFER',
      entityType: 'Offer',
      entityId: req.params.id,
      details: { company: offer.company, role: offer.role },
    }).catch(err => console.error('❌ Failed to log offer activity:', err));

    res.status(200).json({
      success: true,
      message: 'Offer deleted',
    });
  } catch (error) {
    console.error('❌ Delete offer error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete offer',
    });
  }
};

/**
 * @desc    Compare multiple offers side-by-side
 * @route   POST /api/offers/compare
 * @access  Private
 */
exports.compareOffers = async (req, res) => {
  try {
    const { offerIds } = req.body;

    if (!offerIds || !Array.isArray(offerIds) || offerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of offer IDs',
      });
    }

    const offers = await Offer.find({
      _id: { $in: offerIds },
      user: req.user.id,
    }).populate('job');

    // Build comparison table tailored to your model
    const comparison = {
      companies: offers.map((o) => o.company || o.job?.company || 'N/A'),
      roles: offers.map((o) => o.role || o.job?.title || 'N/A'),
      locations: offers.map((o) => 
        o.location?.city ? `${o.location.city}, ${o.location.country}` : 'N/A'
      ),
      ctc: offers.map((o) => o.compensation?.ctc || 0),
      baseSalaries: offers.map((o) => o.compensation?.baseSalary || 0),
      workModes: offers.map((o) => o.location?.workMode || 'N/A'),
      deadlines: offers.map((o) => o.offerDeadline),
      decisions: offers.map((o) => o.decision),
      comparisonScores: offers.map((o) => o.comparisonScore || 0),
    };

    res.status(200).json({
      success: true,
      data: {
        offers,
        comparison,
      },
    });
  } catch (error) {
    console.error('❌ Compare offers error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to compare offers',
    });
  }
};