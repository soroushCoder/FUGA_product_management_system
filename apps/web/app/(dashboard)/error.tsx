'use client';

export default function Error({
  error,
  reset,
}: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <h2 className="text-lg font-semibold mb-2">Something went wrong.</h2>
      <p className="text-sm text-gray-600 mb-4">{error.message}</p>
      <button
        onClick={() => reset()}
        className="rounded-lg bg-black px-4 py-2 text-white"
      >
        Try again
      </button>
    </div>
  );
}
