'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import type { Product } from '@/lib/types';
import ProductForm from '@/components/ProductForm';
import ProductList from '@/components/ProductList';
import ProductFilters from '@/components/ProductFilters';
import { ReloadIcon } from '@/components/ui/Icons';
import ProductSkeletonGrid from '@/components/ProductSkeletonGrid';
import { useDebouncedValue } from '@/lib/useDebouncedValue';


type SortKey = 'newest' | 'oldest' | 'name';

const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export default function Page() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [artist, setArtist] = useState('all');
  const [sort, setSort] = useState<SortKey>('newest');
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebouncedValue(search, 300);


  async function reload() {
    setLoading(true);
    try {
      const { data } = await api.get<Product[]>('/products');
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { reload(); }, []);

  // unique artists for the dropdown
  const artists = useMemo(
    () => Array.from(new Set(products.map(p => p.artistName))).sort((a, b) => a.localeCompare(b)),
    [products]
  );


  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    let list = products.filter(p => {
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.artistName.toLowerCase().includes(q);
      const matchesArtist = artist === 'all' || p.artistName === artist;
      return matchesQ && matchesArtist;
    });
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    else if (sort === 'oldest') list = [...list].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    else list = [...list].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return list;
  }, [products, debouncedSearch, artist, sort]);

  return (
    <div className="container space-y-6">
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
          {!loading && (
            <span className="text-sm text-gray-600">
              {filtered.length} result{filtered.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {loading ? (
          <ProductSkeletonGrid count={8} />
        ) : (
          <ProductList products={filtered} onChanged={reload} />
        )}
      </div>
    </div>
  );
}
