import { Search, SlidersHorizontal, Star } from 'lucide-react';
import { useMaxxData } from '../data/useMaxxData';
import BottomNav from '../components/BottomNav';
import type { Screen } from '../types';

interface Props { onNavigate: (s: Screen) => void; }
const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Biography'];

export default function MoviesScreen({ onNavigate }: Props) {
  const { channels, movies, seriesData, playlists, epgData, epgCategories } = useMaxxData();

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="flex-shrink-0 pt-14 px-5 pb-3" style={{ background: 'linear-gradient(180deg, #0d1117 0%, #0a0a0f 100%)' }}>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Movies</h1>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center rounded-xl" style={{ width: 38, height: 38, background: '#12161e', border: '1px solid #1e2838' }}>
              <Search size={17} style={{ color: '#94a3b8' }} />
            </button>
            <button className="flex items-center justify-center rounded-xl" style={{ width: 38, height: 38, background: '#12161e', border: '1px solid #1e2838' }}>
              <SlidersHorizontal size={17} style={{ color: '#94a3b8' }} />
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {genres.map((g, i) => (
            <button key={g} className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold"
              style={{
                background: i === 0 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#12161e',
                color: i === 0 ? '#fff' : '#64748b',
                border: i === 0 ? 'none' : '1px solid #1e2838',
                boxShadow: i === 0 ? '0 4px 12px rgba(14,165,233,0.3)' : 'none',
              }}
            >{g}</button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between px-5 py-2">
        <span className="text-xs font-medium" style={{ color: '#475569' }}>{movies.length * 2} movies</span>
        <button className="text-xs font-semibold" style={{ color: '#64748b' }}>Recently Added ▾</button>
      </div>
      <div className="flex-1 overflow-y-auto pb-20 px-5">
        <div className="grid grid-cols-3 gap-2.5">
          {[...movies, ...movies].map((m, idx) => (
            <button key={`${m.id}-${idx}`} onClick={() => onNavigate('movie-detail')}
              className="relative rounded-xl overflow-hidden"
              style={{ aspectRatio: '2/3', border: '1px solid #1e2838' }}
            >
              <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
              <div className="absolute inset-x-0 bottom-0 p-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                <p className="text-xs font-semibold text-white leading-tight truncate">{m.title}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={9} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                  <span style={{ color: '#fbbf24', fontSize: 10 }}>{m.rating}</span>
                </div>
              </div>
              {m.isFavorite && (
                <div className="absolute top-1.5 right-1.5 rounded-full flex items-center justify-center" style={{ width: 20, height: 20, background: 'rgba(239,68,68,0.9)' }}>
                  <Star size={9} fill="white" style={{ color: 'white' }} />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
      <BottomNav active="movies" onNavigate={onNavigate} />
    </div>
  );
}
