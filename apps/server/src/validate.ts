import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { AppError } from './errors.js';
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  IdParamSchema
} from '@fuga/shared';

export const Schemas = {
  create: ProductCreateSchema,
  update: ProductUpdateSchema,
  id: IdParamSchema
};

export function validate(schema: ZodSchema, source: 'body' | 'params' | 'query' = 'body') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse((req as any)[source]);
    if (!parsed.success) {
      return next(new AppError(422, 'Validation failed', parsed.error.flatten()));
    }
    (req as any)[source] = parsed.data;
    next();
  };
}
