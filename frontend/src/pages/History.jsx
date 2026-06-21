import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Progress } from "@/lib/api";
import { Loader2, History as HistoryIcon, Play, X } from "lucide-react";

export default function HistoryPage() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    const refresh = async () => {
        setLoading(true);
        try {
            const list = await Progress.list();
            setItems(list || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { refresh(); }, []);

    const remove = async (it) => {
        await Progress.remove(it.content_type, it.content_id);
        refresh();
    };

    return (
        <div className="px-6 md:px-12 2xl:px-24 4xl:px-32 5xl:px-48 uw:px-64 py-8 pt-12 4xl:py-16 4xl:pt-20" data-testid="history-page">
            <div className="mb-8">
                <div className="text-xs tracking-[0.32em] uppercase font-bold text-brand mb-2 flex items-center gap-2">
                    <HistoryIcon className="w-3.5 h-3.5" /> Recently Watched
                </div>
                <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter">Continue Watching</h1>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">Nothing in history yet.</div>
            ) : (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(250px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(380px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(440px,1fr))] 3xl:grid-cols-[repeat(auto-fill,minmax(500px,1fr))] 4xl:grid-cols-[repeat(auto-fill,minmax(600px,1fr))] gap-4 4xl:gap-6">
                    {items.map((it) => {
                        const d = it.content_data || {};
                        const watchTo = `/watch/${it.content_type}/${it.content_id}`;
                        return (
                            <div key={`${it.content_type}-${it.content_id}`} className="group relative rounded-md overflow-hidden bg-[#121212] border border-white/5 hover:border-brand/40 transition" data-testid={`history-${it.content_id}`}>
                                <Link to={watchTo} className="block">
                                    <div className="relative aspect-video bg-black overflow-hidden">
                                        <img src={d.stream_icon || d.cover || d.poster || "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=600&h=340&fit=crop"} alt={d.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                            <div className="w-14 h-14 rounded-full bg-brand flex items-center justify-center">
                                                <Play className="w-6 h-6 fill-white ml-0.5" />
                                            </div>
                                        </div>
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/15">
                                            <div className="h-full bg-brand" style={{ width: `${Math.min(100, (it.progress || 0) * 100)}%` }} />
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <div className="text-[10px] uppercase tracking-wider font-bold text-zinc-500">{it.content_type}</div>
                                        <div className="font-semibold mt-1 line-clamp-1">{d.name || d.title || it.content_id}</div>
                                        <div className="text-xs text-zinc-400 mt-1">{Math.round((it.progress || 0) * 100)}% watched</div>
                                    </div>
                                </Link>
                                <button onClick={() => remove(it)} className="absolute top-2 right-2 w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-brand/20" data-testid={`remove-history-${it.content_id}`}>
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
