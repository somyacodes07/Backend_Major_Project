const { body, param } = require('express-validator');

const logInteractionValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid customer ID in route parameter'),
  body('type')
    .notEmpty()
    .withMessage('Interaction type is required')
    .isIn(['call', 'email', 'meeting', 'message', 'note'])
    .withMessage('Type must be one of: call, email, meeting, message, note'),
  body('summary')
    .trim()
    .notEmpty()
    .withMessage('Interaction summary is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Summary must be between 3 and 200 characters'),
  body('details')
    .optional()
    .trim(),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date string'),
  body('outcome')
    .optional()
    .isIn(['successful', 'follow_up_needed', 'no_answer', 'cancelled', 'completed'])
    .withMessage('Outcome must be one of: successful, follow_up_needed, no_answer, cancelled, completed'),
];

const interactionIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid interaction ID format'),
];

module.exports = {
  logInteractionValidator,
  interactionIdValidator,
};
