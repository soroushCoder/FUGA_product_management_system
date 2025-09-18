import { z } from 'zod';

export const ProductSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  artistName: z.string().min(1),
  coverUrl: z.string().url(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

export const IdParamSchema = z.object({ id: z.coerce.number().int().positive() });

export const ProductCreateSchema = z.object({
  name: z.string().min(1, 'name is required'),
  artistName: z.string().min(1, 'artistName is required')
});

export const ProductUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  artistName: z.string().min(1).optional()
});

// Types
export type Product = z.infer<typeof ProductSchema>;
export type ProductCreate = z.infer<typeof ProductCreateSchema>;
export type ProductUpdate = z.infer<typeof ProductUpdateSchema>;
