import type { Request, Response } from 'express';
import { prisma } from './prisma.js';
import { CONFIG } from './env.js';

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
 *         coverUrl: { type: string }
 *         createdAt: { type: string, format: date-time }
 *         updatedAt: { type: string, format: date-time }
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

export async function list(_req: Request, res: Response) {
  const items = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
}

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

export async function get(req: Request, res: Response) {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
}

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
 *               contentType: image/png, image/jpeg
 *     responses:
 *       201:
 *         description: Created
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *             examples:
 *               created:
 *                 value:
 *                   id: 12
 *                   name: "Arcane: Piltover Nights (OST)"
 *                   artistName: Riot Games Music
 *                   coverUrl: http://localhost:3000/uploads/1694976620000-123.png
 *                   createdAt: 2025-09-17T12:00:00.000Z
 *                   updatedAt: 2025-09-17T12:00:00.000Z
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 */

export async function create(req: Request, res: Response) {
  const { name, artistName } = req.body as { name?: string; artistName?: string };
  const file = (req as any).file as Express.Multer.File | undefined;
  if (!name || !artistName) return res.status(400).json({ message: 'name and artistName are required' });
  if (!file) return res.status(400).json({ message: 'cover is required' });

  const created = await prisma.product.create({
    data: { name, artistName, coverUrl: absUrl(file.filename) }
  });
  res.status(201).json(created);
}

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
 *               contentType: image/png, image/jpeg
 *     responses:
 *       200:
 *         description: Updated product
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */

export async function update(req: Request, res: Response) {
  const id = Number(req.params.id);
  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: 'Product not found' });

  const { name, artistName } = req.body as { name?: string; artistName?: string };
  const file = (req as any).file as Express.Multer.File | undefined;
  const coverUrl = file ? absUrl(file.filename) : undefined;

  const updated = await prisma.product.update({
    where: { id },
    data: { name: name ?? undefined, artistName: artistName ?? undefined, coverUrl }
  });
  res.json(updated);
}

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

export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: 'Product not found' });
  await prisma.product.delete({ where: { id } });
  res.status(204).send();
}
