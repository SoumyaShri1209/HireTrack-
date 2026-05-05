// const express = require('express');
// const router = express.Router();
// const { protect } = require('../middleware/auth');
// const {
//   register,
//   login,
//   logout,
//   refreshToken,
//   getMe,
// } = require('../controllers/authController');

// // Public routes
// router.post('/register', register);
// router.post('/login', login);
// router.post('/refresh', refreshToken);

// // Protected routes
// router.post('/logout', protect, logout);
// router.get('/me', protect, getMe);

// module.exports = router;






const express = require('express');
const router = express.Router();
const passport = require('../config/passport');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  refreshToken,
  getMe,
  googleCallback,
  updatePreferences
} = require('../controllers/authController');


// Email/Password
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', logout);
router.get('/me',protect,getMe);
router.patch('/preferences', protect, updatePreferences);

// Google OAuth
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth/google-error` }),
  googleCallback
);

module.exports = router;