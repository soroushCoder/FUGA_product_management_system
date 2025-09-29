'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import { TrashIcon } from '@/components/ui/Icons';

type Props = {
    product: Product;
    onDelete?: (id: number) => void;
};

export default function ProductCard({ product, onDelete }: Props) {
    return (
        <div className="group relative rounded-2xl overflow-hidden bg-black/5 shadow-sm ring-1 ring-black/5">
    
            <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                    src={product.coverUrl}
                    alt={product.name}
                    fill
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    priority={false}
                />
             
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />
            </div>

       
            <Link
                href={`/products/${product.id}`}
                className="absolute inset-0 flex items-end focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
                <div className="w-full p-4 text-white">
                    <h3 className="text-lg font-semibold leading-snug">
                        {product.name}
                    </h3>
                    <p className="text-sm opacity-90">{product.artistName}</p>
                    <span className="mt-2 inline-flex text-sm items-center gap-1 opacity-90 group-hover:opacity-100">
                        More <span aria-hidden>→</span>
                    </span>
                </div>
            </Link>

 
            {onDelete && (
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete?.(product.id); }}
                    className="absolute top-3 right-3 inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/90 text-gray-900 shadow ring-1 ring-black/10 hover:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-black/30"
                    aria-label={`Delete ${product.name}`}
                    title="Delete"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>

            )}
        </div>
    );
}
