import React, { useEffect, useMemo, useState } from "react";
import { Content } from "@/lib/api";
import PosterCard from "@/components/PosterCard";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Library } from "lucide-react";

export default function VOD() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const all = await Content.streams("vod");
                setItems(all || []);
            } catch {
                setItems([]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        if (!q.trim()) return items;
        const ql = q.toLowerCase();
        return items.filter((it) => ((it.name || it.title) || "").toLowerCase().includes(ql));
    }, [items, q]);

    return (
        <div className="px-6 lg:px-12 py-8 pt-12" data-testid="vod-page">
            <div className="mb-8">
                <div className="text-xs tracking-[0.32em] uppercase font-bold text-[#E50914] mb-2 flex items-center gap-2">
                    <Library className="w-3.5 h-3.5" /> Video on Demand
                </div>
                <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter">VOD Library</h1>
                <p className="text-zinc-400 mt-2 max-w-xl">Stream anything on-demand from your catalog.</p>
            </div>
            <div className="mb-6 max-w-md relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search VOD..." className="pl-9 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-[#E50914]" data-testid="vod-search" />
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-[#E50914]" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">Nothing here yet.</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filtered.map((it) => <PosterCard key={it.stream_id} item={it} type="vod" />)}
                </div>
            )}
        </div>
    );
}
