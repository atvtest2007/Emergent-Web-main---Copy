import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Content, Favorites } from "@/lib/api";
import { Loader2, Play, Heart, Plus, Star, Clock, Calendar, Users, Film, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function MovieDetails() {
    const { id } = useParams();
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [movie, setMovie] = useState(null);
    const [isFav, setIsFav] = useState(false);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [m, favs] = await Promise.all([
                    Content.movie(id),
                    Favorites.list().catch(() => []),
                ]);
                setMovie(m);
                setIsFav((favs || []).some((f) => f.content_id === id && (f.content_type === "movie" || f.content_type === "vod")));
            } finally {
                setLoading(false);
            }
        })();
    }, [id]);

    const toggleFav = async () => {
        if (!movie) return;
        if (isFav) {
            await Favorites.remove("movie", id);
            setIsFav(false);
            toast.info("Removed from favorites");
        } else {
            await Favorites.add({
                content_type: "movie",
                content_id: id,
                content_data: { name: movie.name || movie.title, stream_icon: movie.stream_icon, year: movie.year, rating: movie.rating, genre: movie.genre },
            });
            setIsFav(true);
            toast.success("Added to favorites");
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#E50914]" /></div>;
    }
    if (!movie) {
        return <div className="px-12 py-20 text-zinc-400">Movie not found.</div>;
    }

    const title = movie.name || movie.title || movie.info?.name;
    const backdrop = movie.backdrop || movie.info?.backdrop_path || movie.stream_icon;
    const poster = movie.stream_icon || movie.info?.movie_image;

    return (
        <div data-testid="movie-details-page">
            <div className="relative h-[70vh] min-h-[480px] overflow-hidden">
                <img src={backdrop} alt={title} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 hero-mask" />
                <div className="absolute inset-x-0 bottom-0 h-32 hero-mask-v" />
                <button onClick={() => nav(-1)} className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10" data-testid="movie-back-btn">
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-12 flex items-end pb-12">
                    <div className="flex gap-8 items-end">
                        <img src={poster} alt={title} className="hidden md:block w-44 lg:w-56 rounded-md shadow-2xl shadow-black/60 border border-white/10" />
                        <div className="animate-fade-up">
                            <div className="text-xs tracking-[0.32em] uppercase font-bold text-[#E50914] mb-2">Movie</div>
                            <h1 className="font-display text-4xl lg:text-6xl font-black tracking-tighter leading-[0.95]">{title}</h1>
                            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-zinc-300">
                                {movie.year && <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-zinc-500" />{movie.year}</span>}
                                {movie.duration && <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-zinc-500" />{movie.duration}</span>}
                                {movie.rating && <span className="flex items-center gap-1.5 text-amber-400 font-bold"><Star className="w-3.5 h-3.5 fill-amber-400" />{movie.rating}</span>}
                                {movie.genre && <span className="text-zinc-400">{movie.genre}</span>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 lg:px-12 max-w-7xl mx-auto -mt-4 relative z-10 pb-16">
                <div className="flex flex-wrap gap-3 mb-8">
                    <Link to={`/watch/vod/${id}`} className="inline-flex items-center gap-2 px-7 py-3 rounded-md bg-[#E50914] hover:bg-[#F40612] font-semibold transition shadow-xl shadow-red-900/30" data-testid="movie-play-btn">
                        <Play className="w-5 h-5 fill-white" /> Play
                    </Link>
                    <button onClick={toggleFav} className={`inline-flex items-center gap-2 px-5 py-3 rounded-md border font-semibold transition ${isFav ? "bg-[#E50914]/20 border-[#E50914] text-white" : "bg-white/5 border-white/10 hover:bg-white/10 text-zinc-200"}`} data-testid="movie-favorite-btn">
                        <Heart className={`w-5 h-5 ${isFav ? "fill-[#E50914] text-[#E50914]" : ""}`} />
                        {isFav ? "Favorited" : "Favorite"}
                    </button>
                    {movie.trailer_url && (
                        <Link to={`/watch/vod/${id}`} className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 font-semibold transition" data-testid="movie-trailer-btn">
                            <Film className="w-5 h-5" /> Trailer
                        </Link>
                    )}
                </div>

                <div className="grid lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <h2 className="text-xs tracking-[0.3em] uppercase font-bold text-zinc-500 mb-3">Synopsis</h2>
                        <p className="text-base lg:text-lg text-zinc-300 leading-relaxed">
                            {movie.plot || movie.info?.plot || movie.description || "No description available for this title."}
                        </p>
                    </div>
                    <div className="space-y-4">
                        {movie.director && (
                            <Meta label="Director" value={movie.director} />
                        )}
                        {(movie.cast || movie.actors) && (
                            <Meta label="Cast" value={movie.cast || movie.actors} icon={<Users className="w-3.5 h-3.5" />} />
                        )}
                        {movie.genre && <Meta label="Genre" value={movie.genre} />}
                        {(movie.releasedate || movie.year) && <Meta label="Released" value={movie.releasedate || movie.year} />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function Meta({ label, value, icon }) {
    return (
        <div className="p-4 rounded-md bg-[#121212] border border-white/5">
            <div className="text-[10px] tracking-[0.3em] uppercase font-bold text-zinc-500 mb-1 flex items-center gap-1.5">
                {icon} {label}
            </div>
            <div className="text-sm text-zinc-200 leading-snug">{value}</div>
        </div>
    );
}
