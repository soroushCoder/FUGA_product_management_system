import type { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Multer/file errors
  if (err?.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large' });
  }
  if (err?.message === 'UNSUPPORTED_FILE_TYPE') {
    return res.status(400).json({ message: 'Only PNG, JPEG or WEBP images are allowed' });
  }

  // App-defined errors
  if (err instanceof AppError) {
    return res.status(err.status).json({ message: err.message, details: err.details });
  }

  // Fallback
  console.error(err);
  return res.status(500).json({ message: 'Internal Server Error' });
}

// tiny helper for async routes
export const asyncHandler =
  <T extends (...args: any[]) => any>(fn: T) =>
  (req: Request, res: Response, next: NextFunction) =>
    Promise.resolve(fn(req, res, next)).catch(next);
