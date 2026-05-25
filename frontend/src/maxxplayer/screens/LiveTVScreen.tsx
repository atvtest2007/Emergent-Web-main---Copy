import { Search, Grid3X3, List, Star, Play, Tv } from 'lucide-react';
import { useMaxxData } from '../data/useMaxxData';
import BottomNav from '../components/BottomNav';
import type { Screen } from '../types';

interface Props { onNavigate: (s: Screen) => void; }
const categories = ['All', 'Sports', 'News', 'Entertainment', 'Documentary', 'Kids', 'Movies'];

export default function LiveTVScreen({ onNavigate }: Props) {
  const { channels, movies, seriesData, playlists, epgData, epgCategories } = useMaxxData();

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#080c14' }}>
      {/* Header */}
      <div className="flex-shrink-0 pt-14 px-5 pb-3" style={{ background: 'linear-gradient(180deg, #0d1420 0%, #080c14 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Live TV</h1>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>
              <span style={{ color: '#22c55e' }}>● </span>
              {channels.length} channels live
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center rounded-xl" style={{ width: 38, height: 38, background: '#12161e', border: '1px solid #1e2838' }}>
              <Search size={17} style={{ color: '#94a3b8' }} />
            </button>
            <button className="flex items-center justify-center rounded-xl" style={{ width: 38, height: 38, background: 'rgba(14,165,233,0.1)', border: '1px solid rgba(14,165,233,0.3)' }}>
              <Grid3X3 size={17} style={{ color: '#0ea5e9' }} />
            </button>
          </div>
        </div>
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {categories.map((cat, i) => (
            <button key={cat} className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold"
              style={{
                background: i === 0 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#12161e',
                color: i === 0 ? '#fff' : '#64748b',
                border: i === 0 ? 'none' : '1px solid #1e2838',
                boxShadow: i === 0 ? '0 4px 12px rgba(14,165,233,0.3)' : 'none',
              }}
            >{cat}</button>
          ))}
        </div>
      </div>

      {/* Sort + count row */}
      <div className="flex items-center justify-between px-5 py-2.5">
        <span className="text-xs font-medium" style={{ color: '#475569' }}>{channels.length} channels</span>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: '#64748b' }}>
            <List size={14} /> A–Z
          </button>
        </div>
      </div>

      {/* Channel list */}
      <div className="flex-1 overflow-y-auto pb-20 px-5 flex flex-col gap-2" style={{ scrollbarWidth: 'none' }}>
        {channels.map((ch, idx) => (
          <button
            key={ch.id}
            onClick={() => onNavigate('player')}
            className="w-full text-left rounded-2xl overflow-hidden"
            style={{ background: '#12161e', border: '1px solid #1e2838' }}
          >
            <div className="flex items-center gap-3 p-3">
              {/* Ch number */}
              <div className="flex-shrink-0 flex items-center justify-center rounded-xl font-bold text-xs"
                style={{ width: 28, height: 28, background: '#0d1117', color: '#475569' }}>
                {String(idx + 1).padStart(2, '0')}
              </div>

              {/* Logo */}
              <div className="flex-shrink-0 rounded-xl overflow-hidden" style={{ width: 48, height: 48, border: '1px solid #1e2838' }}>
                <img src={ch.logo} alt={ch.name} className="w-full h-full object-cover" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold truncate" style={{ color: '#f1f5f9' }}>{ch.name}</span>
                  <span className="flex-shrink-0 text-xs px-1.5 py-0.5 rounded-md font-semibold"
                    style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', fontSize: 9, letterSpacing: '0.03em' }}>
                    {ch.category.toUpperCase()}
                  </span>
                </div>
                {/* NOW bar */}
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#22c55e', boxShadow: '0 0 5px rgba(34,197,94,0.7)' }} />
                  <p className="text-xs truncate font-medium" style={{ color: '#94a3b8' }}>{ch.currentProgram}</p>
                </div>
                {/* NEXT bar */}
                <div className="flex items-center gap-1.5 mt-0.5">
                  <Tv size={9} style={{ color: '#334155', flexShrink: 0 }} />
                  <p className="text-xs truncate" style={{ color: '#334155' }}>Next: {ch.nextProgram}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                {ch.isFavorite && <Star size={13} fill="#f59e0b" style={{ color: '#f59e0b' }} />}
                <div className="flex items-center justify-center rounded-full"
                  style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 4px 12px rgba(14,165,233,0.35)' }}>
                  <Play size={13} fill="white" style={{ color: 'white', marginLeft: 1 }} />
                </div>
              </div>
            </div>

            {/* Progress bar for currently playing */}
            {idx === 0 && (
              <div className="px-3 pb-2.5">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: '#475569' }}>20:00</span>
                  <span className="text-xs font-semibold" style={{ color: '#0ea5e9' }}>LIVE</span>
                  <span className="text-xs" style={{ color: '#475569' }}>21:00</span>
                </div>
                <div className="h-1 rounded-full w-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full relative" style={{ width: '42%', background: 'linear-gradient(90deg, #0ea5e9, #22c55e)' }}>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full" style={{ width: 8, height: 8, background: '#fff', boxShadow: '0 0 6px rgba(14,165,233,0.8)' }} />
                  </div>
                </div>
              </div>
            )}
          </button>
        ))}
      </div>
      <BottomNav active="live-tv" onNavigate={onNavigate} />
    </div>
  );
}
