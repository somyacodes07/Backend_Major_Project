const { body, param } = require('express-validator');

const createPurchaseValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid customer ID in route parameter'),
  body('amount')
    .notEmpty()
    .withMessage('Purchase amount is required')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array of purchased products'),
  body('items.*.name')
    .optional()
    .notEmpty()
    .withMessage('Item name is required'),
  body('items.*.quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantity must be an integer greater than or equal to 1'),
  body('items.*.unitPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a non-negative number'),
  body('invoiceNumber')
    .optional()
    .trim(),
  body('paymentMethod')
    .optional()
    .isIn(['credit_card', 'bank_transfer', 'cash', 'upi', 'stripe', 'paypal'])
    .withMessage('Invalid payment method'),
  body('paymentStatus')
    .optional()
    .isIn(['paid', 'pending', 'refunded'])
    .withMessage('Invalid payment status'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date format'),
  body('notes')
    .optional()
    .trim(),
];

module.exports = {
  createPurchaseValidator,
};
