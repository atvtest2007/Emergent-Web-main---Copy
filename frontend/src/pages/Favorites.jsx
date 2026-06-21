import React, { useEffect, useState } from "react";
import { Favorites } from "@/lib/api";
import PosterCard from "@/components/PosterCard";
import ChannelCard from "@/components/ChannelCard";
import { Loader2, Heart } from "lucide-react";

export default function FavoritesPage() {
    const [loading, setLoading] = useState(true);
    const [items, setItems] = useState([]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const list = await Favorites.list();
                setItems(list || []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const live = items.filter((i) => i.content_type === "live");
    const movies = items.filter((i) => i.content_type === "movie" || i.content_type === "vod");
    const series = items.filter((i) => i.content_type === "series");

    return (
        <div className="px-6 md:px-12 2xl:px-24 4xl:px-32 5xl:px-48 uw:px-64 py-8 pt-12 4xl:py-16 4xl:pt-20" data-testid="favorites-page">
            <div className="mb-8">
                <div className="text-xs tracking-[0.32em] uppercase font-bold text-brand mb-2 flex items-center gap-2">
                    <Heart className="w-3.5 h-3.5" /> Saved
                </div>
                <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter">Favorites</h1>
                <p className="text-zinc-400 mt-2">Your curated collection of must-watch titles.</p>
            </div>
            {loading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>
            ) : items.length === 0 ? (
                <div className="text-center py-20">
                    <Heart className="w-12 h-12 text-zinc-700 mx-auto mb-3" />
                    <p className="text-zinc-400">No favorites yet. Heart anything to save it here.</p>
                </div>
            ) : (
                <>
                    {movies.length > 0 && (
                        <section className="mb-10">
                            <h2 className="font-display text-2xl font-bold mb-4">Movies</h2>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] 3xl:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] 4xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] 5xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] uw:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-4 4xl:gap-6">
                                {movies.map((m) => <PosterCard key={m.id} item={{ ...m.content_data, stream_id: m.content_id }} type="movie" isGrid={true} />)}
                            </div>
                        </section>
                    )}
                    {series.length > 0 && (
                        <section className="mb-10">
                            <h2 className="font-display text-2xl font-bold mb-4">Series</h2>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] 3xl:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] 4xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] 5xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] uw:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-4 4xl:gap-6">
                                {series.map((s) => <PosterCard key={s.id} item={{ ...s.content_data, series_id: s.content_id }} type="series" isGrid={true} />)}
                            </div>
                        </section>
                    )}
                    {live.length > 0 && (
                        <section className="mb-10">
                            <h2 className="font-display text-2xl font-bold mb-4">Live Channels</h2>
                            <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] 3xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] 4xl:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] 5xl:grid-cols-[repeat(auto-fill,minmax(500px,1fr))] gap-4 4xl:gap-6">
                                {live.map((c) => <ChannelCard key={c.id} channel={{ ...c.content_data, stream_id: c.content_id }} />)}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
}
