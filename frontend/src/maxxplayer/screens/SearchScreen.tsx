import { Search, X, Star, TrendingUp, Clock } from 'lucide-react';
import { useMaxxData } from '../data/useMaxxData';
import BottomNav from '../components/BottomNav';
import type { Screen } from '../types';

interface Props { onNavigate: (s: Screen) => void; }
const filters = ['All', 'Channels', 'Movies', 'Series'];
const trending = ['Dune 2', 'Champions League', 'Succession', 'The Last of Us', 'Shogun'];
const recent = ['ESPN HD', 'Top Gun', 'Wednesday'];

export default function SearchScreen({ onNavigate }: Props) {
  const { channels, movies, seriesData, playlists, epgData, epgCategories } = useMaxxData();

  const hasQuery = true;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#080c14' }}>
      {/* Header */}
      <div className="flex-shrink-0 pt-14 px-5 pb-3" style={{ background: 'linear-gradient(180deg, #0d1420 0%, #080c14 100%)' }}>
        <h1 className="text-xl font-black mb-4" style={{ color: '#f8fafc' }}>Search</h1>

        {/* Search bar */}
        <div
          className="flex items-center gap-3 px-4 rounded-2xl mb-4"
          style={{ background: '#12161e', border: '1.5px solid rgba(14,165,233,0.45)', height: 52 }}
        >
          <Search size={18} style={{ color: '#0ea5e9', flexShrink: 0 }} />
          <span className="flex-1 text-sm" style={{ color: '#94a3b8' }}>action</span>
          <button className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 22, height: 22, background: '#1e2838' }}>
            <X size={12} style={{ color: '#64748b' }} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {filters.map((f, i) => (
            <button key={f} className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold"
              style={{
                background: i === 0 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#12161e',
                color: i === 0 ? '#fff' : '#64748b',
                border: i === 0 ? 'none' : '1px solid #1e2838',
                boxShadow: i === 0 ? '0 4px 12px rgba(14,165,233,0.3)' : 'none',
              }}
            >{f}</button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-20 px-5" style={{ scrollbarWidth: 'none' }}>
        {!hasQuery ? (
          /* Empty / discovery state */
          <>
            <div className="mt-4 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={15} style={{ color: '#0ea5e9' }} />
                <h3 className="text-sm font-bold" style={{ color: '#f1f5f9' }}>Trending</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trending.map((t) => (
                  <button key={t} className="px-3 py-2 rounded-full text-xs font-semibold"
                    style={{ background: '#12161e', color: '#94a3b8', border: '1px solid #1e2838' }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Clock size={15} style={{ color: '#64748b' }} />
                <h3 className="text-sm font-bold" style={{ color: '#f1f5f9' }}>Recent</h3>
              </div>
              <div className="flex flex-col gap-2">
                {recent.map((r) => (
                  <div key={r} className="flex items-center justify-between px-4 py-3 rounded-xl"
                    style={{ background: '#12161e', border: '1px solid #1e2838' }}>
                    <span className="text-sm" style={{ color: '#94a3b8' }}>{r}</span>
                    <X size={14} style={{ color: '#334155' }} />
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Results count */}
            <div className="flex items-center justify-between mt-3 mb-4">
              <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>7 results for "<span style={{ color: '#f1f5f9' }}>action</span>"</span>
            </div>

            {/* Channels */}
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#475569' }}>Channels</p>
              <div className="flex flex-col gap-2">
                {channels.slice(0, 2).map((ch) => (
                  <button key={ch.id} onClick={() => onNavigate('player')}
                    className="flex items-center gap-3 p-3 rounded-xl w-full text-left"
                    style={{ background: '#12161e', border: '1px solid #1e2838' }}>
                    <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 44, height: 44 }}>
                      <img src={ch.logo} alt={ch.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{ch.name}</p>
                      <p className="text-xs truncate" style={{ color: '#64748b' }}>{ch.currentProgram}</p>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 5px rgba(239,68,68,0.7)' }} />
                      <span className="text-xs font-bold" style={{ color: '#ef4444' }}>LIVE</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Movies */}
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#475569' }}>Movies</p>
              <div className="flex flex-col gap-2">
                {movies.slice(0, 3).map((m) => (
                  <button key={m.id} onClick={() => onNavigate('movie-detail')}
                    className="flex items-center gap-3 p-3 rounded-xl w-full text-left"
                    style={{ background: '#12161e', border: '1px solid #1e2838' }}>
                    <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 44, height: 66 }}>
                      <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{m.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{m.genre} · {m.year} · {m.duration}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                        <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>{m.rating}</span>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-lg font-semibold flex-shrink-0"
                      style={{ background: 'rgba(14,165,233,0.08)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.15)' }}>
                      4K
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Series */}
            <div className="mb-5">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: '#475569' }}>Series</p>
              <div className="flex flex-col gap-2">
                {seriesData.slice(0, 2).map((s) => (
                  <button key={s.id} onClick={() => onNavigate('series-detail')}
                    className="flex items-center gap-3 p-3 rounded-xl w-full text-left"
                    style={{ background: '#12161e', border: '1px solid #1e2838' }}>
                    <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 44, height: 66 }}>
                      <img src={s.poster} alt={s.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{s.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{s.genre} · {s.seasons} Seasons · {s.year}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                        <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>{s.rating}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}
