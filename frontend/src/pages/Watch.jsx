import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Content, Progress } from "@/lib/api";
import VideoPlayer from "@/components/VideoPlayer";
import { Loader2 } from "lucide-react";

export default function Watch() {
    const { type, id } = useParams();
    const { search } = useLocation();
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [src, setSrc] = useState(null);
    const [meta, setMeta] = useState({ title: "", poster: "" });
    const [initialPos, setInitialPos] = useState(0);
    const lastSaveRef = useRef(0);

    const isLive = type === "live" || type === "catchup";
    const apiType =
        type === "vod" ? "vod" :
        type === "movie" ? "vod" :
        type === "live" ? "live" :
        type === "catchup" ? "catchup" :
        type === "episode" ? "episode" : type;

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const searchParams = new URLSearchParams(search);
                const startParam = searchParams.get("start");
                const durationParam = searchParams.get("duration");
                
                const r = await Content.streamUrl(apiType, id, null, startParam, durationParam);
                setSrc(r?.url);

                // Try to load richer metadata
                if (type === "movie" || type === "vod") {
                    try {
                        const m = await Content.movie(id);
                        setMeta({ title: m.name || m.title || "Movie", poster: m.backdrop || m.stream_icon });
                    } catch { setMeta({ title: "Movie", poster: "" }); }
                } else if (type === "live" || type === "catchup") {
                    try {
                        const list = await Content.streams("live");
                        const c = (list || []).find((x) => x.stream_id === id);
                        if (c) setMeta({ title: type === "catchup" ? `Catchup: ${c.name}` : c.name, poster: c.stream_icon });
                    } catch { /* ignore */ }
                } else if (type === "episode") {
                    setMeta({ title: "Episode", poster: "" });
                }

                // Load previous position (non-live only)
                if (!isLive) {
                    try {
                        const all = await Progress.list();
                        const found = (all || []).find((p) => p.content_id === id);
                        if (found?.position && found.progress < 0.95) {
                            setInitialPos(found.position);
                        }
                    } catch { /* ignore */ }
                }
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [type, id, apiType, isLive]);

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

    if (loading || !src) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#E50914]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black" data-testid="watch-page">
            <div className="h-screen">
                <VideoPlayer
                    src={src}
                    title={meta.title}
                    poster={meta.poster}
                    isLive={isLive}
                    autoPlay
                    initialPosition={initialPos}
                    onProgress={onProgress}
                    onClose={() => nav(-1)}
                />
            </div>
        </div>
    );
}
