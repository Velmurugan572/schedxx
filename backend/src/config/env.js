// ==========================================
// Environment Variables Parser & Validator
// ==========================================

import dotenv from 'dotenv';
import path from 'path';

// Load environmental parameters
dotenv.config();

// List of mandatory keys required to run Sched securely
const requiredEnvVars = [
  'DATABASE_URL',
  'REDIS_URL',
  'JWT_SECRET',
  'ENCRYPTION_KEY'
];

// Validate variables are set at startup
for (const key of requiredEnvVars) {
  if (!process.env[key]) {
    throw new Error(`CRITICAL STARTUP ERROR: Missing environment variable [${key}]. Check your .env configuration.`);
  }
}

// Additional production security validation
if (process.env.NODE_ENV === 'production') {
  if (process.env.JWT_SECRET === 'supersecret' || process.env.JWT_SECRET === 'change-me' || process.env.JWT_SECRET.length < 32) {
    throw new Error('CRITICAL STARTUP ERROR: Insecure or too short JWT_SECRET configured for production.');
  }
  if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 32) {
    throw new Error('CRITICAL STARTUP ERROR: ENCRYPTION_KEY must be exactly 32 characters long.');
  }
}

const rawOrigins = process.env.ALLOWED_ORIGINS;
const parsedOrigins = rawOrigins ? rawOrigins.split(',').map(o => o.trim()) : (process.env.NODE_ENV === 'production' ? [] : ['*']);

// Export structured, validated variables object
export const env = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  redisUrl: process.env.REDIS_URL,
  jwtSecret: process.env.JWT_SECRET,
  encryptionKey: process.env.ENCRYPTION_KEY,
  allowedOrigins: parsedOrigins,
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes default
  
  // Platform App secrets (nullable for Phase 1)
  metaAppId: process.env.META_APP_ID || null,
  metaAppSecret: process.env.META_APP_SECRET || null,
  linkedinClientId: process.env.LINKEDIN_CLIENT_ID || null,
  linkedinClientSecret: process.env.LINKEDIN_CLIENT_SECRET || null,
  xApiKey: process.env.X_API_KEY || null,
  xApiSecret: process.env.X_API_SECRET || null,
  
  // AI secrets (nullable for Phase 1)
  geminiApiKey: process.env.GEMINI_API_KEY || null,
  openaiApiKey: process.env.OPENAI_API_KEY || null
};
export default env;
