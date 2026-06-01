import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { Content, Progress } from "@/lib/api";
import VideoPlayer from "@/components/VideoPlayer";

const NativeVideoPlayer = registerPlugin<any>("NativeVideoPlayer");
import { Loader2 } from "lucide-react";

export default function PlayerScreen() {
    const { type, id } = useParams();
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [src, setSrc] = useState<string | null>(null);
    const [meta, setMeta] = useState({ title: "", poster: "" });
    const [initialPos, setInitialPos] = useState(0);
    const lastSaveRef = useRef(0);

    const isLive = type === "live";
    const apiType =
        type === "vod" ? "vod" :
        type === "movie" ? "vod" :
        type === "live" ? "live" :
        type === "episode" ? "episode" : type;

    useEffect(() => {
        if (!type || !id) return;
        (async () => {
            setLoading(true);
            try {
                const r = await Content.streamUrl(apiType as any, id);
                setSrc(r?.url);

                if (type === "movie" || type === "vod") {
                    try {
                        const m = await Content.movie(id);
                        setMeta({ title: m?.info?.name || m?.name || m?.title || "Movie", poster: m?.info?.backdrop_path?.[0] || m?.info?.movie_image || m?.backdrop || m?.stream_icon });
                    } catch { setMeta({ title: "Movie", poster: "" }); }
                } else if (type === "live") {
                    try {
                        const list = await Content.streams("live");
                        const c = (list || []).find((x: any) => String(x.stream_id) === String(id));
                        if (c) setMeta({ title: c.name, poster: c.stream_icon });
                    } catch { /* ignore */ }
                } else if (type === "episode") {
                    setMeta({ title: "Episode", poster: "" });
                }

                if (!isLive) {
                    try {
                        const all = await Progress.list();
                        const found = (all || []).find((p: any) => p.content_id === id);
                        if (found?.position && found.progress < 0.95) {
                            setInitialPos(found.position);
                        }
                    } catch { /* ignore */ }
                }
            } finally {
                setLoading(false);
            }
        })();
    }, [type, id, apiType, isLive]);

    const onProgress = (pos: number, dur: number) => {
        if (isLive || !dur || !Number.isFinite(dur)) return;
        const now = Date.now();
        if (now - lastSaveRef.current < 5000) return;
        lastSaveRef.current = now;
        Progress.upsert({
            content_type: type === "movie" ? "movie" : (type as any),
            content_id: id as string,
            position: pos,
            duration: dur,
            content_data: meta,
        }).catch(() => {});
    };

    useEffect(() => {
        if (loading || !src || !Capacitor.isNativePlatform()) return;
        
        let active = true;
        (async () => {
            try {
                const res = await NativeVideoPlayer.play({
                    url: src,
                    title: meta.title || "Video",
                    initialPosition: initialPos
                });
                
                if (!active) return;
                
                if (res?.duration > 0 && !isLive) {
                    onProgress(res.position, res.duration);
                }
                
                nav(-1);
            } catch (err) {
                console.error("Native player error:", err);
                if (active) nav(-1);
            }
        })();

        return () => { active = false; };
    }, [src, isLive, loading, initialPos]); // Add loading and initialPos dependencies

    if (loading || !src || Capacitor.isNativePlatform()) {
        return (
            <div className="absolute inset-0 bg-[#030608] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#E50914]" />
            </div>
        );
    }

    return (
        <div className="absolute inset-0 bg-black overflow-hidden z-50">
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
    );
}
