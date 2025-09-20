import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { it, expect, vi } from 'vitest';

it('calls onConfirm', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<ConfirmDialog open title="Delete?" onConfirm={onConfirm} onCancel={onCancel} />);
  fireEvent.click(screen.getByRole('button', { name: /delete/i }));
  expect(onConfirm).toHaveBeenCalledTimes(1);
});

it('esc closes (onCancel)', () => {
  const onConfirm = vi.fn();
  const onCancel = vi.fn();
  render(<ConfirmDialog open title="Delete?" onConfirm={onConfirm} onCancel={onCancel} />);
  fireEvent.keyDown(window, { key: 'Escape' });
  expect(onCancel).toHaveBeenCalledTimes(1);
});
