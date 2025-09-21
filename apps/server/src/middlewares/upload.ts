// apps/server/src/upload.ts
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs/promises';
import { CONFIG } from '../env.js';

await fs.mkdir(CONFIG.UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) =>
    cb(null, path.join(process.cwd(), CONFIG.UPLOAD_DIR)),
  filename: (_req, file, cb) => {
    const ts = Date.now();
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${ts}-${safe}`);
  }
});


const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp']);

const fileFilter: multer.Options['fileFilter'] = (_req, file, cb) => {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(new Error('UNSUPPORTED_FILE_TYPE'));
  }
  cb(null, true);
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter
});
