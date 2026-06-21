import React, { useEffect, useState, useMemo } from "react";
import { Content } from "@/lib/api";
import ChannelCard from "@/components/ChannelCard";
import Pagination from "@/components/Pagination";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

export default function LiveTV() {
    const [loading, setLoading] = useState(true);
    const [channels, setChannels] = useState([]);
    const [categories, setCategories] = useState([]);
    const [cat, setCat] = useState("all");
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const limit = 60;

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

    useEffect(() => {
        setPage(1);
    }, [cat, q]);

    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return (
        <div className="px-6 md:px-12 2xl:px-24 4xl:px-32 5xl:px-48 uw:px-64 py-8 pt-12 4xl:py-16 4xl:pt-20" data-testid="live-tv-page">
            <div className="mb-8">
                <div className="text-xs tracking-[0.32em] uppercase font-bold text-brand mb-2">Channels</div>
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
                        className="pl-9 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-brand"
                        data-testid="live-search"
                    />
                </div>
                <div className="flex flex-wrap gap-2 overflow-x-auto rail-scroll">
                    <button
                        onClick={() => setCat("all")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase whitespace-nowrap transition ${cat === "all" ? "bg-brand text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}
                        data-testid="cat-all"
                    >
                        All Categories ({channels.length})
                    </button>
                    {categories.map((c) => {
                        const count = channels.filter((ch) => ch.category_id === c.category_id).length;
                        return (
                            <button
                                key={c.category_id}
                                onClick={() => setCat(c.category_id)}
                                className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase whitespace-nowrap transition ${cat === c.category_id ? "bg-brand text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}
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
                    <Loader2 className="w-10 h-10 animate-spin text-brand" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">No channels match your filters.</div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] 3xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] 4xl:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] 5xl:grid-cols-[repeat(auto-fill,minmax(500px,1fr))] gap-4 4xl:gap-6">
                        {paginated.map((c, idx) => <ChannelCard key={`${c.stream_id}-${idx}`} channel={c} />)}
                    </div>
                    {totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={(p) => {
                                setPage(p);
                                window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
}
