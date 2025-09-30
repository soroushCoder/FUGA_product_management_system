import type { Request, Response } from 'express';
import { AppError, asyncHandler } from '../../middlewares/errors.js';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from './service.js';
type MulterRequest = Request & { file?: Express.Multer.File };
/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     responses:
 *       200:
 *         description: Array of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Product' }
 */
export const list = asyncHandler(async (_req: Request, res: Response) => {
  res.json(await listProducts());
});

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get product by id
 *     parameters:
 *       - $ref: '#/components/parameters/ProductIdParam'
 *     responses:
 *       200:
 *         description: Product
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export const get = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(422, 'Invalid id');
  }
  res.json(await getProduct(id));
});

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema: { $ref: '#/components/schemas/NewProductRequest' }
 *           encoding:
 *             cover:
 *               contentType: image/png, image/jpeg, image/webp
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       400: { $ref: '#/components/responses/BadRequest' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
   const { name, artistName } = req.body as { name: string; artistName: string };
  const file = (req as MulterRequest).file;            
  const created = await createProduct({ name, artistName, file });
  res.status(201).json(created);
});

/**
 * @openapi
 * /products/{id}:
 *   patch:
 *     tags: [Products]
 *     summary: Update a product
 *     parameters:
 *       - $ref: '#/components/parameters/ProductIdParam'
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema: { $ref: '#/components/schemas/UpdateProductRequest' }
 *           encoding:
 *             cover:
 *               contentType: image/png, image/jpeg, image/webp
 *     responses:
 *       200:
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404: { $ref: '#/components/responses/NotFound' }
 *       422: { $ref: '#/components/responses/UnprocessableEntity' }
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(422, 'Invalid id');
  }
  const { name, artistName } = req.body as { name?: string; artistName?: string };
  const file = (req as MulterRequest).file;           
  const updated = await updateProduct(id, { name, artistName, file });
  res.json(updated);
});

/**
 * @openapi
 * /products/{id}:
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product
 *     parameters:
 *       - $ref: '#/components/parameters/ProductIdParam'
 *     responses:
 *       204: { description: No Content }
 *       404: { $ref: '#/components/responses/NotFound' }
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
   const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new AppError(422, 'Invalid id');
  }
  await deleteProduct(id);
  res.status(204).send();
});
