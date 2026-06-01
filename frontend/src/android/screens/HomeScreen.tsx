import { Bell, Search, Star, ChevronRight, Play, Tv, Film, Monitor, Radio, Calendar, Zap } from 'lucide-react';
import { channels, movies, seriesData } from '../data/mockData';
import BottomNav from '../components/BottomNav';
import type { Screen } from '@/types';

interface Props { onNavigate: (s: Screen) => void; }

const quickLinks = [
  { label: 'Live TV', icon: Tv, screen: 'live-tv' as Screen, color: '#0ea5e9', bg: 'rgba(14,165,233,0.12)' },
  { label: 'Movies', icon: Film, screen: 'movies' as Screen, color: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  { label: 'Series', icon: Monitor, screen: 'series' as Screen, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  { label: 'EPG', icon: Calendar, screen: 'epg' as Screen, color: '#e879f9', bg: 'rgba(232,121,249,0.12)' },
  { label: 'Catch Up', icon: Radio, screen: 'catchup' as Screen, color: '#fb923c', bg: 'rgba(251,146,60,0.12)' },
  { label: 'Search', icon: Search, screen: 'search' as Screen, color: '#38bdf8', bg: 'rgba(56,189,248,0.12)' },
];

function Section({ title, onMore, children }: { title: string; onMore: () => void; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between px-5 mb-3">
        <h2 className="text-base font-bold" style={{ color: '#f1f5f9' }}>{title}</h2>
        <button onClick={onMore} className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#0ea5e9' }}>
          See all <ChevronRight size={14} />
        </button>
      </div>
      {children}
    </div>
  );
}

export default function HomeScreen({ onNavigate }: Props) {
  const liveNow = channels.slice(0, 3);

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#080c14' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 pt-14 px-5 pb-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, #0d1420 0%, #080c14 100%)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-2xl flex-shrink-0"
            style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 16px rgba(14,165,233,0.4)' }}
          >
            <svg width="22" height="22" viewBox="0 0 48 48" fill="none">
              <path d="M12 8L38 24L12 40V8Z" fill="white" />
              <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.7)" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-medium leading-none" style={{ color: '#475569' }}>Welcome back</p>
            <h1 className="text-lg font-black leading-tight" style={{ color: '#f8fafc' }}>
              Maxx<span style={{ color: '#0ea5e9' }}>Player</span>
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('search')}
            className="flex items-center justify-center rounded-xl"
            style={{ width: 40, height: 40, background: '#12161e', border: '1px solid #1e2838' }}
          >
            <Search size={17} style={{ color: '#94a3b8' }} />
          </button>
          <button
            className="flex items-center justify-center rounded-xl relative"
            style={{ width: 40, height: 40, background: '#12161e', border: '1px solid #1e2838' }}
          >
            <Bell size={17} style={{ color: '#94a3b8' }} />
            <div className="absolute top-2 right-2 rounded-full" style={{ width: 7, height: 7, background: '#ef4444', border: '1.5px solid #080c14' }} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: 'none' }}>
        {/* Hero Feature Banner */}
        <div className="mx-5 mb-5">
          <div className="relative rounded-3xl overflow-hidden" style={{ height: 200 }}>
            <img
              src="https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=700&h=400&dpr=1"
              alt="Featured"
              className="w-full h-full object-cover"
            />
            {/* Cinematic gradient */}
            <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.1) 100%)' }} />
            {/* Content */}
            <div className="absolute inset-0 flex flex-col justify-between p-4">
              <div className="flex items-center gap-2">
                <span className="text-xs px-2.5 py-1 rounded-full font-bold tracking-wide" style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 10 }}>
                  FEATURED
                </span>
                <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{ background: 'rgba(0,0,0,0.5)', color: '#fff', backdropFilter: 'blur(8px)' }}>
                  4K HDR
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4].map(i => <Star key={i} size={10} fill="#f59e0b" style={{ color: '#f59e0b' }} />)}
                    <Star size={10} fill="rgba(245,158,11,0.3)" style={{ color: '#f59e0b' }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>8.5</span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>· 2024 · Sci-Fi</span>
                </div>
                <h3 className="text-xl font-black text-white leading-tight mb-2">Dune: Part Two</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('player')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm"
                    style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', boxShadow: '0 4px 16px rgba(14,165,233,0.4)' }}
                  >
                    <Play size={13} fill="white" /> Play Now
                  </button>
                  <button
                    onClick={() => onNavigate('movie-detail')}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm"
                    style={{ background: 'rgba(255,255,255,0.12)', color: '#fff', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.15)' }}
                  >
                    More Info
                  </button>
                </div>
              </div>
            </div>
            {/* Dots indicator */}
            <div className="absolute bottom-4 right-4 flex gap-1">
              {[0,1,2].map(i => (
                <div key={i} className="rounded-full" style={{ width: i === 0 ? 16 : 5, height: 5, background: i === 0 ? '#0ea5e9' : 'rgba(255,255,255,0.3)' }} />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="px-5 mb-6">
          <h2 className="text-base font-bold mb-3" style={{ color: '#f1f5f9' }}>Quick Access</h2>
          <div className="grid grid-cols-3 gap-2.5">
            {quickLinks.map(({ label, icon: Icon, screen, color, bg }) => (
              <button
                key={label}
                onClick={() => onNavigate(screen)}
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
        <div className="mb-6">
          <div className="flex items-center justify-between px-5 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 8px rgba(239,68,68,0.8)' }} />
              <h2 className="text-base font-bold" style={{ color: '#f1f5f9' }}>Live Now</h2>
            </div>
            <button onClick={() => onNavigate('live-tv')} className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#0ea5e9' }}>
              All channels <ChevronRight size={14} />
            </button>
          </div>
          <div className="px-5 flex flex-col gap-2">
            {liveNow.map((ch) => (
              <button
                key={ch.id}
                onClick={() => onNavigate('player')}
                className="flex items-center gap-3 p-3 rounded-2xl w-full text-left"
                style={{ background: '#12161e', border: '1px solid #1e2838' }}
              >
                <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 48, height: 48, border: '1px solid #1e2838' }}>
                  <img src={ch.logo} alt={ch.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#f1f5f9' }}>{ch.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />
                    <p className="text-xs truncate" style={{ color: '#94a3b8' }}>{ch.currentProgram}</p>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <div className="flex items-center justify-center rounded-lg" style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                    <Play size={13} fill="white" style={{ color: 'white' }} />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Continue Watching */}
        <Section title="Continue Watching" onMore={() => onNavigate('movies')}>
          <div className="flex gap-3 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {movies.slice(0, 4).map((m, i) => (
              <button
                key={m.id}
                onClick={() => onNavigate('player')}
                className="flex-shrink-0 rounded-2xl overflow-hidden relative"
                style={{ width: 160, height: 95, border: '1px solid #1e2838' }}
              >
                <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 60%)' }} />
                {/* Progress */}
                <div className="absolute bottom-0 left-0 right-0 px-2 pb-2">
                  <p className="text-xs font-semibold text-white truncate mb-1">{m.title}</p>
                  <div className="h-1 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${20 + i * 18}%`, background: '#0ea5e9' }} />
                  </div>
                </div>
                <div className="absolute top-2 right-2 flex items-center justify-center rounded-full" style={{ width: 26, height: 26, background: 'rgba(14,165,233,0.9)' }}>
                  <Play size={11} fill="white" style={{ color: 'white', marginLeft: 1 }} />
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Latest Movies */}
        <Section title="New Movies" onMore={() => onNavigate('movies')}>
          <div className="flex gap-3 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {movies.map((m) => (
              <button
                key={m.id}
                onClick={() => onNavigate('movie-detail')}
                className="flex-shrink-0 rounded-2xl overflow-hidden relative"
                style={{ width: 110, height: 165, border: '1px solid #1e2838', flexShrink: 0 }}
              >
                <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                  <p className="text-xs font-semibold text-white leading-tight truncate">{m.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Star size={9} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                    <span className="text-xs" style={{ color: '#fbbf24' }}>{m.rating}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Section>

        {/* Latest Series */}
        <Section title="Trending Series" onMore={() => onNavigate('series')}>
          <div className="flex gap-3 px-5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {seriesData.map((s) => (
              <button
                key={s.id}
                onClick={() => onNavigate('series-detail')}
                className="flex-shrink-0 rounded-2xl overflow-hidden relative"
                style={{ width: 110, height: 165, border: '1px solid #1e2838', flexShrink: 0 }}
              >
                <img src={s.poster} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                  <p className="text-xs font-semibold text-white leading-tight truncate">{s.title}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{s.seasons}S · {s.genre}</p>
                </div>
                {s.isFavorite && (
                  <div className="absolute top-1.5 right-1.5 rounded-full flex items-center justify-center" style={{ width: 20, height: 20, background: 'rgba(239,68,68,0.85)' }}>
                    <Zap size={9} fill="white" style={{ color: 'white' }} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </Section>
      </div>

      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}
