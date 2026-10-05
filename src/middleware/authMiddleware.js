const User = require('../models/User');
const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/apiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Authentication Middleware: Protects routes and populates req.user
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Extract token from Authorization header (Bearer <token>)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw ApiError.unauthorized('Access denied. No authentication token provided.');
  }

  try {
    const decoded = verifyToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw ApiError.unauthorized('The user belonging to this token no longer exists.');
    }

    if (!user.isActive) {
      throw ApiError.forbidden('Your account has been deactivated. Please contact the administrator.');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw ApiError.unauthorized('Invalid authentication token.');
    }
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Your authentication token has expired. Please log in again.');
    }
    throw error;
  }
});

module.exports = {
  protect,
};
