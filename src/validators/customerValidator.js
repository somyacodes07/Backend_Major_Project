const { body, query, param } = require('express-validator');

const createCustomerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 120 })
    .withMessage('Name must be between 2 and 120 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Customer email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('company')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .custom((value) => {
      if (Array.isArray(value) || typeof value === 'string') {
        return true;
      }
      throw new Error('Tags must be an array of strings or comma-separated string');
    }),
  body('status')
    .optional()
    .isIn(['lead', 'prospect', 'active', 'inactive'])
    .withMessage('Status must be one of: lead, prospect, active, inactive'),
  body('notes')
    .optional()
    .trim(),
];

const updateCustomerValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid customer ID format'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 120 })
    .withMessage('Name must be between 2 and 120 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('phone')
    .optional()
    .trim(),
  body('company')
    .optional()
    .trim(),
  body('tags')
    .optional()
    .custom((value) => {
      if (Array.isArray(value) || typeof value === 'string') {
        return true;
      }
      throw new Error('Tags must be an array of strings or comma-separated string');
    }),
  body('status')
    .optional()
    .isIn(['lead', 'prospect', 'active', 'inactive'])
    .withMessage('Status must be one of: lead, prospect, active, inactive'),
  body('notes')
    .optional()
    .trim(),
];

const customerIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid customer ID format'),
];

const customerQueryValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['lead', 'prospect', 'active', 'inactive'])
    .withMessage('Invalid status filter'),
  query('minLastContactDate')
    .optional()
    .isISO8601()
    .withMessage('minLastContactDate must be a valid ISO 8601 date'),
  query('maxLastContactDate')
    .optional()
    .isISO8601()
    .withMessage('maxLastContactDate must be a valid ISO 8601 date'),
];

module.exports = {
  createCustomerValidator,
  updateCustomerValidator,
  customerIdValidator,
  customerQueryValidator,
};
