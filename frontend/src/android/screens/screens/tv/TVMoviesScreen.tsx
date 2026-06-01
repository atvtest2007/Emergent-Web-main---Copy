import { Star, SlidersHorizontal } from 'lucide-react';
import { movies } from '../../data/mockData';
import TVSideNav from './TVSideNav';
import type { Screen } from '@/types';

interface Props { onNavigate: (s: Screen) => void; }
const genres = ['All', 'Action', 'Sci-Fi', 'Drama', 'Comedy', 'Horror', 'Biography', 'Thriller'];

export default function TVMoviesScreen({ onNavigate }: Props) {
  return (
    <div className="absolute inset-0 flex" style={{ background: '#080c14' }}>
      <TVSideNav active="movies" onNavigate={onNavigate} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <h1 className="text-xl font-black" style={{ color: '#f8fafc' }}>Movies</h1>
            <p className="text-xs" style={{ color: '#475569' }}>{movies.length * 2} titles available</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Genre pills */}
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {genres.map((g, i) => (
                <button key={g} className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
                  style={{
                    background: i === 0 ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : '#12161e',
                    color: i === 0 ? '#fff' : '#64748b',
                    border: i === 0 ? 'none' : '1px solid #1e2838',
                  }}>
                  {g}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
              style={{ background: '#12161e', color: '#64748b', border: '1px solid #1e2838' }}>
              <SlidersHorizontal size={13} /> Filter
            </button>
          </div>
        </div>

        {/* Movies grid */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ scrollbarWidth: 'none' }}>
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))' }}>
            {[...movies, ...movies].map((m, idx) => (
              <button
                key={`${m.id}-${idx}`}
                onClick={() => onNavigate('movie-detail')}
                className="relative rounded-xl overflow-hidden group"
                style={{ aspectRatio: '2/3', border: '1px solid #1e2838' }}
              >
                <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                <div className="absolute inset-x-0 bottom-0 p-1.5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                  <p className="font-semibold text-white truncate" style={{ fontSize: 9 }}>{m.title}</p>
                  <div className="flex items-center gap-0.5 mt-0.5">
                    <Star size={8} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                    <span style={{ color: '#fbbf24', fontSize: 8 }}>{m.rating}</span>
                  </div>
                </div>
                {/* Focus ring */}
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 pointer-events-none"
                  style={{ border: '2px solid #0ea5e9', boxShadow: '0 0 16px rgba(14,165,233,0.4)', transition: 'opacity 0.15s' }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
