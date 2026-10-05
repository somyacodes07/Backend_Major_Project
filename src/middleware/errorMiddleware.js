const config = require('../config/env');
const ApiError = require('../utils/apiError');

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  next(ApiError.notFound(`Cannot find ${req.method} ${req.originalUrl} on this server`));
};

/**
 * Global centralized error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Handle Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    const message = `Resource not found with id of '${err.value}'`;
    error = ApiError.notFound(message);
  }

  // Handle Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const message = `Duplicate value entered for '${field}'. This value must be unique.`;
    error = ApiError.conflict(message);
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const message = 'Validation failed';
    const validationErrors = Object.values(err.errors).map((val) => ({
      field: val.path,
      message: val.message,
    }));
    error = ApiError.badRequest(message, validationErrors);
  }

  // Handle JWT Error
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid authentication token.');
  }

  // Handle JWT Expired Error
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Authentication token has expired.');
  }

  const responsePayload = {
    success: false,
    statusCode: error.statusCode,
    message: error.message || 'Internal Server Error',
    errors: error.errors && error.errors.length > 0 ? error.errors : undefined,
  };

  // Include stack trace only in development
  if (config.NODE_ENV === 'development') {
    responsePayload.stack = err.stack;
  }

  res.status(error.statusCode).json(responsePayload);
};

module.exports = {
  notFoundHandler,
  errorHandler,
};
