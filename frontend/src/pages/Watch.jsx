/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Content, Progress, Settings, Favorites } from "@/lib/api";
import VideoPlayer from "@/components/VideoPlayer";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function Watch() {
    const { type, id } = useParams();
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [src, setSrc] = useState(null);
    const location = useLocation();
    const initialMeta = location.state?.meta || { title: "", poster: "" };
    const [meta, setMeta] = useState(initialMeta);
    const [initialPos, setInitialPos] = useState(0);
    const [showResumePrompt, setShowResumePrompt] = useState(false);
    const [bufferSize, setBufferSize] = useState(30);
    const [isFav, setIsFav] = useState(false);
    const lastSaveRef = useRef(0);

    const isLive = type === "live";
    const apiType =
        type === "vod" ? "vod" :
        type === "movie" ? "vod" :
        type === "live" ? "live" :
        type === "episode" ? "episode" : type;

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [r, settings, favs] = await Promise.all([
                    Content.streamUrl(apiType, id).catch(() => null),
                    Settings.get().catch(() => null),
                    Favorites.list().catch(() => [])
                ]);
                setSrc(r?.url);
                if (settings?.buffer_size) {
                    setBufferSize(settings.buffer_size);
                }
                
                const favType = type === "movie" ? "vod" : type;
                setIsFav((favs || []).some(f => f.content_id === id && (f.content_type === type || f.content_type === favType)));

                // Try to load richer metadata
                if (type === "movie" || type === "vod") {
                    try {
                        const m = await Content.movie(id);
                        setMeta({ 
                            title: m.name || m.title || m.info?.name || initialMeta.title || "Movie", 
                            poster: m.stream_icon || m.info?.movie_image || m.info?.cover || m.backdrop || initialMeta.poster 
                        });
                    } catch { setMeta(prev => ({ ...prev, title: prev.title || "Movie" })); }
                } else if (type === "live") {
                    try {
                        const list = await Content.streams("live");
                        const c = (list || []).find((x) => x.stream_id === id);
                        if (c) setMeta({ title: c.name, poster: c.stream_icon });
                    } catch { /* ignore */ }
                } else if (type === "episode") {
                    if (!meta.title) setMeta({ title: "Episode", poster: "" });
                }

                // Load previous position (non-live only)
                if (!isLive) {
                    try {
                        const all = await Progress.list();
                        const found = (all || []).find((p) => p.content_id === id);
                        if (found?.position && found.progress < 0.95 && found.position > 5) {
                            setInitialPos(found.position);
                            setShowResumePrompt(true);
                        }
                    } catch { /* ignore */ }
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [type, id, apiType, isLive]);

    const toggleFav = async () => {
        const favType = type === "movie" ? "vod" : type;
        if (isFav) {
            await Favorites.remove(favType, id).catch(() => {});
            setIsFav(false);
            toast.info("Removed from favorites");
        } else {
            await Favorites.add({
                content_type: favType,
                content_id: id,
                content_data: {
                    name: meta.title,
                    title: meta.title,
                    stream_icon: meta.poster,
                    poster: meta.poster
                },
            }).catch(() => {});
            setIsFav(true);
            toast.success("Added to favorites");
        }
    };

    const onProgress = (pos, dur) => {
        if (isLive || !dur || !Number.isFinite(dur)) return;
        const now = Date.now();
        if (now - lastSaveRef.current < 5000) return;
        lastSaveRef.current = now;
        Progress.upsert({
            content_type: type === "movie" ? "movie" : type,
            content_id: id,
            position: pos,
            duration: dur,
            content_data: meta,
        }).catch(() => {});
    };

    if (loading) {
        return (
            <div className="h-full min-h-[80vh] bg-black flex flex-col items-center justify-center relative">
                <button onClick={() => nav(-1)} className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m15 18-6-6 6-6"/></svg></button>
                <Loader2 className="w-10 h-10 animate-spin text-brand mb-4" />
                <div className="text-zinc-400 text-sm animate-pulse font-medium tracking-wide">Connecting to stream...</div>
            </div>
        );
    }

    if (!src) {
        return (
            <div className="h-full min-h-[80vh] bg-black flex flex-col items-center justify-center p-6 text-center relative">
                <button onClick={() => nav(-1)} className="absolute top-6 left-6 z-10 w-10 h-10 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="m15 18-6-6 6-6"/></svg></button>
                <div className="bg-[#121212] border border-white/10 rounded-xl p-8 max-w-sm w-full shadow-2xl">
                    <div className="text-2xl font-display font-bold mb-3 text-zinc-100 tracking-tight">Stream Unavailable</div>
                    <div className="text-sm text-zinc-400 mb-8 leading-relaxed">The requested stream could not be loaded. It may be offline, restricted, or invalid.</div>
                    <button
                        onClick={() => nav(-1)}
                        className="w-full py-3 rounded-md bg-brand hover:bg-[#F40612] text-white font-semibold flex items-center justify-center gap-2 transition shadow-xl shadow-red-900/20"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (showResumePrompt) {
        return (
            <div className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50 text-white animate-in fade-in duration-300" data-testid="resume-prompt">
                <div className="bg-[#121212] border border-white/10 rounded-xl p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
                    <h2 className="text-2xl font-display font-bold mb-3 tracking-tight">Resume Playback?</h2>
                    <p className="text-zinc-400 text-sm mb-8 leading-relaxed">
                        You have previously watched this {type === "episode" ? "episode" : "movie"}. Would you like to resume from where you left off?
                    </p>
                    <div className="space-y-3 w-full">
                        <button 
                            onClick={() => setShowResumePrompt(false)} 
                            className="w-full py-3 rounded-md bg-brand hover:bg-[#F40612] text-white font-semibold transition shadow-xl shadow-red-900/20"
                            autoFocus
                        >
                            Resume Watching
                        </button>
                        <button 
                            onClick={() => {
                                setInitialPos(0);
                                setShowResumePrompt(false);
                            }} 
                            className="w-full py-3 rounded-md bg-white/10 hover:bg-white/20 text-white font-semibold transition"
                        >
                            Start Over
                        </button>
                        <button 
                            onClick={() => nav(-1)} 
                            className="w-full py-3 rounded-md bg-transparent hover:bg-white/5 text-zinc-400 font-semibold transition"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black overflow-hidden flex flex-col" data-testid="watch-page">
            <div className="w-full h-full relative flex-1">
                <VideoPlayer
                    src={src}
                    title={meta.title}
                    poster={meta.poster}
                    isLive={isLive}
                    autoPlay
                    initialPosition={initialPos}
                    bufferSize={bufferSize}
                    onProgress={onProgress}
                    onClose={() => nav(-1)}
                    isFav={isFav}
                    onToggleFav={toggleFav}
                />
            </div>
        </div>
    );
}
