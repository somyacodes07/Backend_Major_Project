const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const interactionController = require('../controllers/interactionController');
const purchaseController = require('../controllers/purchaseController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createCustomerValidator,
  updateCustomerValidator,
  customerIdValidator,
  customerQueryValidator,
} = require('../validators/customerValidator');
const { logInteractionValidator } = require('../validators/interactionValidator');
const { createPurchaseValidator } = require('../validators/purchaseValidator');

// Protect all customer routes with JWT authentication
router.use(protect);

// Customer Analytics & Stats route (must be defined before /:id)
router.get('/stats/summary', customerController.getCustomerStats);

// Customer CRUD routes
router
  .route('/')
  .post(createCustomerValidator, validate, customerController.createCustomer)
  .get(customerQueryValidator, validate, customerController.getCustomers);

router
  .route('/:id')
  .get(customerIdValidator, validate, customerController.getCustomerById)
  .put(updateCustomerValidator, validate, customerController.updateCustomer)
  .delete(customerIdValidator, validate, customerController.deleteCustomer);

// Nested Interaction routes for a customer
router
  .route('/:id/interactions')
  .post(logInteractionValidator, validate, interactionController.logInteraction)
  .get(customerIdValidator, validate, interactionController.getCustomerInteractions);

// Nested Purchase routes for a customer
router
  .route('/:id/purchases')
  .post(createPurchaseValidator, validate, purchaseController.recordPurchase)
  .get(customerIdValidator, validate, purchaseController.getCustomerPurchases);

module.exports = router;
