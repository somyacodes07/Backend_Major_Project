const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { ROLES } = require('../constants/roles');

/**
 * Route: GET /api/sales-summary
 * Description: Total sales aggregation and customer purchase breakdown
 * Access: Private (OWNER ONLY)
 */
router.get(
  '/sales-summary',
  protect,
  authorize(ROLES.OWNER),
  salesController.getSalesSummary
);

module.exports = router;
