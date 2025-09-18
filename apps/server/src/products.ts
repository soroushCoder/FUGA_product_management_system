import type { Request, Response } from 'express';
import fs from 'node:fs/promises';
import { prisma } from './prisma.js';
import { CONFIG } from './env.js';
import { AppError, asyncHandler } from './errors.js';        

/**
 * @openapi
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id: { type: integer }
 *         name: { type: string }
 *         artistName: { type: string }
 *         coverUrl: { type: string, format: uri }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
 *     NewProductRequest:
 *       type: object
 *       required: [name, artistName, cover]
 *       properties:
 *         name: { type: string }
 *         artistName: { type: string }
 *         cover: { type: string, format: binary }
 *     UpdateProductRequest:
 *       type: object
 *       properties:
 *         name: { type: string }
 *         artistName: { type: string }
 *         cover: { type: string, format: binary }
 */

function absUrl(filename: string) {
  return `${CONFIG.PUBLIC_BASE_URL}/uploads/${filename}`;
}

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: List products
 *     description: Returns all products ordered by newest first.
 *     responses:
 *       200:
 *         description: Array of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Product' }
 *             examples:
 *               sample:
 *                 value:
 *                   - id: 1
 *                     name: "Arcane: Piltover Nights (OST)"
 *                     artistName: "Riot Games Music"
 *                     coverUrl: "http://localhost:3000/uploads/cover1.png"
 *                     createdAt: "2025-09-01T10:00:00.000Z"
 *                     updatedAt: "2025-09-01T10:00:00.000Z"
 */
export const list = asyncHandler(async (_req: Request, res: Response) => {
  const items = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
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
  // id has been zod-validated in middleware; it's a number now
  const { id } = req.params as unknown as { id: number };
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, 'Product not found');
  res.json(product);
});

/**
 * @openapi
 * /products:
 *   post:
 *     tags: [Products]
 *     summary: Create a product
 *     description: Multipart form upload for a new product with cover art.
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
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */
export const create = asyncHandler(async (req: Request, res: Response) => {
  // Body fields already validated by zod middleware
  const { name, artistName } = req.body as { name: string; artistName: string };
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!file) throw new AppError(400, 'cover is required');

  try {
    const created = await prisma.product.create({
      data: { name, artistName, coverUrl: absUrl(file.filename) }
    });
    res.status(201).json(created);
  } catch (e) {
    // if DB failed after writing file, clean up the uploaded file
    if (file?.path) fs.unlink(file.path).catch(() => {});
    throw e;
  }
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
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       422:
 *         $ref: '#/components/responses/UnprocessableEntity'
 */
export const update = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  const { name, artistName } = req.body as { name?: string; artistName?: string };
  const file = (req as any).file as Express.Multer.File | undefined;

  if (!name && !artistName && !file) {
    throw new AppError(422, 'No fields provided to update');
  }

  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (artistName) data.artistName = artistName;
  if (file) data.coverUrl = absUrl(file.filename);

  try {
    const updated = await prisma.product.update({ where: { id }, data });
    res.json(updated);
  } catch (e: any) {
    // Prisma record not found
    if (e?.code === 'P2025') throw new AppError(404, 'Product not found');
    // clean up new file if update failed for any reason
    if (file?.path) fs.unlink(file.path).catch(() => {});
    throw e;
  }
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
 *       204:
 *         description: No Content
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
export const remove = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params as unknown as { id: number };
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e: any) {
    if (e?.code === 'P2025') throw new AppError(404, 'Product not found');
    throw e;
  }
  res.status(204).send();
});
