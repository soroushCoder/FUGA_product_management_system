'use client';
import { FormEvent, useRef, useState } from 'react';
import { api } from '@/lib/api';

export default function ProductForm({ onCreated }: { onCreated: () => void }) {
  const nameRef = useRef<HTMLInputElement>(null);
  const artistRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true); setError(null);
    try {
      const form = new FormData();
      if (nameRef.current) form.append('name', nameRef.current.value);
      if (artistRef.current) form.append('artistName', artistRef.current.value);
      const file = fileRef.current?.files?.[0];
      if (file) form.append('cover', file);

      await api.post('/products', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      if (nameRef.current) nameRef.current.value = '';
      if (artistRef.current) artistRef.current.value = '';
      if (fileRef.current) fileRef.current.value = '';
      onCreated();
    } catch (err: any) {
      setError(err?.response?.data?.message ?? 'Failed to create product');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {error && <div className="text-red-600">{String(error)}</div>}
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm mb-1">Name</label>
          <input ref={nameRef} className="input" placeholder="Album or Single" required />
        </div>
        <div>
          <label className="block text-sm mb-1">Artist Name</label>
          <input ref={artistRef} className="input" placeholder="Artist or Band" required />
        </div>
      </div>
      <div>
        <label className="block text-sm mb-1">Cover Art</label>
        <input ref={fileRef} type="file" accept="image/*"   className="block w-full rounded-xl border border-gray-300 px-3 py-2
             file:mr-4 file:rounded-lg file:border-0 file:bg-gray-900 file:text-white
             file:px-4 file:py-2 file:cursor-pointer hover:file:bg-gray-800" required />
      </div>
      <button className="btn" disabled={busy}>{busy ? 'Creating…' : 'Create Product'}</button>
    </form>
  );
}
