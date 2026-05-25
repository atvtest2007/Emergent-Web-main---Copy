import React from "react";
import { Link } from "react-router-dom";
import { Play, Info, Plus } from "lucide-react";

export default function HeroBanner({ item }) {
    if (!item) return null;
    const title = item.name || item.title;
    const backdrop = item.backdrop || item.backdrop_path || item.stream_icon;
    const id = item.stream_id || item.series_id;
    const type = item.seasons ? "series" : "movie";
    const linkTo = type === "series" ? `/series/${id}` : `/movie/${id}`;

    return (
        <section className="relative w-full h-[78vh] min-h-[520px] overflow-hidden" data-testid="hero-banner">
            <img
                src={backdrop}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
                onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1614846384571-1e31a4d0a544?w=1600&h=900&fit=crop";
                }}
            />
            <div className="absolute inset-0 hero-mask" />
            <div className="absolute inset-x-0 bottom-0 h-32 hero-mask-v" />

            <div className="relative h-full max-w-7xl mx-auto px-6 lg:px-12 flex items-end pb-20">
                <div className="max-w-2xl animate-fade-up">
                    <div className="text-xs tracking-[0.32em] uppercase font-bold text-[#E50914] mb-3">
                        {type === "series" ? "Featured Series" : "Featured Movie"}
                    </div>
                    <h1 className="font-display text-5xl lg:text-7xl font-black tracking-tighter leading-[0.95] mb-5">
                        {title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 mb-5 text-sm text-zinc-300">
                        {item.year && <span className="px-2 py-0.5 bg-white/10 rounded-sm text-xs font-semibold">{item.year}</span>}
                        {item.rating && <span className="text-amber-400 font-bold">★ {item.rating}</span>}
                        {item.duration && <span>{item.duration}</span>}
                        {item.genre && <span className="text-zinc-400">· {item.genre}</span>}
                    </div>
                    {item.plot && (
                        <p className="text-base text-zinc-300 leading-relaxed mb-7 line-clamp-3">{item.plot}</p>
                    )}
                    <div className="flex gap-3">
                        <Link
                            to={linkTo}
                            data-testid="hero-play-btn"
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-md bg-[#E50914] hover:bg-[#F40612] text-white font-semibold transition-all shadow-lg shadow-red-900/40"
                        >
                            <Play className="w-5 h-5 fill-white" />
                            Play Now
                        </Link>
                        <Link
                            to={linkTo}
                            data-testid="hero-more-info-btn"
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-md bg-white/10 hover:bg-white/20 backdrop-blur-md text-white font-semibold transition border border-white/10"
                        >
                            <Info className="w-5 h-5" />
                            More Info
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
