'use client';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductCard from './ProductCard';

export default function ProductList({
  products,
  onChanged
}: { products: Product[]; onChanged: () => void }) {

  async function remove(id: number) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    onChanged();
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {products.map(p => (
        <ProductCard key={p.id} product={p} onDelete={remove} />
      ))}
      {products.length === 0 && (
        <div className="text-gray-600">No products yet.</div>
      )}
    </div>
  );
}
