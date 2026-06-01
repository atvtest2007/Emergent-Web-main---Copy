import React, { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Heart, Star, Lock } from "lucide-react";

export default function PosterCard({ item, type, progress, isLocked, onUnlock }) {
    const nav = useNavigate();
    const [hover, setHover] = useState(false);
    const cardRef = useRef(null);

    const title = item.name || item.title || "Untitled";
    const poster = item.stream_icon || item.cover || item.poster || "https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400&h=600&fit=crop";
    const id = item.stream_id || item.series_id || item.id;

    const linkTo =
        type === "movie" || type === "vod"
            ? `/movie/${id}`
            : type === "series"
            ? `/series/${id}`
            : `/watch/${type}/${id}`;

    const handleClick = (e) => {
        if (isLocked) {
            e.preventDefault();
            if (onUnlock) onUnlock(() => nav(linkTo));
        }
    };

    return (
        <Link
            to={linkTo}
            onClick={handleClick}
            ref={cardRef}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
            className="poster-card group relative block w-[160px] sm:w-[180px] shrink-0 rounded-md overflow-hidden"
            data-testid={`poster-${type}-${id}`}
        >
            <div className="aspect-[2/3] bg-zinc-900 relative overflow-hidden">
                <img
                    src={poster}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop";
                    }}
                />
                <div className={`absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent transition-opacity duration-300 ${hover ? "opacity-100" : "opacity-0"}`} />

                {/* Rating badge */}
                {item.rating && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-sm bg-black/70 backdrop-blur text-[10px] font-bold flex items-center gap-1 border border-white/10">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        <span>{item.rating}</span>
                    </div>
                )}

                {/* Year badge */}
                {item.year && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-sm bg-black/70 backdrop-blur text-[10px] font-semibold tracking-wider border border-white/10">
                        {item.year}
                    </div>
                )}

                {/* Play overlay */}
                <div className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${hover ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
                    <div className="w-14 h-14 rounded-full bg-[#E50914] flex items-center justify-center shadow-2xl shadow-red-900/60">
                        {isLocked ? <Lock className="w-6 h-6 text-white" /> : <Play className="w-7 h-7 text-white fill-white ml-0.5" />}
                    </div>
                </div>

                {/* Progress bar */}
                {progress !== undefined && progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
                        <div className="h-full bg-[#E50914]" style={{ width: `${Math.min(100, progress * 100)}%` }} />
                    </div>
                )}

                {/* Bottom info on hover */}
                <div className={`absolute bottom-0 left-0 right-0 p-3 transition-all duration-300 ${hover ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}>
                    <div className="text-sm font-semibold leading-tight line-clamp-2">{title}</div>
                    {item.genre && (
                        <div className="text-[10px] text-zinc-300/80 mt-1 line-clamp-1">{item.genre}</div>
                    )}
                </div>
            </div>
            <div className="mt-2 px-1">
                <div className="text-sm font-semibold text-zinc-100 line-clamp-1">{title}</div>
                {item.category_name && (
                    <div className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">{item.category_name}</div>
                )}
            </div>
        </Link>
    );
}
