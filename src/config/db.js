const mongoose = require('mongoose');
const config = require('./env');

/**
 * Connect to MongoDB with robust error handling and lifecycle listeners
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      autoIndex: true, // Build indexes in development
      serverSelectionTimeoutMS: 10000, // Timeout after 10s
    });

    console.log(`[Database] MongoDB Connected successfully: ${conn.connection.host} / ${conn.connection.name}`);

    // Database connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error(`[Database Error] MongoDB runtime error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[Database Warning] MongoDB connection disconnected. Attempting reconnect...');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('[Database Info] MongoDB reconnected successfully.');
    });

    // Handle process termination gracefully
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('[Database] MongoDB connection closed due to app termination (SIGINT)');
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      await mongoose.connection.close();
      console.log('[Database] MongoDB connection closed due to app termination (SIGTERM)');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error(`[Database Error] Could not connect to MongoDB: ${error.message}`);
    console.error('Please verify your MONGODB_URI in .env or MongoDB Atlas Network Access (IP whitelist).');
    process.exit(1);
  }
};

module.exports = connectDB;
