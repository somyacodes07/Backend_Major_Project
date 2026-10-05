const { validationResult } = require('express-validator');
const ApiError = require('../utils/apiError');

/**
 * Validates request schema and formats express-validator errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
      value: err.value,
    }));
    throw ApiError.badRequest('Request validation failed', formattedErrors);
  }
  next();
};

module.exports = validate;
