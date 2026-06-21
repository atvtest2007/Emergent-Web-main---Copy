import React, { useEffect, useMemo, useState } from "react";
import { Content } from "@/lib/api";
import PosterCard from "@/components/PosterCard";
import Pagination from "@/components/Pagination";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Clapperboard } from "lucide-react";

export default function Series() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [cats, setCats] = useState([]);
    const [cat, setCat] = useState("all");
    const [q, setQ] = useState("");
    const [page, setPage] = useState(1);
    const limit = 60;

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [c, all] = await Promise.all([
                    Content.categories("series").catch(() => []),
                    Content.streams("series").catch(() => []),
                ]);
                setCats(c || []);
                setItems(all || []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const filtered = useMemo(() => {
        let list = items;
        if (cat !== "all") list = list.filter((it) => it.category_id === cat);
        if (q.trim()) {
            const ql = q.toLowerCase();
            list = list.filter((it) => ((it.name || it.title) || "").toLowerCase().includes(ql));
        }
        return list;
    }, [items, cat, q]);

    useEffect(() => {
        setPage(1);
    }, [cat, q]);

    const totalPages = Math.ceil(filtered.length / limit);
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return (
        <div className="px-6 md:px-12 2xl:px-24 4xl:px-32 5xl:px-48 uw:px-64 py-8 pt-12 4xl:py-16 4xl:pt-20" data-testid="series-catalog-page">
            <div className="mb-8">
                <div className="text-xs tracking-[0.32em] uppercase font-bold text-brand mb-2 flex items-center gap-2">
                    <Clapperboard className="w-3.5 h-3.5" /> Episodes & Seasons
                </div>
                <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter">Series</h1>
                <p className="text-zinc-400 mt-2 max-w-xl">Discover binge-worthy stories.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6 sticky top-0 py-3 z-20 bg-[#050505]/80 backdrop-blur-md">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search series..." className="pl-9 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-brand" data-testid="series-search" />
                </div>
                <div className="flex flex-wrap gap-2 overflow-x-auto rail-scroll">
                    <button onClick={() => setCat("all")} className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase whitespace-nowrap transition ${cat === "all" ? "bg-brand text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`} data-testid="series-cat-all">
                        All Categories ({items.length})
                    </button>
                    {cats.map((c) => (
                        <button key={c.category_id} onClick={() => setCat(c.category_id)} className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase whitespace-nowrap transition ${cat === c.category_id ? "bg-brand text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}>
                            {c.category_name}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">No series found.</div>
            ) : (
                <>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] 3xl:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] 4xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] 5xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] uw:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-4 4xl:gap-6">
                        {paginated.map((it, idx) => <PosterCard key={`${it.series_id || it.stream_id}-${idx}`} item={it} type="series" isGrid={true} />)}
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
