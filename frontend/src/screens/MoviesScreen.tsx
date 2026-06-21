import { useState, useEffect, useMemo } from 'react';
import { Search, SlidersHorizontal, Star, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Content } from '@/lib/api';

export default function MoviesScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cat, setCat] = useState('all');
  const [q, setQ] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [c, all] = await Promise.all([
          Content.categories("vod").catch(() => []),
          Content.streams("vod").catch(() => []),
        ]);
        setCategories(c || []);
        setMovies(all || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    let list = movies;
    if (cat !== "all") list = list.filter((c) => c.category_id === cat);
    if (q.trim()) {
      const ql = q.toLowerCase();
      list = list.filter((c) => (c.name || "").toLowerCase().includes(ql));
    }
    return list;
  }, [movies, cat, q]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="flex-shrink-0 pt-14 px-5 pb-3" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a0a0f 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Movies</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl px-2">
              <Search size={15} style={{ color: '#94a3b8' }} />
              <input
                type="text"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search..."
                className="bg-transparent border-none outline-none text-white text-sm w-24 py-2 px-2"
              />
            </div>
            <button className="flex items-center justify-center rounded-xl flex-shrink-0" style={{ width: 38, height: 38, background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
              <SlidersHorizontal size={17} style={{ color: '#94a3b8' }} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          <button
            onClick={() => setCat("all")}
            className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold"
            style={{
              background: cat === "all" ? 'linear-gradient(135deg, var(--brand-primary), #B80710)' : '#1A1A1A',
              color: cat === "all" ? '#fff' : '#64748b',
              border: cat === "all" ? 'none' : '1px solid #2A2A2A',
              boxShadow: cat === "all" ? '0 4px 12px rgba(229,9,20,0.3)' : 'none',
            }}
          >
            All
          </button>
          {categories.map((c) => {
            const isSelected = cat === c.category_id;
            return (
              <button
                key={c.category_id}
                onClick={() => setCat(c.category_id)}
                className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold"
                style={{
                  background: isSelected ? 'linear-gradient(135deg, var(--brand-primary), #B80710)' : '#1A1A1A',
                  color: isSelected ? '#fff' : '#64748b',
                  border: isSelected ? 'none' : '1px solid #2A2A2A',
                  boxShadow: isSelected ? '0 4px 12px rgba(229,9,20,0.3)' : 'none',
                }}
              >
                {c.category_name}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-2">
        <span className="text-xs font-medium" style={{ color: '#475569' }}>{filtered.length} movies</span>
        <button className="text-xs font-semibold" style={{ color: '#64748b' }}>Recently Added ▾</button>
      </div>
      <div className="flex-1 overflow-y-auto pb-20 px-5" style={{ scrollbarWidth: 'none' }}>
        <div className="grid grid-cols-3 gap-2.5">
          {filtered.map((m) => (
            <button key={m.stream_id} onClick={() => navigate(`/movie/${m.stream_id}`)}
              className="relative rounded-xl overflow-hidden text-left"
              style={{ aspectRatio: '2/3', border: '1px solid #2A2A2A' }}
            >
              <img src={m.stream_icon} alt={m.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop"; }} />
              <div className="absolute inset-x-0 bottom-0 p-2 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                <p className="text-xs font-semibold text-white leading-tight truncate">{m.name}</p>
                {m.rating && (
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={9} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                    <span style={{ color: '#fbbf24', fontSize: 10 }}>{m.rating}</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-10 text-xs text-zinc-500">
            No movies found.
          </div>
        )}
      </div>
      <BottomNav active="movies" />
    </div>
  );
}
