// src/config/env.ts
import dotenv from 'dotenv';
dotenv.config();

export const env = {
    PORT: process.env.PORT || '8000',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PORT: Number(process.env.DB_PORT) || 5432,
  DB_NAME: process.env.DB_NAME || 'postgres',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_PASS: process.env.DB_PASS || '', // <- make sure this is a string
};

