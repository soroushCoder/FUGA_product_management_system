import fs from 'node:fs/promises';
import { prismaClient as prisma } from '../../lib/prisma.js';

import { CONFIG } from '../../env.js';
import { AppError } from '../../middlewares/errors.js';

function absUrl(filename: string) {
  return `${CONFIG.PUBLIC_BASE_URL}/uploads/${filename}`;
}

export async function listProducts() {
  return prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getProduct(id: number) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, 'Product not found');
  return product;
}

export async function createProduct(args: {
  name: string;
  artistName: string;
  file?: Express.Multer.File;
}) {
  const { name, artistName, file } = args;
  if (!file) throw new AppError(400, 'cover is required');

  try {
    return await prisma.product.create({
      data: { name, artistName, coverUrl: absUrl(file.filename) }
    });
  } catch (e) {
    if (file?.path) fs.unlink(file.path).catch(() => {});
    throw e;
  }
}

export async function updateProduct(
  id: number,
  args: { name?: string; artistName?: string; file?: Express.Multer.File }
) {
  const { name, artistName, file } = args;

  const data: Record<string, unknown> = {};
  if (name) data.name = name;
  if (artistName) data.artistName = artistName;
  if (file) data.coverUrl = absUrl(file.filename);
  if (Object.keys(data).length === 0) {
    throw new AppError(422, 'No fields provided to update');
  }

  try {
    return await prisma.product.update({ where: { id }, data });
  } catch (e: any) {
    if (e?.code === 'P2025') throw new AppError(404, 'Product not found');
    if (file?.path) fs.unlink(file.path).catch(() => {});
    throw e;
  }
}

export async function deleteProduct(id: number) {
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e: any) {
    if (e?.code === 'P2025') throw new AppError(404, 'Product not found');
    throw e;
  }
}
