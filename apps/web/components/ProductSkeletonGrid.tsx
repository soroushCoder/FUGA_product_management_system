

export default function ProductSkeletonGrid({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden bg-white ring-1 ring-black/5 shadow-sm">
                    <div className={`animate-pulse rounded-md bg-gray-200 w-full aspect-[4/3]`} />;
                </div>
            ))}
        </div>
    );
}
