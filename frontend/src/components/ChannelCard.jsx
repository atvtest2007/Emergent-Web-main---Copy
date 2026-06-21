import React from "react";
import { Link } from "react-router-dom";
import { Play, Radio } from "lucide-react";

export default function ChannelCard({ channel }) {
    const id = channel.stream_id;
    return (
        <Link
            to={`/watch/live/${id}`}
            className="channel-card group relative block rounded-md overflow-hidden bg-[#121212] p-4"
            data-testid={`channel-card-${id}`}
        >
            <div className="flex items-center gap-4 4xl:gap-6">
                <div className="w-16 h-16 4xl:w-24 4xl:h-24 rounded-md bg-black/40 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                    {channel.stream_icon ? (
                        <img
                            src={channel.stream_icon}
                            alt={channel.name}
                            className="w-full h-full object-contain p-2"
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <Radio className="w-7 h-7 4xl:w-10 4xl:h-10 text-zinc-500" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <div className="live-dot" />
                        <span className="text-[10px] 4xl:text-xs tracking-[0.2em] uppercase font-bold text-brand">Live</span>
                    </div>
                    <div className="font-semibold 4xl:text-xl text-zinc-100 line-clamp-1 mt-1">{channel.name}</div>
                    {channel.now_playing && (
                        <div className="text-xs 4xl:text-sm text-zinc-400 mt-0.5 line-clamp-1">{channel.now_playing}</div>
                    )}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 4xl:w-14 4xl:h-14 rounded-full bg-brand flex items-center justify-center shadow-lg shadow-red-900/40">
                        <Play className="w-5 h-5 4xl:w-7 4xl:h-7 fill-white text-white ml-0.5" />
                    </div>
                </div>
            </div>
        </Link>
    );
}
