'use client';
import { api } from '../lib/api';
import type { Product } from '../lib/types';

export default function ProductList({ products, onChanged }: { products: Product[]; onChanged: () => void }) {
  async function remove(id: number) {
    if (!confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    onChanged();
  }

  return (
    <div className="grid grid-auto gap-4">
      {products.map((p) => (
        <div key={p.id} className="border rounded-xl p-3 flex items-center gap-3 bg-white">
          <img src={p.coverUrl} alt={p.name} className="w-16 h-16 object-cover rounded-lg border" />
          <div className="flex-1">
            <div className="font-semibold">{p.name}</div>
            <div className="text-sm text-gray-600">{p.artistName}</div>
          </div>
          <button className="btn" onClick={() => remove(p.id)}>Delete</button>
        </div>
      ))}
      {products.length === 0 && <div className="text-gray-600">No products yet.</div>}
    </div>
  );
}
