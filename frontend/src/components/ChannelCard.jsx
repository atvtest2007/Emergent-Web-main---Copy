import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Play, Radio, Lock } from "lucide-react";

export default function ChannelCard({ channel, isLocked, onUnlock }) {
    const nav = useNavigate();
    const id = channel.stream_id;

    const handleClick = (e) => {
        if (isLocked) {
            e.preventDefault();
            if (onUnlock) onUnlock(() => nav(`/watch/live/${id}`));
        }
    };
    return (
        <Link
            to={`/watch/live/${id}`}
            onClick={handleClick}
            className="channel-card group relative block rounded-md overflow-hidden bg-[#121212] p-4"
            data-testid={`channel-card-${id}`}
        >
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-md bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {channel.stream_icon ? (
                        <img
                            src={channel.stream_icon}
                            alt={channel.name}
                            className="w-full h-full object-contain p-2"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <Radio className="w-7 h-7 text-zinc-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="live-dot" />
                        <span className="text-[10px] tracking-[0.2em] uppercase font-bold text-[#E50914]">Live</span>
                    </div>
                    <div className="font-semibold text-zinc-100 line-clamp-1 mt-1">{channel.name}</div>
                    {channel.now_playing && (
                        <div className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{channel.now_playing}</div>
                    )}
                </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-[#E50914] flex items-center justify-center shadow-lg shadow-red-900/40">
                        {isLocked ? <Lock className="w-4 h-4 text-white" /> : <Play className="w-5 h-5 fill-white text-white ml-0.5" />}
                    </div>
                </div>
            </div>
        </Link>
    );
}
