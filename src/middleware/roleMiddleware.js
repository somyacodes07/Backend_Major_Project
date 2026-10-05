const ApiError = require('../utils/apiError');

/**
 * Role-Based Access Control (RBAC) Middleware
 * Restricts route access to specified roles
 * @param  {...string} allowedRoles - Array of authorized roles (e.g. 'owner', 'staff')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('User context is missing. Please authenticate first.'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied. Role '${req.user.role}' is not authorized to access this resource. Allowed roles: [${allowedRoles.join(', ')}]`
        )
      );
    }

    next();
  };
};

module.exports = {
  authorize,
};
