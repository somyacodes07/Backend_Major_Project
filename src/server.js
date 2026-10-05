const app = require('./app');
const connectDB = require('./config/db');
const config = require('./config/env');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`[FATAL] Uncaught Exception: ${err.message}`);
  console.error(err.stack);
  process.exit(1);
});

// Connect to MongoDB and start HTTP Server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(config.PORT, () => {
      console.log('====================================================');
      console.log(`🚀 CRM Backend Server running in [${config.NODE_ENV}] mode`);
      console.log(`📡 Listening on http://localhost:${config.PORT}`);
      console.log(`🔍 Health Check: http://localhost:${config.PORT}/api/health`);
      console.log('====================================================');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err) => {
      console.error(`[FATAL] Unhandled Rejection: ${err.message}`);
      console.error(err.stack);
      server.close(() => {
        process.exit(1);
      });
    });
  } catch (error) {
    console.error(`[Startup Error] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
