const jwt = require('jsonwebtoken');
const User = require('../models/User');





exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    console.log('🔐 Auth Middleware:');
    console.log('  - Authorization header:', req.headers.authorization);
    console.log('  - Extracted token:', token ? 'Present' : 'Missing');

    // Check if token exists
    if (!token) {
      console.log('  - ❌ No token provided');
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('  - ✅ Token verified, user ID:', decoded.id);

    // Get user from token
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      console.log('  - ❌ User not found');
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log('  - ✅ User authenticated:', req.user.email);
    next();
  } catch (error) {
    console.error('  - ❌ Auth error:', error.message);
    res.status(401).json({
      success: false,
      message: 'Not authorized, token failed',
    });
  }
};