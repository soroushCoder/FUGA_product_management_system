// apps/web/__tests__/ProductList.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';

// mock the API used by ProductList
vi.mock('@/lib/api', () => ({
  removeProduct: vi.fn().mockResolvedValue(undefined),
}));

// optional: make ConfirmDialog simple & clickable for tests
vi.mock('@/components/ui/ConfirmDialog', () => ({
  default: (props: any) =>
    props.open ? (
      <div aria-label="confirm-dialog">
        <button onClick={props.onConfirm}>confirm</button>
        <button onClick={props.onCancel}>cancel</button>
      </div>
    ) : null,
}));

import { removeProduct } from '@/lib/api';
import ProductList from '@/components/ProductList'; // <- update path if needed
import type { Product } from '@/lib/types';

const products: Product[] = [
  { id: 1, name: 'Alpha', artistName:"Soroush", coverUrl: '/a.png', createdAt: '' as any, updatedAt: '' as any },
  { id: 2, name: 'Beta', artistName:"Ebadi",coverUrl: '/b.png', createdAt: '' as any, updatedAt: '' as any },
];

describe('ProductList', () => {
  it('renders products', () => {
    const onChanged = vi.fn();
    render(<ProductList products={products} onChanged={onChanged} />);

    expect(screen.getByRole('article', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Beta' })).toBeInTheDocument();
  });

  it('asks for confirmation and deletes, then calls onChanged', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    render(<ProductList products={products} onChanged={onChanged} />);

    // click delete button on the Beta card
    // (depends on how ProductCard exposes the delete button; tweak selector/alt text accordingly)
    const betaArticle = screen.getByRole('article', { name: 'Beta' });
    const deleteBtn = screen.getByRole('button', { name: /delete/i, hidden: true }) // or within(betaArticle).getByRole(...)
    await user.click(deleteBtn);

    // confirm dialog should appear (mocked)
    expect(screen.getByLabelText('confirm-dialog')).toBeInTheDocument();

    await user.click(screen.getByText('confirm'));

    expect(removeProduct).toHaveBeenCalledWith(2);
    expect(onChanged).toHaveBeenCalledTimes(1);
  });

  it('closes dialog on cancel and does not call removeProduct', async () => {
    const user = userEvent.setup();
    const onChanged = vi.fn();
    render(<ProductList products={products} onChanged={onChanged} />);

    const alphaArticle = screen.getByRole('article', { name: 'Alpha' });
    const deleteBtn = screen.getByRole('button', { name: /delete/i, hidden: true })
    await user.click(deleteBtn);

    await user.click(screen.getByText('cancel'));

    expect(removeProduct).not.toHaveBeenCalled();
    expect(onChanged).not.toHaveBeenCalled();
  });
});
