const jwt = require('jsonwebtoken');
const config = require('../config/env');

/**
 * Generate a signed JWT token
 * @param {Object} payload - User identification and role
 * @returns {string} Signed JWT token
 */
const generateToken = (payload) => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  });
};

/**
 * Verify a JWT token
 * @param {string} token
 * @returns {Object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

module.exports = {
  generateToken,
  verifyToken,
};
