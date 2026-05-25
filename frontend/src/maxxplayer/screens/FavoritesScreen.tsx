import { Heart, Tv, Film, Monitor } from 'lucide-react';
import { useMaxxData } from '../data/useMaxxData';
import BottomNav from '../components/BottomNav';
import type { Screen } from '../types';

interface Props { onNavigate: (s: Screen) => void; }
const tabs = [
  { id: 'channels', label: 'Channels', icon: Tv },
  { id: 'movies', label: 'Movies', icon: Film },
  { id: 'series', label: 'Series', icon: Monitor },
];

export default function FavoritesScreen({ onNavigate }: Props) {
  const { channels, movies, seriesData, playlists, epgData, epgCategories } = useMaxxData();

  const favChannels = channels.filter((c) => c.isFavorite);
  const favMovies = movies.filter((m) => m.isFavorite);
  const favSeries = seriesData.filter((s) => s.isFavorite);
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="flex-shrink-0 pt-14 px-5 pb-3" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a0a0f 100%)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center rounded-xl" style={{ width: 36, height: 36, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <Heart size={18} fill="#ef4444" style={{ color: '#ef4444' }} />
          </div>
          <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Favorites</h1>
        </div>
        <div className="flex rounded-2xl p-1" style={{ background: '#12161e' }}>
          {tabs.map((t, i) => (
            <button key={t.id} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold"
              style={{ background: i === 0 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'transparent', color: i === 0 ? '#fff' : '#64748b' }}>
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-20 px-5">
        <div className="mt-4 mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#475569' }}>Favorite Channels ({favChannels.length})</p>
          <div className="flex flex-col gap-2">
            {favChannels.map((ch) => (
              <button key={ch.id} onClick={() => onNavigate('player')} className="flex items-center gap-3 p-3 rounded-xl w-full text-left" style={{ background: '#12161e', border: '1px solid #1e2838' }}>
                <div className="rounded-xl overflow-hidden flex-shrink-0" style={{ width: 48, height: 48 }}>
                  <img src={ch.logo} alt={ch.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{ch.name}</p>
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#64748b' }}><span style={{ color: '#22c55e' }}>● </span>{ch.currentProgram}</p>
                </div>
                <Heart size={14} fill="#ef4444" style={{ color: '#ef4444', flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#475569' }}>Favorite Movies ({favMovies.length})</p>
          <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {favMovies.map((m) => (
              <button key={m.id} onClick={() => onNavigate('movie-detail')} className="flex-shrink-0 rounded-xl overflow-hidden relative" style={{ width: 100, height: 150, border: '1px solid #1e2838' }}>
                <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                  <p style={{ color: '#fff', fontSize: 10, fontWeight: 600 }} className="truncate">{m.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: '#475569' }}>Favorite Series ({favSeries.length})</p>
          <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {favSeries.map((s) => (
              <button key={s.id} onClick={() => onNavigate('series-detail')} className="flex-shrink-0 rounded-xl overflow-hidden relative" style={{ width: 100, height: 150, border: '1px solid #1e2838' }}>
                <img src={s.poster} alt={s.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                  <p style={{ color: '#fff', fontSize: 10, fontWeight: 600 }} className="truncate">{s.title}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      <BottomNav active="home" onNavigate={onNavigate} />
    </div>
  );
}
