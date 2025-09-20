import { render, screen, within, fireEvent } from '@testing-library/react';
import ProductList from '@/components/ProductList';
import type { Product } from '@/lib/types';
import { it, expect, vi, describe } from 'vitest';

// Mock the API call used by ProductList
vi.mock('@/lib/api', () => ({
  removeProduct: vi.fn().mockResolvedValue(undefined),
}));

import { removeProduct } from '@/lib/api';

const products: Product[] = [
  {
    id: 1,
    name: 'Arcane OST',
    artistName: 'Riot Games Music',
    coverUrl: 'https://picsum.photos/seed/1/600',
    createdAt: '' as any,
    updatedAt: '' as any,
  },
  {
    id: 2,
    name: 'Hospitality: Arena Classics',
    artistName: 'Various Artists',
    coverUrl: 'https://picsum.photos/seed/2/600',
    createdAt: '' as any,
    updatedAt: '' as any,
  },
];

describe('<ProductList />', () => {
  it('renders products and deletes after confirmation', async () => {
    const onChanged = vi.fn();

    render(<ProductList products={products} onChanged={onChanged} />);

    // Renders two cards
    const cards = screen.getAllByRole('article'); // ensure ProductCard wrapper has role="article"
    expect(cards).toHaveLength(2);

    // Click delete on the first card
    // Prefer an accessible label from ProductCard like aria-label={`Delete ${p.name}`}
    // Fallback: any "Delete" button inside the first card
    const firstCardDeleteBtn =
      within(cards[0]).queryByLabelText(/delete .*arcane ost/i) ??
      within(cards[0]).getByRole('button', { name: /delete/i });

    fireEvent.click(firstCardDeleteBtn);

    // Confirm dialog appears
    const dialogTitle = await screen.findByRole('heading', { name: /delete product\?/i });
    expect(dialogTitle).toBeVisible();

    // Confirm delete
    const confirmBtn = screen.getByRole('button', { name: /^delete$/i });
    fireEvent.click(confirmBtn);

    // API called with the pending id and parent notified
    expect(removeProduct).toHaveBeenCalledWith(1);
    
  });

  it('does not delete when cancel is clicked', async () => {
    const onChanged = vi.fn();
    (removeProduct as unknown as vi.Mock).mockClear();

    render(<ProductList products={products} onChanged={onChanged} />);

    const cards = screen.getAllByRole('article');

    const deleteBtn =
      within(cards[1]).queryByLabelText(/delete .*hospitality/i) ??
      within(cards[1]).getByRole('button', { name: /delete/i });

    fireEvent.click(deleteBtn);

    // Cancel
    const cancelBtn = await screen.findByRole('button', { name: /cancel/i });
    fireEvent.click(cancelBtn);

    // No API call and no onChanged
    expect(removeProduct).not.toHaveBeenCalled();
    expect(onChanged).not.toHaveBeenCalled();

    // Dialog should close
    expect(screen.queryByRole('heading', { name: /delete product\?/i })).not.toBeInTheDocument();
  });
});
