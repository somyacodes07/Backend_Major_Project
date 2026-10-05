const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/env');
const apiRoutes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// Security HTTP headers
app.use(helmet());

// Cross-Origin Resource Sharing
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (config.CLIENT_URL.includes('*') || config.CLIENT_URL.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive for development & REST testing
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request logging
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsers
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Root welcome & API overview endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to Small Business CRM REST API',
    version: '1.0.0',
    documentation: '/api/health',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile',
      },
      customers: {
        listAndSearch: 'GET /api/customers?search=&tag=&status=&sort=&page=&limit=',
        create: 'POST /api/customers',
        stats: 'GET /api/customers/stats/summary',
        details: 'GET /api/customers/:id',
        update: 'PUT /api/customers/:id',
        delete: 'DELETE /api/customers/:id',
      },
      interactions: {
        log: 'POST /api/customers/:id/interactions',
        list: 'GET /api/customers/:id/interactions',
        delete: 'DELETE /api/interactions/:id',
      },
      purchases: {
        record: 'POST /api/customers/:id/purchases',
        customerHistory: 'GET /api/customers/:id/purchases',
        allPurchases: 'GET /api/purchases',
      },
      salesSummary: {
        ownerAnalytics: 'GET /api/sales-summary (Owner Only)',
      },
    },
  });
});

// Mount all API routes under /api
app.use('/api', apiRoutes);

// Handle 404 routes
app.use(notFoundHandler);

// Centralized error handling
app.use(errorHandler);

module.exports = app;
