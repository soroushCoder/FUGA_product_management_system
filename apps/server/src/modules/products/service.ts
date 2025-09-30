import fs from 'node:fs/promises';
import { getPrisma } from '../../lib/prisma.js';

import { CONFIG } from '../../env.js';
import { AppError } from '../../middlewares/errors.js';
import { ProductCreate, ProductUpdate } from '@fuga/shared';


async function safeUnlink(filePath?: string) {
  if (!filePath) return;
  try {
    await fs.unlink(filePath);
  } catch (err: any) {
    // Ignore "file not found", log everything else
    if (err?.code !== 'ENOENT') {
      // replace with your logger (pino/winston/console)
      console.warn('Failed to delete temp file', { filePath, err });
    }
  }
}

function absUrl(filename: string) {
  return `${CONFIG.PUBLIC_BASE_URL}/uploads/${filename}`;
}


export async function listProducts() {
  const prisma = getPrisma();
  return prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
}

export async function getProduct(id: number) {
  const prisma = getPrisma();
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new AppError(404, 'Product not found');
  return product;
}

export async function createProduct(args: ProductCreate & { file?: Express.Multer.File }) {
  const { name, artistName, file } = args;
  const prisma = getPrisma();
  if (!file) throw new AppError(400, 'cover is required');

  try {
    return await prisma.product.create({
      data: { name, artistName, coverUrl: absUrl(file.filename) }
    });
  } catch (e) {
    await safeUnlink(file?.path);
    throw e;
  }
}

export async function updateProduct(
  id: number,
  args: ProductUpdate & { file?: Express.Multer.File }
) {
  const { name, artistName, file } = args;
  const prisma = getPrisma();

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
    await safeUnlink(file?.path);
    throw e;
  }
}

export async function deleteProduct(id: number) {
  const prisma = getPrisma();
  try {
    await prisma.product.delete({ where: { id } });
  } catch (e: any) {
    if (e?.code === 'P2025') throw new AppError(404, 'Product not found');
    throw e;
  }
}
