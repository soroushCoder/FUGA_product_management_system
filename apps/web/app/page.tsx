'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList';
import ProductFilters from '@/components/ProductFilters';
import { ReloadIcon } from '@/components/Icons';

type SortKey = 'newest' | 'oldest' | 'name';

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [artist, setArtist] = useState('all');
  const [sort, setSort] = useState<SortKey>('newest');

  async function reload() {
    const { data } = await api.get<Product[]>('/products');
    setProducts(data);
  }

  useEffect(() => { reload(); }, []);

  // unique artists for the dropdown
  const artists = useMemo(
    () => Array.from(new Set(products.map(p => p.artistName))).sort((a, b) => a.localeCompare(b)),
    [products]
  );

  // filtered + sorted list
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = products.filter(p => {
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.artistName.toLowerCase().includes(q);
      const matchesArtist = artist === 'all' || p.artistName === artist;
      return matchesQ && matchesArtist;
    });

    if (sort === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === 'oldest') {
      list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else {
      list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [products, search, artist, sort]);

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


      <ProductFilters
        search={search} setSearch={setSearch}
        artist={artist} setArtist={setArtist}
        sort={sort} setSort={setSort}
        artists={artists}
      />


      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Products</h2>
          <span className="text-sm text-gray-600">{filtered.length} result{filtered.length === 1 ? '' : 's'}</span>
        </div>
        <ProductList products={filtered} onChanged={reload} />
      </div>
    </div>
  );
}
