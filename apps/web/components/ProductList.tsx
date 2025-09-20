'use client';

import * as React from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';
import { api } from '@/lib/api';

type Props = {
  products: Product[];
  onChanged: () => void; // your existing reload()
  removeProduct: (id: number) => Promise<void>; // your delete API wrapper
};

export default function ProductList({ products, onChanged }: Props) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<number | null>(null);

  const askDelete = (id: number) => {
    setPendingId(id);
    setConfirmOpen(true);
  };

  const onConfirm = async () => {
    if (pendingId == null) return;
    try {
      await api.delete(`/products/${pendingId}`);
      onChanged();
    } finally {
      setConfirmOpen(false);
      setPendingId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            product={p}
            onDelete={() => askDelete(p.id)}   // ← open modal
          />
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete product?"
        description="This will permanently remove the product. You can’t undo this."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={onConfirm}
        onCancel={() => { setConfirmOpen(false); setPendingId(null); }}
      />
    </>
  );
}
