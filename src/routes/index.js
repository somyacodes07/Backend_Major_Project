const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const customerRoutes = require('./customerRoutes');
const interactionRoutes = require('./interactionRoutes');
const purchaseRoutes = require('./purchaseRoutes');
const salesRoutes = require('./salesRoutes');

// API Health Check & Info
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Small Business CRM REST API',
    version: '1.0.0',
  });
});

// Mount modular sub-routers
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/interactions', interactionRoutes);
router.use('/purchases', purchaseRoutes);
router.use('/', salesRoutes); // Mounts /sales-summary

module.exports = router;
