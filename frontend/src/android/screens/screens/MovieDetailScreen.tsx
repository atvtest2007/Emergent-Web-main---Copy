import { ArrowLeft, Play, Star, Heart, Download, Share2, Clock, ChevronDown } from 'lucide-react';
import { movies } from '../data/mockData';
import BottomNav from '../components/BottomNav';
import type { Screen } from '@/types';

interface Props { onNavigate: (s: Screen) => void; }

export default function MovieDetailScreen({ onNavigate }: Props) {
  const movie = movies[0];
  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#080c14' }}>
      {/* Hero */}
      <div className="relative flex-shrink-0" style={{ height: 300 }}>
        <img
          src="https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=700&h=450&dpr=1"
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, rgba(8,12,20,0.7) 70%, #080c14 100%)' }} />

        {/* Top nav */}
        <div className="absolute top-14 left-0 right-0 flex items-center justify-between px-5">
          <button onClick={() => onNavigate('movies')}
            className="flex items-center justify-center rounded-full"
            style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ArrowLeft size={20} style={{ color: '#fff' }} />
          </button>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center rounded-full"
              style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Download size={16} style={{ color: '#fff' }} />
            </button>
            <button className="flex items-center justify-center rounded-full"
              style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Share2 size={16} style={{ color: '#fff' }} />
            </button>
          </div>
        </div>

        {/* Large centered play */}
        <div className="absolute inset-0 flex items-center justify-center">
          <button onClick={() => onNavigate('player')}
            className="flex items-center justify-center rounded-full"
            style={{ width: 68, height: 68, background: 'rgba(14,165,233,0.9)', boxShadow: '0 0 0 8px rgba(14,165,233,0.15), 0 8px 32px rgba(14,165,233,0.5)' }}>
            <Play size={28} fill="white" style={{ color: 'white', marginLeft: 3 }} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: 'none' }}>
        <div className="px-5 pt-1">
          {/* Title + heart */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-black leading-tight flex-1" style={{ color: '#f8fafc' }}>{movie.title}</h1>
            <button className="flex items-center justify-center rounded-xl flex-shrink-0 mt-1"
              style={{ width: 44, height: 44, background: movie.isFavorite ? 'rgba(239,68,68,0.15)' : '#12161e', border: `1px solid ${movie.isFavorite ? 'rgba(239,68,68,0.3)' : '#1e2838'}` }}>
              <Heart size={20} fill={movie.isFavorite ? '#ef4444' : 'none'} style={{ color: movie.isFavorite ? '#ef4444' : '#64748b' }} />
            </button>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)' }}>
              <Star size={12} fill="#f59e0b" style={{ color: '#f59e0b' }} />
              <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>{movie.rating}</span>
            </div>
            <span style={{ color: '#1e2838' }}>|</span>
            <span className="text-xs font-medium" style={{ color: '#64748b' }}>{movie.year}</span>
            <span style={{ color: '#1e2838' }}>|</span>
            <div className="flex items-center gap-1">
              <Clock size={11} style={{ color: '#475569' }} />
              <span className="text-xs font-medium" style={{ color: '#64748b' }}>{movie.duration}</span>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(14,165,233,0.1)', color: '#38bdf8', border: '1px solid rgba(14,165,233,0.2)', fontSize: 10 }}>
              4K HDR
            </span>
          </div>

          {/* Tags */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {[movie.genre, 'Adventure', 'Epic'].map((tag) => (
              <span key={tag} className="text-xs px-3 py-1.5 rounded-full font-semibold"
                style={{ background: '#12161e', color: '#64748b', border: '1px solid #1e2838' }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Play button */}
          <button onClick={() => onNavigate('player')}
            className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 mb-3"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 8px 24px rgba(14,165,233,0.35)', fontSize: 15 }}>
            <Play size={17} fill="white" /> Play Movie
          </button>

          {/* Player choice */}
          <div className="flex gap-2 mb-5">
            {['ExoPlayer', 'VLC Player'].map((p, i) => (
              <button key={p} className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{
                  background: i === 0 ? 'rgba(14,165,233,0.1)' : '#12161e',
                  border: `1px solid ${i === 0 ? 'rgba(14,165,233,0.3)' : '#1e2838'}`,
                  color: i === 0 ? '#0ea5e9' : '#475569',
                }}>
                {p}
              </button>
            ))}
          </div>

          {/* Synopsis */}
          <div className="mb-5">
            <h3 className="text-sm font-black mb-2" style={{ color: '#f1f5f9' }}>Synopsis</h3>
            <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{movie.synopsis}</p>
            <button className="flex items-center gap-1 mt-1 text-xs font-semibold" style={{ color: '#0ea5e9' }}>
              Read more <ChevronDown size={12} />
            </button>
          </div>

          {/* Cast row */}
          <div className="mb-5">
            <h3 className="text-sm font-black mb-3" style={{ color: '#f1f5f9' }}>Cast</h3>
            <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Oscar Isaac'].map((name, i) => (
                <div key={name} className="flex-shrink-0 flex flex-col items-center gap-1.5">
                  <div className="rounded-2xl overflow-hidden" style={{ width: 56, height: 56, border: '1.5px solid #1e2838' }}>
                    <img
                      src={movies[(i + 1) % movies.length].poster}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-xs font-medium text-center leading-tight" style={{ color: '#64748b', maxWidth: 60 }}>
                    {name.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* More Like This */}
          <div>
            <h3 className="text-sm font-black mb-3" style={{ color: '#f1f5f9' }}>More Like This</h3>
            <div className="flex gap-3 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
              {movies.slice(1).map((m) => (
                <button key={m.id} className="flex-shrink-0 rounded-xl overflow-hidden relative" style={{ width: 90, height: 135, border: '1px solid #1e2838' }}>
                  <img src={m.poster} alt={m.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 p-1.5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 100%)' }}>
                    <div className="flex items-center gap-0.5">
                      <Star size={8} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                      <span style={{ color: '#fbbf24', fontSize: 9 }}>{m.rating}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="movies" onNavigate={onNavigate} />
    </div>
  );
}
