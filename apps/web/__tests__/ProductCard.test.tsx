import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';

const product = { id: 1, name: 'Arcane OST', artistName: 'Riot Games Music', coverUrl: 'https://picsum.photos/seed/x/600/600', createdAt: '', updatedAt: '' };

it('renders overlay text and triggers delete', () => {
  const onDelete = vi.fn();
  render(<ProductCard product={product} onDelete={onDelete} />);
  const deleteBtn = screen.getByLabelText(/Delete Arcane OST/);
  fireEvent.click(deleteBtn);
  expect(onDelete).toHaveBeenCalledWith(1);
});
