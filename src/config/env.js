const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/crm_db',
  JWT_SECRET: process.env.JWT_SECRET || 'crm_default_secret_key_development_only',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map((url) => url.trim()) : ['*'],
};

// Validate critical environment variables in production
if (config.NODE_ENV === 'production') {
  const missing = [];
  if (!process.env.MONGODB_URI) missing.push('MONGODB_URI');
  if (!process.env.JWT_SECRET) missing.push('JWT_SECRET');

  if (missing.length > 0) {
    console.error(`FATAL: Missing required production environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }
}

module.exports = config;
