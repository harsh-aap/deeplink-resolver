// src/config/env.ts
import dotenv from 'dotenv';

dotenv.config();

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || '8000',
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',

  // Database
  DB_NAME: getEnvVar('DB_NAME'),
  DB_USER: getEnvVar('DB_USER'),
  DB_PASS: getEnvVar('DB_PASS'),
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: process.env.DB_PORT || '5432'
};

// Validate critical environment variables on startup
export function validateEnv() {
  const required = ['DB_NAME', 'DB_USER', 'DB_PASS'];
  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
