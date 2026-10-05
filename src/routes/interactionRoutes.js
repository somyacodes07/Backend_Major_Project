const express = require('express');
const router = express.Router();
const interactionController = require('../controllers/interactionController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const { interactionIdValidator } = require('../validators/interactionValidator');

router.use(protect);

router.delete('/:id', interactionIdValidator, validate, interactionController.deleteInteraction);

module.exports = router;
