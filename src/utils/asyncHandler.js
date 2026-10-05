/**
 * Wraps an async route handler to catch errors and forward them to Express error middleware
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware handler
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
