'use client';

import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Product } from '../lib/types';
import ProductForm from '../components/ProductForm';
import ProductList from '../components/ProductList';
import { ReloadIcon } from '../components/Icons';


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
        <div className="flex gap-2">
          <a href="/api-reference" className="btn hidden sm:inline-flex">API</a>
          <button
            onClick={reload}
            aria-label="Reload products"
            title="Reload"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-gray-300 bg-white hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
          >
            <ReloadIcon className="w-5 h-5" />
          </button>
        </div>
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
