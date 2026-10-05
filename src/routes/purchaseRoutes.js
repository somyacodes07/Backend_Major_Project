const express = require('express');
const router = express.Router();
const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', purchaseController.getAllPurchases);

module.exports = router;
