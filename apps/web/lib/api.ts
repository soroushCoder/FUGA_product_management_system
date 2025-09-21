import type { Product } from './types';

/** Keep this env var name consistent across the app */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

function url(path: string) {
  return `${API_BASE_URL.replace(/\/$/, '')}${path.startsWith('/') ? '' : '/'}${path}`;
}

export class ApiError extends Error {
  status: number;
  details?: unknown;
  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

/** Parse a fetch Response and throw ApiError on failure */
async function handle<T>(res: Response): Promise<T> {
  const ct = res.headers.get('content-type') || '';
  const isJson = ct.includes('application/json');

  if (res.ok) {
    if (res.status === 204) return undefined as unknown as T;
    return (isJson ? await res.json() : (await res.text())) as T;
  }

  // error path
  if (isJson) {
    const body = await res.json().catch(() => ({}));
    const msg = body?.message || res.statusText || 'Request failed';
    throw new ApiError(res.status, msg, body?.details);
  } else {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, text || res.statusText || 'Request failed');
  }
}

/** ---------- READ ---------- */

export async function getProducts(): Promise<Product[]> {
  const res = await fetch(url('/products'), { cache: 'no-store' });
  return handle<Product[]>(res);
}

export async function getProduct(id: number | string): Promise<Product> {
  const res = await fetch(url(`/products/${id}`), { cache: 'no-store' });
  return handle<Product>(res);
}

/** ---------- WRITE (multipart) ---------- */

type CreateInput = {
  name: string;
  artistName: string;
  cover: File; // required
};

type UpdateInput = {
  name?: string;
  artistName?: string;
  cover?: File; // optional
};

function toFormData(data: Record<string, unknown>): FormData {
  const fd = new FormData();
  for (const [k, v] of Object.entries(data)) {
    if (v === undefined || v === null) continue;
    if (v instanceof File) fd.append(k, v);
    else fd.append(k, String(v));
  }
  return fd;
}

export async function createProduct(input: CreateInput): Promise<Product> {
  const body = toFormData({
    name: input.name,
    artistName: input.artistName,
    cover: input.cover,
  });

  const res = await fetch(url('/products'), {
    method: 'POST',
    body,
  });
  return handle<Product>(res);
}

export async function updateProduct(id: number | string, input: UpdateInput): Promise<Product> {
  const body = toFormData({
    name: input.name,
    artistName: input.artistName,
    cover: input.cover,
  });

  const res = await fetch(url(`/products/${id}`), {
    method: 'PATCH',
    body,
  });
  return handle<Product>(res);
}

export async function removeProduct(id: number | string): Promise<void> {
  const res = await fetch(url(`/products/${id}`), { method: 'DELETE' });
  return handle<void>(res);
}

/** Optional small helper to probe API health (for e2e) */
export async function health(): Promise<{ ok: true }> {
  const res = await fetch(url('/health'), { cache: 'no-store' });
  return handle<{ ok: true }>(res);
}
