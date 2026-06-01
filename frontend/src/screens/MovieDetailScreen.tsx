import { useState, useEffect } from 'react';
import { ArrowLeft, Play, Star, Heart, Download, Share2, Clock, ChevronDown, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Content, Favorites } from '@/lib/api';

export default function MovieDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [movie, setMovie] = useState<any>(null);
  const [isFav, setIsFav] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [m, favs] = await Promise.all([
          Content.movie(id),
          Favorites.list().catch(() => []),
        ]);
        setMovie(m);
        setIsFav((favs || []).some((f: any) => f.content_id === id && (f.content_type === "movie" || f.content_type === "vod")));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const toggleFav = async () => {
    if (!movie || !id) return;
    if (isFav) {
      await Favorites.remove("movie", id);
      setIsFav(false);
    } else {
      await Favorites.add({
        content_type: "movie",
        content_id: id,
        content_data: { name: movie.name || movie.title, stream_icon: movie.stream_icon, year: movie.year, rating: movie.rating, genre: movie.genre },
      });
      setIsFav(true);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#030608' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[#E50914]" />
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#030608' }}>
        <p className="text-zinc-500 mb-4">Movie not found</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-zinc-800 rounded-lg text-white">Go Back</button>
      </div>
    );
  }

  const title = movie.name || movie.title || movie.info?.name;
  const backdrop = movie.backdrop || movie.info?.backdrop_path || movie.stream_icon;
  const poster = movie.stream_icon || movie.info?.movie_image;
  const plot = movie.plot || movie.info?.plot || movie.description;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#030608' }}>
      {/* Hero */}
      <div className="relative flex-shrink-0" style={{ height: 300 }}>
        <img
          src={backdrop || "https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=700&h=450&dpr=1"}
          alt={title}
          className="w-full h-full object-cover"
          onError={(e) => { e.currentTarget.src = poster || "https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=700&h=450&dpr=1" }}
        />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, rgba(8,12,20,0.7) 70%, #030608 100%)' }} />

        {/* Top nav */}
        <div className="absolute top-14 left-0 right-0 flex items-center justify-between px-5">
          <button onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-full"
            style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <ArrowLeft size={20} style={{ color: '#fff' }} />
          </button>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center rounded-full"
              style={{ width: 36, height: 36, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Share2 size={16} style={{ color: '#fff' }} />
            </button>
          </div>
        </div>

        {/* Large centered play */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button onClick={() => navigate(`/watch/movie/${id}`)}
            className="flex items-center justify-center rounded-full pointer-events-auto transition-transform hover:scale-105"
            style={{ width: 68, height: 68, background: 'rgba(229,9,20,0.9)', boxShadow: '0 0 0 8px rgba(229,9,20,0.15), 0 8px 32px rgba(229,9,20,0.5)' }}>
            <Play size={28} fill="white" style={{ color: 'white', marginLeft: 3 }} />
          </button>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: 'none' }}>
        <div className="px-5 pt-1">
          {/* Title + heart */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h1 className="text-2xl font-black leading-tight flex-1" style={{ color: '#f8fafc' }}>{title}</h1>
            <button onClick={toggleFav} className="flex items-center justify-center rounded-xl flex-shrink-0 mt-1"
              style={{ width: 44, height: 44, background: isFav ? 'rgba(239,68,68,0.15)' : '#1A1A1A', border: `1px solid ${isFav ? 'rgba(239,68,68,0.3)' : '#2A2A2A'}` }}>
              <Heart size={20} fill={isFav ? '#ef4444' : 'none'} style={{ color: isFav ? '#ef4444' : '#64748b' }} />
            </button>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            {movie.rating && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg" style={{ background: 'rgba(245,158,11,0.1)' }}>
                <Star size={12} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>{movie.rating}</span>
              </div>
            )}
            {(movie.year || movie.releasedate) && (
              <>
                <span style={{ color: '#2A2A2A' }}>|</span>
                <span className="text-xs font-medium" style={{ color: '#64748b' }}>{movie.year || movie.releasedate}</span>
              </>
            )}
            {movie.duration && (
              <>
                <span style={{ color: '#2A2A2A' }}>|</span>
                <div className="flex items-center gap-1">
                  <Clock size={11} style={{ color: '#475569' }} />
                  <span className="text-xs font-medium" style={{ color: '#64748b' }}>{movie.duration}</span>
                </div>
              </>
            )}
          </div>

          {/* Tags */}
          {movie.genre && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {movie.genre.split(',').map((tag: string) => (
                <span key={tag} className="text-xs px-3 py-1.5 rounded-full font-semibold"
                  style={{ background: '#1A1A1A', color: '#64748b', border: '1px solid #2A2A2A' }}>
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}

          {/* Play button */}
          <button onClick={() => navigate(`/watch/movie/${id}`)}
            className="w-full py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 mb-5"
            style={{ background: 'linear-gradient(135deg, #E50914, #B80710)', boxShadow: '0 8px 24px rgba(229,9,20,0.35)', fontSize: 15 }}>
            <Play size={17} fill="white" /> Play Movie
          </button>

          {/* Synopsis */}
          {plot && (
            <div className="mb-5">
              <h3 className="text-sm font-black mb-2" style={{ color: '#f1f5f9' }}>Synopsis</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{plot}</p>
            </div>
          )}

          {/* Cast */}
          {(movie.cast || movie.actors) && (
            <div className="mb-5">
              <h3 className="text-sm font-black mb-2" style={{ color: '#f1f5f9' }}>Cast</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{movie.cast || movie.actors}</p>
            </div>
          )}

          {/* Director */}
          {movie.director && (
            <div className="mb-5">
              <h3 className="text-sm font-black mb-2" style={{ color: '#f1f5f9' }}>Director</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{movie.director}</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
