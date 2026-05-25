import React, { useEffect, useState, useMemo } from "react";
import { Content } from "@/lib/api";
import ChannelCard from "@/components/ChannelCard";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

export default function LiveTV() {
    const [loading, setLoading] = useState(true);
    const [channels, setChannels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cat, setCat] = useState("all");
    const [q, setQ] = useState("");

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [c, all] = await Promise.all([
                    Content.categories("live").catch(() => []),
                    Content.streams("live").catch(() => []),
                ]);
                setCategories(c || []);
                setChannels(all || []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        let list = channels;
        if (cat !== "all") list = list.filter((c) => c.category_id === cat);
        if (q.trim()) {
            const ql = q.toLowerCase();
            list = list.filter((c) => (c.name || "").toLowerCase().includes(ql));
        }
        return list;
    }, [channels, cat, q]);

    return (
        <div className="px-6 lg:px-12 py-8 pt-12" data-testid="live-tv-page">
            <div className="mb-8">
                <div className="text-xs tracking-[0.32em] uppercase font-bold text-[#E50914] mb-2">Channels</div>
                <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter">Live TV</h1>
                <p className="text-zinc-400 mt-2 max-w-xl">All your channels in one place. Switch instantly, see what's on, jump to EPG.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6 sticky top-0 py-3 z-20 bg-[#050505]/80 backdrop-blur-md">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search channels..."
                        className="pl-9 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-[#E50914]"
                        data-testid="live-search"
                    />
                </div>
                <div className="flex flex-wrap gap-2 overflow-x-auto rail-scroll">
                    <button
                        onClick={() => setCat("all")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase whitespace-nowrap transition ${cat === "all" ? "bg-[#E50914] text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}
                        data-testid="cat-all"
                    >
                        All ({channels.length})
                    </button>
                    {categories.map((c) => {
                        const count = channels.filter((ch) => ch.category_id === c.category_id).length;
                        return (
                            <button
                                key={c.category_id}
                                onClick={() => setCat(c.category_id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase whitespace-nowrap transition ${cat === c.category_id ? "bg-[#E50914] text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}
                                data-testid={`cat-${c.category_id}`}
                            >
                                {c.category_name} ({count})
                            </button>
                        );
                    })}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-10 h-10 animate-spin text-[#E50914]" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">No channels match your filters.</div>
            ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filtered.map((c) => <ChannelCard key={c.stream_id} channel={c} />)}
                </div>
            )}
        </div>
    );
}
