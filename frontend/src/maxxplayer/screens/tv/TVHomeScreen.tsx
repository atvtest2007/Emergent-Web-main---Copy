import { Play, Star, ChevronRight, Info, Zap } from 'lucide-react';
import { useMaxxData } from '../../data/useMaxxData';
import TVSideNav from './TVSideNav';
import type { Screen } from '../../types';

interface Props { onNavigate: (s: Screen) => void; }

export default function TVHomeScreen({ onNavigate }: Props) {
  const { channels, movies, seriesData, playlists, epgData, epgCategories } = useMaxxData();

  return (
    <div className="absolute inset-0 flex" style={{ background: '#080c14', fontFamily: 'system-ui, sans-serif' }}>
      <TVSideNav active="home" onNavigate={onNavigate} />

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Hero banner - takes top half */}
        <div className="relative flex-shrink-0" style={{ height: 280 }}>
          <img
            src="https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=1200&h=600&dpr=1"
            alt="Featured"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to right, rgba(8,12,20,0.97) 0%, rgba(8,12,20,0.7) 45%, rgba(8,12,20,0.1) 100%)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #080c14 0%, transparent 40%)' }} />

          {/* Hero content */}
          <div className="absolute inset-0 flex flex-col justify-center pl-8 pr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-black tracking-widest"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', fontSize: 9, letterSpacing: '0.1em' }}>
                FEATURED
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', backdropFilter: 'blur(8px)', fontSize: 10 }}>
                4K HDR
              </span>
              <span className="text-xs px-2.5 py-1 rounded-full font-bold"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', backdropFilter: 'blur(8px)', fontSize: 10 }}>
                Dolby Atmos
              </span>
            </div>

            <h1 className="text-4xl font-black text-white mb-1" style={{ letterSpacing: '-0.5px', lineHeight: 1.1 }}>
              Dune: Part Two
            </h1>
            <p className="text-sm mb-2" style={{ color: 'rgba(255,255,255,0.55)' }}>2024 · Sci-Fi · 2h 46m</p>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-1">
                {[1,2,3,4].map(i => <Star key={i} size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />)}
                <Star size={11} fill="rgba(245,158,11,0.3)" style={{ color: '#f59e0b' }} />
              </div>
              <span className="text-sm font-bold" style={{ color: '#fbbf24' }}>8.5</span>
              <span style={{ color: 'rgba(255,255,255,0.2)' }}>|</span>
              <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Sci-Fi · Adventure · Epic</span>
            </div>

            <p className="text-xs leading-relaxed mb-4 max-w-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
              Paul Atreides unites with the Fremen while seeking revenge against the conspirators who destroyed his family.
            </p>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate('player')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', boxShadow: '0 4px 20px rgba(14,165,233,0.45)' }}
              >
                <Play size={15} fill="white" /> Play Now
              </button>
              <button
                onClick={() => onNavigate('movie-detail')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm"
                style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}
              >
                <Info size={14} /> More Info
              </button>
            </div>
          </div>

          {/* Banner carousel dots */}
          <div className="absolute bottom-4 right-6 flex gap-1.5">
            {[0,1,2,3].map(i => (
              <div key={i} className="rounded-full" style={{ width: i === 0 ? 20 : 5, height: 5, background: i === 0 ? '#0ea5e9' : 'rgba(255,255,255,0.2)' }} />
            ))}
          </div>
        </div>

        {/* Content shelves */}
        <div className="flex-1 overflow-y-auto px-6 pb-4" style={{ scrollbarWidth: 'none' }}>
          {/* Continue Watching */}
          <ShelfRow title="Continue Watching" badge="RESUME">
            {movies.slice(0, 5).map((m, i) => (
              <button key={m.id} onClick={() => onNavigate('player')}
                className="flex-shrink-0 rounded-xl overflow-hidden relative group"
                style={{ width: 140, height: 84, border: '2px solid transparent' }}
              >
                <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, transparent 60%)' }} />
                <div className="absolute bottom-0 left-0 right-0 px-2 pb-1.5">
                  <p className="text-xs font-semibold text-white truncate" style={{ fontSize: 10 }}>{m.title}</p>
                  <div className="h-0.5 rounded-full mt-1 w-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <div className="h-full rounded-full" style={{ width: `${15 + i * 16}%`, background: '#0ea5e9' }} />
                  </div>
                </div>
                <FocusBorder />
              </button>
            ))}
          </ShelfRow>

          {/* New Movies */}
          <ShelfRow title="New Movies" badge="NEW">
            {movies.map((m) => (
              <button key={m.id} onClick={() => onNavigate('movie-detail')}
                className="flex-shrink-0 rounded-xl overflow-hidden relative"
                style={{ width: 100, height: 150, border: '1px solid #1e2838' }}
              >
                <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-1.5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                  <p className="text-white font-semibold truncate" style={{ fontSize: 9 }}>{m.title}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Star size={8} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                    <span style={{ color: '#fbbf24', fontSize: 8 }}>{m.rating}</span>
                  </div>
                </div>
                <FocusBorder />
              </button>
            ))}
          </ShelfRow>

          {/* Trending Series */}
          <ShelfRow title="Trending Series">
            {seriesData.map((s) => (
              <button key={s.id} onClick={() => onNavigate('series-detail')}
                className="flex-shrink-0 rounded-xl overflow-hidden relative"
                style={{ width: 100, height: 150, border: '1px solid #1e2838' }}
              >
                <img src={s.poster} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-1.5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                  <p className="text-white font-semibold truncate" style={{ fontSize: 9 }}>{s.title}</p>
                  <p style={{ color: '#94a3b8', fontSize: 8 }}>{s.seasons}S</p>
                </div>
                {s.isFavorite && (
                  <div className="absolute top-1 right-1 rounded-full flex items-center justify-center" style={{ width: 16, height: 16, background: 'rgba(239,68,68,0.9)' }}>
                    <Zap size={7} fill="white" style={{ color: 'white' }} />
                  </div>
                )}
                <FocusBorder />
              </button>
            ))}
          </ShelfRow>

          {/* Live Now */}
          <ShelfRow title="Live Now" badge="LIVE" badgeColor="#ef4444">
            {channels.slice(0, 6).map((ch) => (
              <button key={ch.id} onClick={() => onNavigate('player')}
                className="flex-shrink-0 rounded-xl overflow-hidden relative"
                style={{ width: 140, height: 80, background: '#12161e', border: '1px solid #1e2838' }}
              >
                <img src={ch.logo} alt={ch.name} className="w-full h-full object-cover opacity-30" />
                <div className="absolute inset-0 flex flex-col justify-center px-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 5px rgba(239,68,68,0.8)' }} />
                    <span className="text-xs font-black" style={{ color: '#ef4444', fontSize: 9, letterSpacing: '0.08em' }}>LIVE</span>
                  </div>
                  <p className="text-sm font-bold text-white truncate" style={{ fontSize: 11 }}>{ch.name}</p>
                  <p className="truncate" style={{ color: '#64748b', fontSize: 9 }}>{ch.currentProgram}</p>
                </div>
                <FocusBorder />
              </button>
            ))}
          </ShelfRow>
        </div>
      </div>
    </div>
  );
}

function ShelfRow({ title, badge, badgeColor = '#0ea5e9', children }: {
  title: string; badge?: string; badgeColor?: string; children: React.ReactNode;
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
        <button className="flex items-center gap-1 text-xs font-semibold" style={{ color: '#475569', fontSize: 10 }}>
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
      className="absolute inset-0 rounded-xl pointer-events-none opacity-0 hover:opacity-100"
      style={{ border: '2px solid #0ea5e9', boxShadow: '0 0 16px rgba(14,165,233,0.4)', transition: 'opacity 0.15s' }}
    />
  );
}
