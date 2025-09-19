import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createProduct, updateProduct, getProduct } from '../../src/modules/products/service';
import { AppError } from '../../src/middlewares/errors';

vi.mock('../../src/lib/prisma', () => ({
    prisma: {
        product: {
            findUnique: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
        },
    },
}));
const { prisma } = await import('../../src/lib/prisma');

describe('products service', () => {
    beforeEach(() => vi.clearAllMocks());

    it('createProduct needs file', async () => {
        await expect(createProduct({ name: 'x', artistName: 'y' }))
            .rejects.toThrowError(new AppError(400, 'cover is required'));
    });

    it('getProduct 404 when not found', async () => {
        prisma.product.findUnique.mockResolvedValue(null);
        await expect(getProduct(99)).rejects.toMatchObject({ status: 404 });
    });

    it('updateProduct maps Prisma P2025 to 404', async () => {
        prisma.product.update.mockRejectedValue({ code: 'P2025' });
        await expect(updateProduct(1, { name: 'x' })).rejects.toMatchObject({ status: 404 });
    });

    it('updateProduct with no fields → 422', async () => {
        await expect(updateProduct(1, {})).rejects.toMatchObject({ status: 422 });
    });
});
