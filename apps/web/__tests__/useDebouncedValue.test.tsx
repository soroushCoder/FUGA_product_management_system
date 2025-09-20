import { renderHook, act } from '@testing-library/react';
import {useDebouncedValue} from '@/lib/useDebouncedValue';
import { it, expect, vi } from 'vitest';

vi.useFakeTimers();

it('debounces value', () => {
  const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 300), { initialProps: { v: 'a' } });
  expect(result.current).toBe('a');

  rerender({ v: 'ab' });
  expect(result.current).toBe('a');

  act(() => vi.advanceTimersByTime(299));
  expect(result.current).toBe('a');

  act(() => vi.advanceTimersByTime(1));
  expect(result.current).toBe('ab');
});
