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
 *     summary: List products
 *     responses:
 *       200:
 *         description: OK
 */
export async function list(_req: Request, res: Response) {
  const items = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(items);
}

/**
 * @openapi
 * /products/{id}:
 *   get:
 *     summary: Get by id
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
 *     summary: Create
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [name, artistName, cover]
 *             properties:
 *               name: { type: string }
 *               artistName: { type: string }
 *               cover: { type: string, format: binary }
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
 *     summary: Update
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
 *     summary: Delete
 */
export async function remove(req: Request, res: Response) {
  const id = Number(req.params.id);
  const exists = await prisma.product.findUnique({ where: { id } });
  if (!exists) return res.status(404).json({ message: 'Product not found' });
  await prisma.product.delete({ where: { id } });
  res.status(204).send();
}
