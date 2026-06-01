import { Play, Star } from 'lucide-react';
import { channels } from '../../data/mockData';
import TVSideNav from './TVSideNav';
import type { Screen } from '@/types';

interface Props { onNavigate: (s: Screen) => void; }
const categories = ['All', 'Sports', 'News', 'Entertainment', 'Documentary', 'Kids', 'Movies'];

export default function TVLiveTVScreen({ onNavigate }: Props) {
  return (
    <div className="absolute inset-0 flex" style={{ background: '#080c14' }}>
      <TVSideNav active="live-tv" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Live TV</h1>
            <p className="text-xs" style={{ color: '#475569' }}>
              <span style={{ color: '#22c55e' }}>● </span>{channels.length} channels available
            </p>
          </div>
          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat, i) => (
              <button key={cat} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
                style={{
                  background: i === 0 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#12161e',
                  color: i === 0 ? '#fff' : '#64748b',
                  border: i === 0 ? 'none' : '1px solid #1e2838',
                }}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Two-column layout: channel list + now playing preview */}
        <div className="flex-1 flex overflow-hidden">
          {/* Channel list */}
          <div className="flex flex-col overflow-y-auto px-4 py-3 gap-1.5" style={{ width: 420, scrollbarWidth: 'none', borderRight: '1px solid rgba(255,255,255,0.04)' }}>
            {channels.map((ch, idx) => (
              <button
                key={ch.id}
                onClick={() => onNavigate('player')}
                className="flex items-center gap-3 p-2.5 rounded-xl w-full text-left"
                style={{
                  background: idx === 0 ? 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(2,132,199,0.08))' : '#12161e',
                  border: `1px solid ${idx === 0 ? 'rgba(14,165,233,0.3)' : '#1a2030'}`,
                }}
              >
                <span className="flex-shrink-0 text-xs font-bold w-6 text-center" style={{ color: '#334155' }}>
                  {String(idx + 1).padStart(2, '0')}
                </span>
                <div className="flex-shrink-0 rounded-lg overflow-hidden" style={{ width: 38, height: 38, border: '1px solid #1e2838' }}>
                  <img src={ch.logo} alt={ch.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold truncate" style={{ color: idx === 0 ? '#e2e8f0' : '#94a3b8' }}>{ch.name}</p>
                    {idx === 0 && (
                      <span className="text-xs px-1.5 py-0.5 rounded font-black" style={{ background: 'rgba(14,165,233,0.2)', color: '#38bdf8', fontSize: 8 }}>NOW</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1 h-1 rounded-full" style={{ background: '#22c55e' }} />
                    <p className="text-xs truncate" style={{ color: '#475569', fontSize: 10 }}>{ch.currentProgram}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {ch.isFavorite && <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />}
                </div>
              </button>
            ))}
          </div>

          {/* Now Playing Preview */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Preview image */}
            <div className="relative flex-shrink-0" style={{ height: 240 }}>
              <img
                src={channels[0].logo}
                alt="Now Playing"
                className="w-full h-full object-cover"
                style={{ filter: 'blur(2px)', opacity: 0.3 }}
              />
              <img
                src="https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=800&h=450&dpr=1"
                alt="Now Playing"
                className="absolute inset-0 w-full h-full object-cover"
                style={{ opacity: 0.7 }}
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, transparent 40%, #080c14 100%)' }} />

              {/* Live badge */}
              <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(239,68,68,0.9)', backdropFilter: 'blur(8px)' }}>
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                <span className="text-xs font-black text-white tracking-widest" style={{ fontSize: 10 }}>LIVE</span>
              </div>
            </div>

            {/* Channel info */}
            <div className="flex-1 px-5 py-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h2 className="text-lg font-black" style={{ color: '#f8fafc' }}>{channels[0].name}</h2>
                  <p className="text-sm font-semibold" style={{ color: '#0ea5e9' }}>{channels[0].currentProgram}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#475569' }}>Next: {channels[0].nextProgram}</p>
                </div>
                <span className="text-xs px-2 py-0.5 rounded font-bold" style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>
                  {channels[0].category}
                </span>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="text-xs" style={{ color: '#475569' }}>20:00</span>
                  <span className="text-xs font-bold" style={{ color: '#0ea5e9' }}>LIVE · 42% complete</span>
                  <span className="text-xs" style={{ color: '#475569' }}>21:00</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
                  <div className="h-full rounded-full" style={{ width: '42%', background: 'linear-gradient(90deg, #0ea5e9, #22c55e)' }} />
                </div>
              </div>

              <button
                onClick={() => onNavigate('player')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm"
                style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff', boxShadow: '0 4px 16px rgba(14,165,233,0.4)' }}
              >
                <Play size={15} fill="white" /> Watch Live
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
