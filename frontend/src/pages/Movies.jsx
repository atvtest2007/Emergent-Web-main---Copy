import React, { useEffect, useMemo, useState } from "react";
import { Content } from "@/lib/api";
import PosterCard from "@/components/PosterCard";
import { Input } from "@/components/ui/input";
import { Loader2, Search, Film } from "lucide-react";
import { useParentalControls } from "@/hooks/useParentalControls";

function Catalog({ type, title, subtitle, posterType }) {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);
    const [cats, setCats] = useState([]);
    const [cat, setCat] = useState("all");
    const [q, setQ] = useState("");
    const { isCategoryLocked, unlock, renderModal } = useParentalControls();

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [c, all] = await Promise.all([
                    Content.categories(type).catch(() => []),
                    Content.streams(type).catch(() => []),
                ]);
                setCats(c || []);
                setItems(all || []);
            } finally {
                setLoading(false);
            }
        })();
    }, [type]);

    const filtered = useMemo(() => {
        let list = items;
        if (cat !== "all") list = list.filter((it) => it.category_id === cat);
        if (q.trim()) {
            const ql = q.toLowerCase();
            list = list.filter((it) => ((it.name || it.title) || "").toLowerCase().includes(ql));
        }
        return list;
    }, [items, cat, q]);

    return (
        <div className="px-6 lg:px-12 py-8 pt-12" data-testid={`${type}-catalog-page`}>
            <div className="mb-8">
                <div className="text-xs tracking-[0.32em] uppercase font-bold text-[#E50914] mb-2 flex items-center gap-2">
                    <Film className="w-3.5 h-3.5" /> Catalog
                </div>
                <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter">{title}</h1>
                <p className="text-zinc-400 mt-2 max-w-xl">{subtitle}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 mb-6 sticky top-0 py-3 z-20 bg-[#050505]/80 backdrop-blur-md">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search title..."
                        className="pl-9 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-[#E50914]"
                        data-testid={`${type}-search`}
                    />
                </div>
                <div className="flex flex-wrap gap-2 overflow-x-auto rail-scroll">
                    <button
                        onClick={() => setCat("all")}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase whitespace-nowrap transition ${cat === "all" ? "bg-[#E50914] text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}
                        data-testid={`${type}-cat-all`}
                    >
                        All ({items.length})
                    </button>
                    {cats.map((c) => (
                        <button
                            key={c.category_id}
                            onClick={() => setCat(c.category_id)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold tracking-wider uppercase whitespace-nowrap transition ${cat === c.category_id ? "bg-[#E50914] text-white" : "bg-white/5 text-zinc-300 hover:bg-white/10"}`}
                            data-testid={`${type}-cat-${c.category_id}`}
                        >
                            {c.category_name}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-24">
                    <Loader2 className="w-10 h-10 animate-spin text-[#E50914]" />
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-zinc-400">No titles match your filters.</div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {filtered.map((it) => (
                        <PosterCard
                            key={it.stream_id || it.series_id}
                            item={it}
                            type={posterType}
                            isLocked={isCategoryLocked(it.category_name)}
                            onUnlock={unlock}
                        />
                    ))}
                </div>
            )}
            {renderModal()}
        </div>
    );
}

export default function Movies() {
    return <Catalog type="vod" title="Movies" subtitle="Browse the complete film library." posterType="movie" />;
}
