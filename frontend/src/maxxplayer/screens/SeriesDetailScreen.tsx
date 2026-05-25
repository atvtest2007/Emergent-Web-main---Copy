import { ArrowLeft, Play, Star, Heart, Clock } from 'lucide-react';
import { useMaxxData } from '../data/useMaxxData';
import BottomNav from '../components/BottomNav';
import type { Screen } from '../types';

interface Props { onNavigate: (s: Screen) => void; }

const seasons = [
  { num: 1, episodes: [
    { title: 'The Heirs of the Dragon', duration: '1h 6m' },
    { title: 'The Rogue Prince', duration: '58m' },
    { title: 'Second of His Name', duration: '1h 3m' },
    { title: 'King of the Narrow Sea', duration: '1h 4m' },
    { title: 'We Light the Way', duration: '1h 14m' },
  ]},
  { num: 2, episodes: [
    { title: 'A Son for a Son', duration: '1h 1m' },
    { title: 'Rhaenyra the Cruel', duration: '52m' },
    { title: 'The Burning Mill', duration: '55m' },
  ]},
];

export default function SeriesDetailScreen({ onNavigate }: Props) {
  const { channels, movies, seriesData, playlists, epgData, epgCategories } = useMaxxData();

  const series = seriesData[0];
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="relative flex-shrink-0" style={{ height: 250 }}>
        <img src="https://images.pexels.com/photos/6615261/pexels-photo-6615261.jpeg?auto=compress&cs=tinysrgb&w=600&h=350&dpr=1" alt={series.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(10,10,15,0.95) 90%, #0a0a0f 100%)' }} />
        <button onClick={() => onNavigate('series')} className="absolute top-14 left-5 flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <ArrowLeft size={20} style={{ color: '#fff' }} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-20">
        <div className="px-5 -mt-2">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-black leading-tight" style={{ color: '#f8fafc' }}>{series.title}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <div className="flex items-center gap-1">
                  <Star size={13} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                  <span className="text-sm font-bold" style={{ color: '#fbbf24' }}>{series.rating}</span>
                </div>
                <span style={{ color: '#334155' }}>·</span>
                <span className="text-sm" style={{ color: '#94a3b8' }}>{series.year}</span>
                <span style={{ color: '#334155' }}>·</span>
                <span className="text-sm" style={{ color: '#94a3b8' }}>{series.seasons} Seasons</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)' }}>{series.genre}</span>
              </div>
            </div>
            <button className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: 44, height: 44, background: series.isFavorite ? 'rgba(239,68,68,0.15)' : '#12161e', border: `1px solid ${series.isFavorite ? 'rgba(239,68,68,0.3)' : '#1e2838'}` }}>
              <Heart size={20} fill={series.isFavorite ? '#ef4444' : 'none'} style={{ color: series.isFavorite ? '#ef4444' : '#64748b' }} />
            </button>
          </div>
          <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b' }}>{series.synopsis}</p>
          <button onClick={() => onNavigate('player')} className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 mb-5"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', boxShadow: '0 6px 20px rgba(14,165,233,0.3)' }}>
            <Play size={16} fill="white" /> Continue Watching S1 E1
          </button>
          {seasons.map((season) => (
            <div key={season.num} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold" style={{ color: '#f1f5f9' }}>Season {season.num}</h3>
                <span className="text-xs" style={{ color: '#475569' }}>{season.episodes.length} episodes</span>
              </div>
              <div className="flex flex-col gap-2">
                {season.episodes.map((ep, idx) => (
                  <button key={idx} onClick={() => onNavigate('player')}
                    className="flex items-center gap-3 p-3 rounded-xl w-full text-left"
                    style={{ background: '#12161e', border: '1px solid #1e2838' }}
                  >
                    <div className="flex items-center justify-center rounded-lg flex-shrink-0 font-bold text-sm"
                      style={{ width: 40, height: 40, background: idx === 0 && season.num === 1 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#1e2838', color: idx === 0 && season.num === 1 ? '#fff' : '#64748b' }}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{ep.title}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Clock size={11} style={{ color: '#475569' }} />
                        <span className="text-xs" style={{ color: '#475569' }}>{ep.duration}</span>
                      </div>
                    </div>
                    <Play size={14} style={{ color: '#475569', flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="series" onNavigate={onNavigate} />
    </div>
  );
}
