'use client';

type SortKey = 'newest' | 'oldest' | 'name';

export default function ProductFilters({
  search, setSearch,
  artist, setArtist,
  sort, setSort,
  artists
}: {
  search: string; setSearch: (v: string) => void;
  artist: string; setArtist: (v: string) => void; // 'all' or an artistName
  sort: SortKey; setSort: (v: SortKey) => void;
  artists: string[];
}) {
  return (
    <div className="card">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label className="block text-sm mb-1">Search</label>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Title or Artist…"
            className="input"
          />
        </div>

        <div className="sm:w-64">
          <label className="block text-sm mb-1">Artist</label>
          <select
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            className="input"
          >
            <option value="all">All artists</option>
            {artists.map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        </div>

        <div className="sm:w-48">
          <label className="block text-sm mb-1">Sort</label>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="input"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name (A–Z)</option>
          </select>
        </div>

        <button
          type="button"
          className="btn sm:self-auto"
          onClick={() => { setSearch(''); setArtist('all'); setSort('newest'); }}
          title="Reset filters"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
