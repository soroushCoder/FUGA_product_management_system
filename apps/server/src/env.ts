import 'dotenv/config';

export const CONFIG = {
  PORT: Number(process.env.PORT || 3000),
  PUBLIC_BASE_URL: (process.env.PUBLIC_BASE_URL || 'http://localhost:3000').replace(/\/$/, ''),
  UPLOAD_DIR: process.env.UPLOAD_DIR || 'uploads',
  DATABASE_URL: process.env.DATABASE_URL || ''
};