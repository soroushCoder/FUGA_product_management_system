'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Product } from '../lib/types';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);

  async function reload() {
    const { data } = await api.get<Product[]>('/products');
    setProducts(data);
  }

  useEffect(() => { reload(); }, []);

  return (
    <div className="container space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">FUGA Products</h1>
        <button className="btn" onClick={reload}>Reload</button>
      </header>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Create Product</h2>
        <ProductForm onCreated={reload} />
      </div>

      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Products</h2>
        <ProductList products={products} onChanged={reload} />
      </div>
    </div>
  );
}
