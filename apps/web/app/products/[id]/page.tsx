import Image from 'next/image';

async function getProduct(id: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/products/${id}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);
  if (!product) return <div className="container p-6">Not found.</div>;

  return (
    <div className="container p-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden ring-1 ring-black/5 shadow-sm bg-black/5">
          <Image src={product.coverUrl} alt={product.name} fill className="object-cover" />
        </div>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-lg text-gray-700">{product.artistName}</p>
          <a href="/" className="btn inline-block">← Back</a>
        </div>
      </div>
    </div>
  );
}
