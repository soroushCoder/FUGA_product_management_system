'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmDialog({
  open,
  title = 'Delete item',
  description = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (open) cancelRef.current?.focus(); }, [open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open || !mounted) return null;

  const dialog = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg ring-1 ring-black/10">
        <h2 id="confirm-title" className="text-lg font-semibold">{title}</h2>
        <p id="confirm-desc" className="mt-2 text-sm text-gray-600">{description}</p>
        <div className="mt-4 flex items-center justify-end gap-2">
          <button ref={cancelRef} onClick={onCancel} className="h-10 rounded-xl border border-gray-300 bg-white px-4 hover:bg-gray-50">
            {cancelText}
          </button>
          <button onClick={onConfirm} className="h-10 rounded-xl bg-red-600 px-4 text-white hover:bg-red-700">
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, document.body);
}
