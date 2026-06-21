import { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Play, Star, Heart, Clock, Loader2 } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import TVSideNav from './TVSideNav';
import { Content, Favorites, Progress } from '@/lib/api';

export default function TVSeriesDetailScreen() {
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
        setIsFav((favs || []).some((f: any) => String(f.content_id) === String(id) && f.content_type === "series"));
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
      <div className="absolute inset-0 flex items-center justify-center" style={{ background: '#030608' }}>
        <Loader2 className="w-12 h-12 animate-spin text-brand" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: '#030608' }}>
        <p className="text-zinc-500 mb-4">Series not found</p>
        <button tabIndex={0} onClick={() => navigate(-1)} className="px-6 py-3 bg-zinc-800 rounded-xl text-white font-bold">Go Back</button>
      </div>
    );
  }

  const title = data.name || data.title || data.info?.name;
  const backdrop = data.backdrop_path?.[0] || data.backdrop_path || data.cover;
  const plot = data.plot || data.info?.plot;

  return (
    <div className="absolute inset-0 flex" style={{ background: '#030608' }}>
      <TVSideNav active="series" />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img src={backdrop || "https://images.pexels.com/photos/6615261/pexels-photo-6615261.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&dpr=1"} alt={title} className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#030608] via-[#030608]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#030608] via-[#030608]/40 to-transparent" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <div className="p-10 max-w-4xl">
            <button tabIndex={0} onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-zinc-400 hover:text-white transition group focus:outline-none">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 group-focus:ring-2 ring-brand">
                <ArrowLeft size={18} />
              </div>
              <span className="font-semibold text-sm">Back to Series</span>
            </button>

            <h1 className="text-5xl font-black text-white mb-4 leading-tight">{title}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              {data.rating && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                  <Star size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                  <span className="font-bold text-white text-sm">{data.rating}</span>
                </div>
              )}
              {data.year && <span className="text-zinc-300 font-semibold">{data.year}</span>}
              {data.seasons && <span className="text-zinc-300 font-semibold">{data.seasons.length} Seasons</span>}
              {data.genre && (
                <span className="px-3 py-1 rounded-full text-sm font-semibold" style={{ background: 'rgba(229,9,20,0.15)', color: '#38bdf8' }}>
                  {data.genre.split(',')[0]}
                </span>
              )}
              <button tabIndex={0} onClick={toggleFav} className="ml-2 flex items-center gap-2 px-4 py-1.5 rounded-full font-semibold text-sm transition focus:outline-none focus:ring-2 ring-brand group"
                style={{ background: isFav ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.1)', color: isFav ? '#fca5a5' : '#fff' }}>
                <Heart size={16} fill={isFav ? '#ef4444' : 'none'} style={{ color: isFav ? '#ef4444' : '#fff' }} />
                {isFav ? 'Favorited' : 'Add to Favorites'}
              </button>
            </div>

            {plot && <p className="text-lg text-zinc-300 mb-8 leading-relaxed max-w-3xl">{plot}</p>}

            {data.seasons && data.seasons.length > 0 && (
              <div className="mt-8">
                {/* Season Selector */}
                <div className="flex gap-3 overflow-x-auto mb-6 pb-2" style={{ scrollbarWidth: 'none' }}>
                  {data.seasons.map((s: any) => (
                    <button tabIndex={0} key={s.season_number}
                      onClick={() => setSeason(s.season_number)}
                      className="px-6 py-2.5 rounded-xl font-bold transition focus:outline-none focus:ring-2 ring-white/50"
                      style={{
                        background: season === s.season_number ? 'linear-gradient(135deg, var(--brand-primary), #B80710)' : 'rgba(255,255,255,0.05)',
                        color: season === s.season_number ? '#fff' : '#94a3b8',
                        border: season === s.season_number ? '1px solid transparent' : '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      Season {s.season_number}
                    </button>
                  ))}
                </div>

                {/* Episodes Grid */}
                <div className="grid grid-cols-2 gap-4 pb-20">
                  {currentSeason?.episodes?.map((ep: any) => {
                    const epProgress = progressMap[ep.id] || 0;
                    return (
                      <button tabIndex={0} key={ep.id} onClick={() => navigate(`/watch/episode/${ep.id}`)}
                        className="flex items-center gap-4 p-3 rounded-xl text-left relative overflow-hidden group focus:outline-none"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)' }}
                      >
                        <div className="flex items-center justify-center rounded-lg flex-shrink-0 font-bold text-lg bg-black/40 w-14 h-14 text-zinc-400 group-hover:bg-brand group-hover:text-white transition">
                          {ep.episode_num}
                        </div>
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="text-base font-bold text-zinc-100 truncate mb-1 group-hover:text-[#38bdf8] transition">{ep.title}</p>
                          <div className="flex items-center gap-1.5">
                            <Clock size={13} className="text-zinc-500" />
                            <span className="text-sm text-zinc-500 font-medium">{ep.duration || 'Unknown'}</span>
                          </div>
                        </div>
                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-brand group-focus:border-brand rounded-xl transition pointer-events-none" />
                        {epProgress > 0 && (
                          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
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
    </div>
  );
}
