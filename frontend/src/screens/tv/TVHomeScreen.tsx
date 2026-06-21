import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, ChevronRight, Info, Zap, Loader2 } from 'lucide-react';
import TVSideNav from './TVSideNav';
import { Content, Progress, Playlists, Account } from '@/lib/api';

export default function TVHomeScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [live, setLive] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [cont, setCont] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const pl = await Playlists.active();
        if (!pl) { navigate("/login"); return; }
        const [l, v, s, c] = await Promise.all([
          Content.streams("live").catch(() => []),
          Content.streams("vod").catch(() => []),
          Content.streams("series").catch(() => []),
          Progress.continueWatching().catch(() => []),
        ]);
        setLive(l || []);
        setMovies(v || []);
        setSeries(s || []);
        setCont(c || []);
      } finally {
        setLoading(false);
      }
    })();
  }, [navigate]);

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#030608' }}>
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
      </div>
    );
  }

  const liveNow = live.slice(0, 6);
  const featured = movies.length > 0 ? movies[Math.floor(Math.random() * Math.min(10, movies.length))] : null;

  return (
    <div className="absolute inset-0 flex" style={{ background: '#030608', fontFamily: 'system-ui, sans-serif' }}>
      <TVSideNav active="home" />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hero banner - takes top half */}
        {featured && (
          <div className="relative flex-shrink-0" style={{ height: 280 }}>
            <img
              src={featured.stream_icon || featured.cover || "https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&dpr=1"}
              alt={featured.name}
              className="w-full h-full object-cover"
              onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&dpr=1" }}
            />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,12,20,0.97) 0%, rgba(8,12,20,0.7) 45%, rgba(8,12,20,0.1) 100%)' }} />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #030608 0%, transparent 40%)' }} />

            {/* Hero content */}
            <div className="absolute inset-0 flex flex-col justify-center pl-8 pr-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-black tracking-widest"
                  style={{ background: 'linear-gradient(135deg, var(--brand-primary), #B80710)', color: '#fff', fontSize: 9, letterSpacing: '0.1em' }}>
                  FEATURED
                </span>
                {featured.rating && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                    style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', backdropFilter: 'blur(8px)', fontSize: 10 }}>
                    <Star size={10} fill="#f59e0b" style={{ display: 'inline', color: '#f59e0b', marginRight: 4 }} />
                    {featured.rating}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-black text-white mb-1 line-clamp-1" style={{ letterSpacing: '-0.5px', lineHeight: 1.1 }}>
                {featured.name}
              </h1>

              <div className="flex items-center gap-3 mt-4">
                <button tabIndex={0} onClick={() => navigate(`/watch/movie/${featured.stream_id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm"
                  style={{ background: 'linear-gradient(135deg, var(--brand-primary), #B80710)', color: '#fff', boxShadow: '0 4px 20px rgba(229,9,20,0.45)' }}
                >
                  <Play size={15} fill="white" /> Play Now
                </button>
                <button tabIndex={0} onClick={() => navigate(`/watch/movie/${featured.stream_id}`)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
                >
                  <Info size={14} /> More Info
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content shelves */}
        <div className="flex-1 overflow-y-auto px-6 pb-4 pt-4" style={{ scrollbarWidth: 'none' }}>
          {/* Continue Watching */}
          {cont.length > 0 && (
            <ShelfRow title="Continue Watching" badge="RESUME" onSeeAll={() => navigate('/movies')}>
              {cont.slice(0, 5).map((c, i) => {
                const m = c.content_data || { name: c.content_id };
                const isSeries = c.content_type === 'series' || c.content_type === 'episode';
                return (
                  <button tabIndex={0} key={c.content_id} onClick={() => navigate(`/watch/${isSeries ? 'series' : 'movie'}/${c.content_id}`)}
                    className="flex-shrink-0 rounded-xl overflow-hidden relative group"
                    style={{ width: 140, height: 84, border: '2px solid transparent' }}
                  >
                    <img src={m.stream_icon || m.cover || "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop"} alt={m.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 px-2 pb-1.5">
                      <p className="text-xs font-semibold text-white truncate" style={{ fontSize: 10 }}>{m.name}</p>
                      <div className="h-0.5 rounded-full mt-1 w-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (c.progress || 0) * 100)}%`, background: 'var(--brand-primary)' }} />
                      </div>
                    </div>
                    <FocusBorder />
                  </button>
                );
              })}
            </ShelfRow>
          )}

          {/* New Movies */}
          {movies.length > 0 && (
            <ShelfRow title="New Movies" badge="NEW" onSeeAll={() => navigate('/movies')}>
              {movies.slice(0, 10).map((m) => (
                <button tabIndex={0} key={m.stream_id} onClick={() => navigate(`/watch/movie/${m.stream_id}`)}
                  className="flex-shrink-0 rounded-xl overflow-hidden relative group"
                  style={{ width: 100, height: 150, border: '1px solid #2A2A2A' }}
                >
                  <img src={m.stream_icon} alt={m.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop"; }} />
                  <div className="absolute inset-x-0 bottom-0 p-1.5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                    <p className="text-white font-semibold truncate" style={{ fontSize: 9 }}>{m.name}</p>
                    {m.rating && (
                      <div className="flex items-center gap-0.5 mt-0.5">
                        <Star size={8} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                        <span style={{ color: '#fbbf24', fontSize: 8 }}>{m.rating}</span>
                      </div>
                    )}
                  </div>
                  <FocusBorder />
                </button>
              ))}
            </ShelfRow>
          )}

          {/* Trending Series */}
          {series.length > 0 && (
            <ShelfRow title="Trending Series" onSeeAll={() => navigate('/series')}>
              {series.slice(0, 10).map((s) => (
                <button tabIndex={0} key={s.series_id} onClick={() => navigate(`/series/${s.series_id}`)}
                  className="flex-shrink-0 rounded-xl overflow-hidden relative group"
                  style={{ width: 100, height: 150, border: '1px solid #2A2A2A' }}
                >
                  <img src={s.cover} alt={s.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop"; }} />
                  <div className="absolute inset-x-0 bottom-0 p-1.5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                    <p className="text-white font-semibold truncate" style={{ fontSize: 9 }}>{s.name}</p>
                  </div>
                  <FocusBorder />
                </button>
              ))}
            </ShelfRow>
          )}

          {/* Live Now */}
          {liveNow.length > 0 && (
            <ShelfRow title="Live Now" badge="LIVE" badgeColor="#ef4444" onSeeAll={() => navigate('/live')}>
              {liveNow.map((ch) => (
                <button tabIndex={0} key={ch.stream_id} onClick={() => navigate(`/watch/live/${ch.stream_id}`)}
                  className="flex-shrink-0 rounded-xl overflow-hidden relative group"
                  style={{ width: 140, height: 80, background: '#1A1A1A', border: '1px solid #2A2A2A' }}
                >
                  <img src={ch.stream_icon} alt={ch.name} className="w-full h-full object-cover opacity-30" />
                  <div className="absolute inset-0 flex flex-col justify-center px-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 5px rgba(239,68,68,0.8)' }} />
                      <span className="text-xs font-black" style={{ color: '#ef4444', fontSize: 9, letterSpacing: '0.08em' }}>LIVE</span>
                    </div>
                    <p className="text-sm font-bold text-white truncate" style={{ fontSize: 11 }}>{ch.name}</p>
                  </div>
                  <FocusBorder />
                </button>
              ))}
            </ShelfRow>
          )}
        </div>
      </div>
    </div>
  );
}

function ShelfRow({ title, badge, badgeColor = 'var(--brand-primary)', onSeeAll, children }: {
  title: string; badge?: string; badgeColor?: string; onSeeAll: () => void; children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-sm font-black" style={{ color: '#f1f5f9' }}>{title}</h2>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full font-black"
            style={{ background: `${badgeColor}20`, color: badgeColor, fontSize: 8, letterSpacing: '0.08em', border: `1px solid ${badgeColor}30` }}>
            {badge}
          </span>
        )}
        <div className="flex-1" />
        <button tabIndex={0} onClick={onSeeAll} className="flex items-center gap-1 text-xs font-semibold group focus:outline-none" style={{ color: '#475569', fontSize: 10 }}>
          See All <ChevronRight size={11} />
        </button>
      </div>
      <div className="flex gap-2.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        {children}
      </div>
    </div>
  );
}

function FocusBorder() {
  return (
    <div
      className="absolute inset-0 rounded-xl pointer-events-none opacity-0 group-hover:opacity-100 group-focus:opacity-100"
      style={{ border: '2px solid var(--brand-primary)', boxShadow: '0 0 16px rgba(229,9,20,0.4)', transition: 'opacity 0.15s', zIndex: 10 }}
    />
  );
}
