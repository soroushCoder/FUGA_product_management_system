import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '@/components/ProductCard';
import { it, expect, vi } from 'vitest';

const product = {
  id: 1,
  name: 'Arcane OST',
  artistName: 'Riot Games Music',
  coverUrl: 'https://picsum.photos/seed/arcane/600/600',
  createdAt: '',
  updatedAt: '',
};

it('renders title and artist, triggers delete', () => {
  const onDelete = vi.fn();
  render(<ProductCard product={product as any} onDelete={onDelete} />);
  expect(screen.getByText(/Arcane OST/i)).toBeInTheDocument();
  expect(screen.getByText(/Riot Games Music/i)).toBeInTheDocument();

  fireEvent.click(screen.getByLabelText(/delete arcane ost/i));
  expect(onDelete).toHaveBeenCalledTimes(1);
});
