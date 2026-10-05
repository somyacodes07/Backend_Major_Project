/**
 * Custom Error class for operational API errors
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg, errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Authentication required. Invalid or missing token.') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Access denied. You do not have permission to perform this action.') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Requested resource not found.') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Resource conflict or duplicate entry.') {
    return new ApiError(409, msg);
  }

  static internal(msg = 'Internal server error. Please try again later.') {
    return new ApiError(500, msg);
  }
}

module.exports = ApiError;
