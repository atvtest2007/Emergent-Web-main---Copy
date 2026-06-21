import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Star, ChevronRight, Play, Tv, Film, Monitor, Radio, Calendar, Zap, Loader2 } from 'lucide-react';
import BottomNav from '../components/BottomNav';
import { Content, Progress, Playlists, Account } from '@/lib/api';

const quickLinks = [
  { label: 'Live TV', icon: Tv, path: '/live', color: 'var(--brand-primary)', bg: 'rgba(229,9,20,0.12)' },
  { label: 'Movies', icon: Film, path: '/movies', color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  { label: 'Series', icon: Monitor, path: '/series', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { label: 'EPG', icon: Calendar, path: '/epg', color: '#e879f9', bg: 'rgba(232,121,249,0.12)' },
  { label: 'Catch Up', icon: Radio, path: '/catchup', color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  { label: 'Search', icon: Search, path: '/search', color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
];

function Section({ title, onMore, children }: { title: string; onMore: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-base font-bold" style={{ color: '#f1f5f9' }}>{title}</h2>
        <button onClick={onMore} className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--brand-primary)' }}>
          See all <ChevronRight size={14} />
        </button>
      </div>
      {children}
    </div>
  );
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<any>(null);
  const [live, setLive] = useState<any[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [series, setSeries] = useState<any[]>([]);
  const [cont, setCont] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const pl = await Playlists.active();
        if (!pl) { navigate("/login"); return; }
        const [acc, l, v, s, c] = await Promise.all([
          Account.info().catch(() => null),
          Content.streams("live").catch(() => []),
          Content.streams("vod").catch(() => []),
          Content.streams("series").catch(() => []),
          Progress.continueWatching().catch(() => []),
        ]);
        setAccount(acc);
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
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  const liveNow = live.slice(0, 3);
  const featured = movies.length > 0 ? movies[Math.floor(Math.random() * Math.min(10, movies.length))] : null;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#030608' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 pt-14 px-5 pb-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, #141414 0%, #030608 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{ width: 40, height: 40, background: 'linear-gradient(135deg, var(--brand-primary), #B80710)', boxShadow: '0 0 16px rgba(229,9,20,0.4)' }}
          >
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <path d="M12 8L38 24L12 40V8Z" fill="white" />
              <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.7)" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium leading-none" style={{ color: '#475569' }}>Welcome back</p>
            <h1 className="text-lg font-black leading-tight" style={{ color: '#f8fafc' }}>
              Maxx<span style={{ color: 'var(--brand-primary)' }}>Player</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/search')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: '#1A1A1A', border: '1px solid #2A2A2A' }}
          >
            <Search size={17} style={{ color: '#94a3b8' }} />
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="flex items-center justify-center rounded-xl relative"
            style={{ width: 40, height: 40, background: '#1A1A1A', border: '1px solid #2A2A2A' }}
          >
            <Bell size={17} style={{ color: '#94a3b8' }} />
            {account && <div className="absolute top-2 right-2 rounded-full" style={{ width: 7, height: 7, background: '#ef4444', border: '1.5px solid #030608' }} />}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: 'none' }}>
        {/* Hero Feature Banner */}
        {featured && (
          <div className="mx-5 mb-5">
            <div className="relative rounded-3xl overflow-hidden" style={{ height: 200 }}>
              <img
                src={featured.stream_icon || featured.cover || "https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=700&h=400&dpr=1"}
                alt={featured.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=700&h=400&dpr=1" }}
              />
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(105deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)' }} />
              <div className="absolute inset-0 flex flex-col justify-between p-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-full font-bold tracking-wide" style={{ background: 'linear-gradient(135deg, var(--brand-primary), #B80710)', color: '#fff', fontSize: 10 }}>
                    FEATURED
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-white leading-tight mb-2 line-clamp-1">{featured.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate(`/watch/movie/${featured.stream_id}`)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                      style={{ background: 'linear-gradient(135deg, var(--brand-primary), #B80710)', color: '#fff', boxShadow: '0 4px 16px rgba(229,9,20,0.4)' }}
                    >
                      <Play size={13} fill="white" /> Play Now
                    </button>
                    <button
                      onClick={() => navigate(`/movie/${featured.stream_id}`)}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
                      style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
                    >
                      More Info
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Access Grid */}
        <div className="px-5 mb-6">
          <h2 className="text-base font-bold mb-3" style={{ color: '#f1f5f9' }}>Quick Access</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {quickLinks.map(({ label, icon: Icon, path, color, bg }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl"
                style={{ background: bg, border: `1px solid ${color}22` }}
              >
                <div className="flex items-center justify-center rounded-xl" style={{ width: 40, height: 40, background: `${color}20` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="text-xs font-semibold" style={{ color: '#94a3b8' }}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Live Now */}
        {liveNow.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between px-5 mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.8)' }} />
                <h2 className="text-base font-bold" style={{ color: '#f1f5f9' }}>Live Now</h2>
              </div>
              <button onClick={() => navigate('/live')} className="flex items-center gap-1 text-xs font-semibold" style={{ color: 'var(--brand-primary)' }}>
                All channels <ChevronRight size={14} />
              </button>
            </div>
            <div className="px-5 flex flex-col gap-2">
              {liveNow.map((ch) => (
                <button
                  key={ch.stream_id}
                  onClick={() => navigate(`/watch/live/${ch.stream_id}`)}
                  className="flex items-center gap-3 p-3 rounded-2xl w-full text-left"
                  style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
                >
                  <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 48, height: 48, border: '1px solid #2A2A2A' }}>
                    <img src={ch.stream_icon} alt={ch.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: '#f1f5f9' }}>{ch.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <div className="flex items-center justify-center rounded-lg" style={{ width: 34, height: 34, background: 'linear-gradient(135deg, var(--brand-primary), #B80710)' }}>
                      <Play size={13} fill="white" style={{ color: 'white' }} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Continue Watching */}
        {cont.length > 0 && (
          <Section title="Continue Watching" onMore={() => navigate('/movies')}>
            <div className="flex gap-3 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {cont.slice(0, 4).map((c, i) => {
                const m = c.content_data || { name: c.content_id };
                const isSeries = c.content_type === 'series' || c.content_type === 'episode';
                return (
                  <button
                    key={c.content_id}
                    onClick={() => navigate(`/watch/${isSeries ? 'series' : 'movie'}/${c.content_id}`)}
                    className="flex-shrink-0 rounded-2xl overflow-hidden relative"
                    style={{ width: 160, height: 95, border: '1px solid #2A2A2A' }}
                  >
                    <img src={m.stream_icon || m.cover || "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop"} alt={m.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                    <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
                      <p className="text-xs font-semibold text-white truncate mb-1">{m.name}</p>
                      <div className="h-1 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min(100, (c.progress || 0) * 100)}%`, background: 'var(--brand-primary)' }} />
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 flex items-center justify-center rounded-full" style={{ width: 26, height: 26, background: 'rgba(229,9,20,0.9)' }}>
                      <Play size={11} fill="white" style={{ color: 'white', marginLeft: 1 }} />
                    </div>
                  </button>
                );
              })}
            </div>
          </Section>
        )}

        {/* Latest Movies */}
        {movies.length > 0 && (
          <Section title="New Movies" onMore={() => navigate('/movies')}>
            <div className="flex gap-3 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {movies.slice(0, 10).map((m) => (
                <button
                  key={m.stream_id}
                  onClick={() => navigate(`/movie/${m.stream_id}`)}
                  className="flex-shrink-0 rounded-2xl overflow-hidden relative"
                  style={{ width: 110, height: 165, border: '1px solid #2A2A2A', flexShrink: 0 }}
                >
                  <img src={m.stream_icon} alt={m.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop"; }} />
                  <div className="absolute inset-x-0 bottom-0 p-2 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                    <p className="text-xs font-semibold text-white leading-tight truncate">{m.name}</p>
                    {m.rating && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <Star size={9} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                        <span className="text-xs" style={{ color: '#fbbf24' }}>{m.rating}</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </Section>
        )}

        {/* Latest Series */}
        {series.length > 0 && (
          <Section title="Trending Series" onMore={() => navigate('/series')}>
            <div className="flex gap-3 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {series.slice(0, 10).map((s) => (
                <button
                  key={s.series_id}
                  onClick={() => navigate(`/series/${s.series_id}`)}
                  className="flex-shrink-0 rounded-2xl overflow-hidden relative"
                  style={{ width: 110, height: 165, border: '1px solid #2A2A2A', flexShrink: 0 }}
                >
                  <img src={s.cover} alt={s.name} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop"; }} />
                  <div className="absolute inset-x-0 bottom-0 p-2 pointer-events-none" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                    <p className="text-xs font-semibold text-white leading-tight truncate">{s.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </Section>
        )}
      </div>

      <BottomNav active="home" />
    </div>
  );
}
