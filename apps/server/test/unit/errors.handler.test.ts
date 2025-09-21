import { describe, it, expect } from 'vitest';
import { errorHandler, AppError } from '../../src/middlewares/errors';
import multer from 'multer';

const call = (err: unknown) =>
  new Promise((resolve) =>
    errorHandler(err, {} as any, { status: (s: number) => ({ json: (b: any) => resolve({ s, b }) }) } as any, () => {})
  );

describe('error handler', () => {
  it('413 on Multer LIMIT_FILE_SIZE', async () => {
    const e = new multer.MulterError('LIMIT_FILE_SIZE');
    const { s, b }: any = await call(e);
    expect(s).toBe(413);
    expect(b.message).toMatch(/File too large/);
  });
  it('400 on UNSUPPORTED_FILE_TYPE', async () => {
    const { s }: any = await call(new Error('UNSUPPORTED_FILE_TYPE'));
    expect(s).toBe(400);
  });
  it('AppError passthrough', async () => {
    const { s, b }: any = await call(new AppError(418, 'teapot'));
    expect(s).toBe(418);
    expect(b.message).toBe('teapot');
  });
});
