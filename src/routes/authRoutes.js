const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { registerValidator, loginValidator } = require('../validators/authValidator');

// Public routes
router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);

// Protected routes
router.get('/profile', protect, authController.getProfile);
router.put('/profile', protect, authController.updateProfile);

module.exports = router;
