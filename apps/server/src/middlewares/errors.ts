import type { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export class AppError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown
  ) {
    super(message);
  }
}

// --- small type guards -------------------------------------------------------

function hasStringProp<K extends string>(
  obj: unknown,
  key: K
): obj is Record<K, string> {
  return typeof obj === 'object' && obj !== null &&
         typeof (obj as Record<string, unknown>)[key] === 'string';
}

// -----------------------------------------------------------------------------
// Centralized error handler (keep as the last middleware)
// -----------------------------------------------------------------------------
export function errorHandler(
  err: unknown,                          
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  // Multer/file errors
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large' });
  }
  if (hasStringProp(err, 'message') && err.message === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(400).json({ message: 'Only PNG, JPEG or WEBP images are allowed' });
  }

  // App-defined errors
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  // Fallback
  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ message: 'Internal Server Error' });
}

// Tiny helper for async routes (no any)
export const asyncHandler =
  <H extends (req: Request, res: Response, next: NextFunction) => unknown>(fn: H) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
