import React, { useEffect, useState } from "react";
import { Content } from "@/lib/api";
import PosterCard from "@/components/PosterCard";
import ChannelCard from "@/components/ChannelCard";
import { Input } from "@/components/ui/input";
import { Search as SearchIcon, Loader2, Mic } from "lucide-react";
import { toast } from "sonner";

export default function SearchPage() {
    const [q, setQ] = useState("");
    const [results, setResults] = useState({ live: [], movies: [], series: [] });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!q.trim()) {
            setResults({ live: [], movies: [], series: [] });
            return;
        }
        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const r = await Content.search(q.trim());
                setResults(r || { live: [], movies: [], series: [] });
            } catch {
                setResults({ live: [], movies: [], series: [] });
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(t);
    }, [q]);

    const startVoice = () => {
        const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SR) {
            toast.info("Voice search unsupported in this browser");
            return;
        }
        const r = new SR();
        r.lang = "en-US";
        r.onresult = (e) => setQ(e.results[0][0].transcript);
        r.onerror = () => toast.error("Voice recognition failed");
        r.start();
    };

    const totalResults = results.live.length + results.movies.length + results.series.length;

    return (
        <div className="px-6 md:px-12 2xl:px-24 4xl:px-32 5xl:px-48 uw:px-64 py-8 pt-12 4xl:py-16 4xl:pt-20 h-full min-h-[80vh]" data-testid="search-page">
            <div className="mb-6">
                <div className="text-xs tracking-[0.32em] uppercase font-bold text-brand mb-2">Discover</div>
                <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter">Search</h1>
            </div>
            <div className="relative max-w-2xl mb-10">
                <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <Input
                    autoFocus
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search channels, movies, series..."
                    className="pl-12 pr-12 h-14 text-lg bg-[#0a0a0a] border-white/10 focus:border-brand text-zinc-100"
                    data-testid="search-input"
                />
                <button onClick={startVoice} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center" data-testid="voice-search-btn" title="Voice search">
                    <Mic className="w-4 h-4 text-zinc-300" />
                </button>
            </div>

            {loading && <Loader2 className="w-8 h-8 animate-spin text-brand" />}

            {!loading && q && totalResults === 0 && (
                <div className="text-zinc-400">No results for "{q}".</div>
            )}

            {results.movies.length > 0 && (
                <section className="mb-10">
                    <h2 className="font-display text-2xl font-bold mb-4">Movies <span className="text-zinc-500 text-base">({results.movies.length})</span></h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] 3xl:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] 4xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] 5xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] uw:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-4 4xl:gap-6">
                        {results.movies.map((m) => <PosterCard key={m.stream_id} item={m} type="movie" isGrid={true} />)}
                    </div>
                </section>
            )}
            {results.series.length > 0 && (
                <section className="mb-10">
                    <h2 className="font-display text-2xl font-bold mb-4">Series <span className="text-zinc-500 text-base">({results.series.length})</span></h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(140px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(160px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(200px,1fr))] 2xl:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] 3xl:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] 4xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] 5xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] uw:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] gap-4 4xl:gap-6">
                        {results.series.map((s) => <PosterCard key={s.series_id} item={s} type="series" isGrid={true} />)}
                    </div>
                </section>
            )}
            {results.live.length > 0 && (
                <section className="mb-10">
                    <h2 className="font-display text-2xl font-bold mb-4">Live Channels <span className="text-zinc-500 text-base">({results.live.length})</span></h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] 3xl:grid-cols-[repeat(auto-fill,minmax(360px,1fr))] 4xl:grid-cols-[repeat(auto-fill,minmax(420px,1fr))] 5xl:grid-cols-[repeat(auto-fill,minmax(500px,1fr))] gap-4 4xl:gap-6">
                        {results.live.map((c) => <ChannelCard key={c.stream_id} channel={c} />)}
                    </div>
                </section>
            )}
        </div>
    );
}
