'use client';

import * as React from 'react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import ProductCard from './ProductCard';
import type { Product } from '@/lib/types';
import { removeProduct } from '@/lib/api';

type Props = {
  products: Product[];
  onChanged: () => void; // called after a successful delete
};

export default function ProductList({ products, onChanged }: Props) {
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingId, setPendingId] = React.useState<number | null>(null);

  const askDelete = (id: number) => {
    setPendingId(id);
    setConfirmOpen(true);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingId(null);
  };

  const handleConfirm = async () => {
    if (pendingId == null) return;
    try {
      await removeProduct(pendingId);
      onChanged();
    } finally {
      handleCancel();
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => (
          <article key={p.id} role="article" aria-label={p.name}>
            <ProductCard product={p} onDelete={() => askDelete(p.id)} />
          </article>
        ))}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete product?"
        description="This will permanently remove the product. You can’t undo this."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
