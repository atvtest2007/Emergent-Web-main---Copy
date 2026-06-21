import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Play, Star, Heart, Clock, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { Content, Favorites, Progress } from '@/lib/api';

export default function SeriesDetailScreen() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [season, setSeason] = useState(1);
  const [isFav, setIsFav] = useState(false);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const [d, favs, progress] = await Promise.all([
          Content.series(id).catch(() => null),
          Favorites.list().catch(() => []),
          Progress.list().catch(() => []),
        ]);
        setData(d);
        setIsFav((favs || []).some((f: any) => f.content_id === id && f.content_type === "series"));
        const map: Record<string, number> = {};
        (progress || []).forEach((p: any) => { map[p.content_id] = p.progress; });
        setProgressMap(map);
        if (d?.seasons?.length) setSeason(d.seasons[0].season_number);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const currentSeason = useMemo(() => {
    if (!data?.seasons) return null;
    return data.seasons.find((s: any) => s.season_number === season) || data.seasons[0];
  }, [data, season]);

  const toggleFav = async () => {
    if (!data || !id) return;
    if (isFav) {
      await Favorites.remove("series", id);
      setIsFav(false);
    } else {
      await Favorites.add({
        content_type: "series",
        content_id: id,
        content_data: { name: data.name || data.title, cover: data.cover, year: data.year, rating: data.rating, genre: data.genre },
      });
      setIsFav(true);
    }
  };

  if (loading) {
    return (
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#0a0a0f' }}>
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#0a0a0f' }}>
        <p className="text-zinc-500 mb-4">Series not found</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-zinc-800 rounded-lg text-white">Go Back</button>
      </div>
    );
  }

  const title = data.name || data.title || data.info?.name;
  const backdrop = data.backdrop_path || data.cover;
  const poster = data.cover || data.info?.cover;
  const plot = data.plot || data.info?.plot;

  return (
    <div className="absolute inset-0 flex flex-col" style={{ background: '#0a0a0f' }}>
      <div className="relative flex-shrink-0" style={{ height: 250 }}>
        <img src={backdrop || "https://images.pexels.com/photos/6615261/pexels-photo-6615261.jpeg?auto=compress&cs=tinysrgb&w=600&h=350&dpr=1"} alt={title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, rgba(10,10,15,0.95) 90%, #0a0a0f 100%)' }} />
        <button onClick={() => navigate(-1)} className="absolute top-14 left-5 flex items-center justify-center rounded-full" style={{ width: 40, height: 40, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <ArrowLeft size={20} style={{ color: '#fff' }} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto pb-20" style={{ scrollbarWidth: 'none' }}>
        <div className="px-5 -mt-2">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1">
              <h1 className="text-xl font-black leading-tight" style={{ color: '#f8fafc' }}>{title}</h1>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {data.rating && (
                  <div className="flex items-center gap-1">
                    <Star size={13} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                    <span className="text-sm font-bold" style={{ color: '#fbbf24' }}>{data.rating}</span>
                  </div>
                )}
                {data.year && (
                  <>
                    <span style={{ color: '#334155' }}>·</span>
                    <span className="text-sm" style={{ color: '#94a3b8' }}>{data.year}</span>
                  </>
                )}
                {data.seasons && (
                  <>
                    <span style={{ color: '#334155' }}>·</span>
                    <span className="text-sm" style={{ color: '#94a3b8' }}>{data.seasons.length} Seasons</span>
                  </>
                )}
                {data.genre && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(229,9,20,0.1)', color: '#38bdf8', border: '1px solid rgba(229,9,20,0.2)' }}>{data.genre.split(',')[0]}</span>
                )}
              </div>
            </div>
            <button onClick={toggleFav} className="flex items-center justify-center rounded-xl flex-shrink-0"
              style={{ width: 44, height: 44, background: isFav ? 'rgba(239,68,68,0.15)' : '#1A1A1A', border: `1px solid ${isFav ? 'rgba(239,68,68,0.3)' : '#2A2A2A'}` }}>
              <Heart size={20} fill={isFav ? '#ef4444' : 'none'} style={{ color: isFav ? '#ef4444' : '#64748b' }} />
            </button>
          </div>

          {plot && <p className="text-sm leading-relaxed mb-4" style={{ color: '#64748b' }}>{plot}</p>}

          {currentSeason?.episodes?.[0] && (
            <button onClick={() => navigate(`/watch/episode/${currentSeason.episodes[0].id}`)} className="w-full py-3.5 rounded-2xl font-bold text-white flex items-center justify-center gap-2 mb-5"
              style={{ background: 'linear-gradient(135deg, var(--brand-primary) 0%, #B80710 100%)', boxShadow: '0 6px 20px rgba(229,9,20,0.3)' }}>
              <Play size={16} fill="white" /> Play S{currentSeason.season_number} E{currentSeason.episodes[0].episode_num}
            </button>
          )}

          {data.seasons && data.seasons.length > 0 && (
            <div className="mb-4">
              <div className="flex gap-2 overflow-x-auto mb-4" style={{ scrollbarWidth: 'none' }}>
                {data.seasons.map((s: any) => (
                  <button
                    key={s.season_number}
                    onClick={() => setSeason(s.season_number)}
                    className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold"
                    style={{
                      background: season === s.season_number ? 'linear-gradient(135deg, var(--brand-primary), #B80710)' : '#1A1A1A',
                      color: season === s.season_number ? '#fff' : '#64748b',
                      border: season === s.season_number ? 'none' : '1px solid #2A2A2A',
                    }}
                  >
                    Season {s.season_number}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold" style={{ color: '#f1f5f9' }}>Season {season}</h3>
                <span className="text-xs" style={{ color: '#475569' }}>{currentSeason?.episodes?.length || 0} episodes</span>
              </div>

              <div className="flex flex-col gap-2">
                {currentSeason?.episodes?.map((ep: any, idx: number) => {
                  const epProgress = progressMap[ep.id] || 0;
                  return (
                    <button key={ep.id} onClick={() => navigate(`/watch/episode/${ep.id}`)}
                      className="flex items-center gap-3 p-3 rounded-xl w-full text-left relative overflow-hidden"
                      style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}
                    >
                      <div className="flex items-center justify-center rounded-lg flex-shrink-0 font-bold text-sm"
                        style={{ width: 40, height: 40, background: '#2A2A2A', color: '#64748b' }}>
                        {ep.episode_num}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{ep.title}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Clock size={11} style={{ color: '#475569' }} />
                          <span className="text-xs" style={{ color: '#475569' }}>{ep.duration || 'Unknown'}</span>
                        </div>
                      </div>
                      <Play size={14} style={{ color: '#475569', flexShrink: 0 }} />
                      
                      {epProgress > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/10">
                          <div className="h-full bg-brand" style={{ width: `${Math.min(100, epProgress * 100)}%` }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
