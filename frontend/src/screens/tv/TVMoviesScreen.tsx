import { useState, useEffect, useMemo } from 'react';
import { Star, SlidersHorizontal, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import TVSideNav from './TVSideNav';
import { Content } from '@/lib/api';

export default function TVMoviesScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [cat, setCat] = useState('all');

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
    return list;
  }, [movies, cat]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#030608' }}>
        <Loader2 className="w-10 h-10 animate-spin text-[#E50914]" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 flex" style={{ background: '#030608' }}>
      <TVSideNav active="movies" />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Movies</h1>
            <p className="text-xs" style={{ color: '#475569' }}>{filtered.length} titles available</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Category pills */}
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              <button tabIndex={0} onClick={() => setCat("all")}
                className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: cat === "all" ? 'linear-gradient(135deg, #E50914, #B80710)' : '#1A1A1A',
                  color: cat === "all" ? '#fff' : '#64748b',
                  border: cat === "all" ? 'none' : '1px solid #2A2A2A',
                }}>
                All
              </button>
              {categories.map((c) => {
                const isSelected = cat === c.category_id;
                return (
                  <button tabIndex={0} key={c.category_id}
                    onClick={() => setCat(c.category_id)}
                    className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #E50914, #B80710)' : '#1A1A1A',
                      color: isSelected ? '#fff' : '#64748b',
                      border: isSelected ? 'none' : '1px solid #2A2A2A',
                    }}>
                    {c.category_name}
                  </button>
                );
              })}
            </div>
            <button tabIndex={0} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold group focus:outline-none"
              style={{ background: '#1A1A1A', color: '#64748b', border: '1px solid #2A2A2A' }}>
              <SlidersHorizontal size={13} /> Filter
            </button>
          </div>
        </div>

        {/* Movies grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'none' }}>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {filtered.map((m) => (
              <button tabIndex={0} key={m.stream_id}
                onClick={() => navigate(`/watch/movie/${m.stream_id}`)}
                className="relative rounded-xl overflow-hidden group text-left"
                style={{ aspectRatio: '2/3', border: '1px solid #2A2A2A' }}
              >
                <img src={m.stream_icon} alt={m.name} className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop"} />
                <div className="absolute inset-x-0 bottom-0 p-1.5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                  <p className="font-semibold text-white truncate" style={{ fontSize: 9 }}>{m.name}</p>
                  {m.rating && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Star size={8} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                      <span style={{ color: '#fbbf24', fontSize: 8 }}>{m.rating}</span>
                    </div>
                  )}
                </div>
                {/* Focus ring */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 group-focus:opacity-100 pointer-events-none"
                  style={{ border: '2px solid #E50914', boxShadow: '0 0 16px rgba(229,9,20,0.4)', transition: 'opacity 0.15s', zIndex: 10 }} />
              </button>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-10 text-xs text-zinc-500">
              No movies found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
