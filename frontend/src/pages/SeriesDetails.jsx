import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Content, Favorites, Progress } from "@/lib/api";
import { Loader2, Play, Heart, Star, Calendar, ChevronLeft } from "lucide-react";
import { toast } from "sonner";

export default function SeriesDetails() {
    const { id } = useParams();
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [season, setSeason] = useState(1);
    const [isFav, setIsFav] = useState(false);
    const [progressMap, setProgressMap] = useState({});

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [d, favs, progress] = await Promise.all([
                    Content.series(id),
                    Favorites.list().catch(() => []),
                    Progress.list().catch(() => []),
                ]);
                setData(d);
                setIsFav((favs || []).some((f) => f.content_id === id && f.content_type === "series"));
                const map = {};
                (progress || []).forEach((p) => { map[p.content_id] = p.progress; });
                setProgressMap(map);
                if (d?.seasons?.length) setSeason(d.seasons[0].season_number);
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const currentSeason = useMemo(() => {
        if (!data?.seasons) return null;
        return data.seasons.find((s) => s.season_number === season) || data.seasons[0];
    }, [data, season]);

    const toggleFav = async () => {
        if (!data) return;
        if (isFav) {
            await Favorites.remove("series", id);
            setIsFav(false);
            toast.info("Removed from favorites");
        } else {
            await Favorites.add({
                content_type: "series",
                content_id: id,
                content_data: { name: data.name || data.title, cover: data.cover, year: data.year, rating: data.rating, genre: data.genre },
            });
            setIsFav(true);
            toast.success("Added to favorites");
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#E50914]" /></div>;
    }
    if (!data) return <div className="px-12 py-20 text-zinc-400">Series not found.</div>;

    const title = data.name || data.title || data.info?.name;
    const backdrop = data.backdrop_path || data.cover;
    const poster = data.cover || data.info?.cover;

    return (
        <div data-testid="series-details-page">
            <div className="relative h-[60vh] min-h-[420px] overflow-hidden">
                <img src={backdrop} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 hero-mask" />
                <div className="absolute inset-x-0 bottom-0 h-32 hero-mask-v" />
                <button onClick={() => nav(-1)} className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10" data-testid="series-back-btn">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-12 flex items-end pb-10">
                    <div className="flex gap-8 items-end">
                        <img src={poster} alt={title} className="hidden md:block w-40 lg:w-52 rounded-md shadow-2xl shadow-black/60 border border-white/10" />
                        <div className="animate-fade-up">
                            <div className="text-xs tracking-[0.32em] uppercase font-bold text-[#E50914] mb-2">Series · {data.seasons?.length || 0} Seasons</div>
                            <h1 className="font-display text-4xl lg:text-6xl font-black tracking-tighter leading-[0.95]">{title}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-zinc-300">
                                {data.year && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-500" />{data.year}</span>}
                                {data.rating && <span className="flex items-center gap-1.5 text-amber-400 font-bold"><Star className="w-3.5 h-3.5 fill-amber-400" />{data.rating}</span>}
                                {data.genre && <span className="text-zinc-400">{data.genre}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 lg:px-12 max-w-7xl mx-auto pb-16 -mt-2 relative z-10">
                <div className="flex flex-wrap gap-3 mb-8">
                    {currentSeason?.episodes?.[0] && (
                        <Link to={`/watch/episode/${currentSeason.episodes[0].id}`} className="inline-flex items-center gap-2 px-7 py-3 rounded-md bg-[#E50914] hover:bg-[#F40612] font-semibold transition shadow-xl shadow-red-900/30" data-testid="series-play-btn">
                            <Play className="w-5 h-5 fill-white" /> Play S{currentSeason.season_number}E{currentSeason.episodes[0].episode_num}
                        </Link>
                    )}
                    <button onClick={toggleFav} className={`inline-flex items-center gap-2 px-5 py-3 rounded-md border font-semibold transition ${isFav ? "bg-[#E50914]/20 border-[#E50914] text-white" : "bg-white/5 border-white/10 hover:bg-white/10"}`} data-testid="series-favorite-btn">
                        <Heart className={`w-5 h-5 ${isFav ? "fill-[#E50914] text-[#E50914]" : ""}`} />
                        {isFav ? "Favorited" : "Favorite"}
                    </button>
                </div>

                <p className="text-base lg:text-lg text-zinc-300 leading-relaxed max-w-3xl mb-10">
                    {data.plot || data.info?.plot || "No description available."}
                </p>

                {/* Seasons selector */}
                {data.seasons?.length > 0 && (
                    <>
                        <div className="flex items-center gap-3 mb-6">
                            <h2 className="font-display text-2xl font-bold tracking-tight">Episodes</h2>
                            <div className="flex flex-wrap gap-2 ml-auto">
                                {data.seasons.map((s) => (
                                    <button
                                        key={s.season_number}
                                        onClick={() => setSeason(s.season_number)}
                                        className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase transition ${season === s.season_number ? "bg-[#E50914] text-white" : "bg-white/5 hover:bg-white/10 text-zinc-300"}`}
                                        data-testid={`season-${s.season_number}`}
                                    >
                                        Season {s.season_number}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            {currentSeason?.episodes?.map((ep) => {
                                const epProgress = progressMap[ep.id] || 0;
                                return (
                                    <Link
                                        key={ep.id}
                                        to={`/watch/episode/${ep.id}`}
                                        className="group flex gap-4 p-3 rounded-md bg-[#121212] border border-white/5 hover:border-[#E50914]/40 hover:bg-[#1a1a1a] transition"
                                        data-testid={`episode-${ep.id}`}
                                    >
                                        <div className="relative w-44 aspect-video rounded-md overflow-hidden bg-black shrink-0">
                                            <img src={ep.thumbnail || data.cover} alt={ep.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                <div className="w-12 h-12 rounded-full bg-[#E50914] flex items-center justify-center">
                                                    <Play className="w-5 h-5 fill-white ml-0.5" />
                                                </div>
                                            </div>
                                            {epProgress > 0 && (
                                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
                                                    <div className="h-full bg-[#E50914]" style={{ width: `${Math.min(100, epProgress * 100)}%` }} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-xs tracking-wider uppercase font-bold text-zinc-500">Episode {ep.episode_num}</div>
                                            <div className="font-semibold text-zinc-100 mt-0.5 line-clamp-1">{ep.title}</div>
                                            <div className="text-xs text-zinc-400 mt-1">{ep.duration}</div>
                                            <div className="text-sm text-zinc-300 mt-2 line-clamp-2 leading-snug">{ep.plot}</div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
