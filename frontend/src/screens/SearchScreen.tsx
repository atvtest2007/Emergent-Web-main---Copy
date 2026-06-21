import { useState, useEffect } from 'react';
import { Search, X, Star, TrendingUp, Clock, Loader2, Tv, Film, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Content } from '@/lib/api';
import BottomNav from '../components/BottomNav';

export default function SearchScreen() {
    const nav = useNavigate();
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
        }, 400);
        return () => clearTimeout(t);
    }, [q]);

    const totalResults = results.live.length + results.movies.length + results.series.length;
    const hasQuery = q.trim().length > 0;

    return (
        <div className="absolute inset-0 flex flex-col" style={{ background: '#030608' }}>
            {/* Header */}
            <div className="flex-shrink-0 pt-14 px-5 pb-3" style={{ background: 'linear-gradient(180deg, #141414 0%, #030608 100%)' }}>
                <h1 className="text-xl font-black mb-4" style={{ color: '#f8fafc' }}>Search</h1>

                {/* Search bar */}
                <div
                    className="flex items-center gap-3 px-4 rounded-2xl mb-4"
                    style={{ background: '#1A1A1A', border: '1.5px solid rgba(229,9,20,0.45)', height: 52 }}
                >
                    <Search size={18} style={{ color: 'var(--brand-primary)', flexShrink: 0 }} />
                    <input
                        autoFocus
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search movies, series, channels..."
                        className="flex-1 text-sm bg-transparent border-none outline-none text-white placeholder-zinc-500"
                    />
                    {q && (
                        <button onClick={() => setQ('')} className="flex items-center justify-center rounded-full flex-shrink-0" style={{ width: 22, height: 22, background: '#2A2A2A' }}>
                            <X size={12} style={{ color: '#64748b' }} />
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-20 px-5" style={{ scrollbarWidth: 'none' }}>
                {!hasQuery ? (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-500 pb-10">
                        <Search className="w-12 h-12 mb-4 opacity-20" />
                        <p>Search for your favorite content</p>
                    </div>
                ) : loading ? (
                    <div className="flex items-center justify-center pt-10">
                        <Loader2 className="w-8 h-8 animate-spin text-brand" />
                    </div>
                ) : totalResults === 0 ? (
                    <div className="text-center pt-10 text-zinc-400">No results found for "{q}"</div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mt-3 mb-4">
                            <span className="text-sm font-semibold" style={{ color: '#94a3b8' }}>
                                {totalResults} results for "<span style={{ color: '#f1f5f9' }}>{q}</span>"
                            </span>
                        </div>

                        {results.live.length > 0 && (
                            <div className="mb-5">
                                <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#475569' }}>
                                    <Tv className="w-3.5 h-3.5" /> Channels
                                </p>
                                <div className="flex flex-col gap-2">
                                    {results.live.slice(0, 10).map((ch: any) => (
                                        <button key={ch.stream_id} onClick={() => nav(`/watch/live/${ch.stream_id}`)}
                                            className="flex items-center gap-3 p-3 rounded-xl w-full text-left"
                                            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                                            <div className="rounded-xl overflow-hidden flex-shrink-0 bg-black/50" style={{ width: 44, height: 44 }}>
                                                {ch.stream_icon ? <img src={ch.stream_icon} alt={ch.name} className="w-full h-full object-contain" /> : <Tv className="w-full h-full p-2 text-zinc-700" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{ch.name}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#ef4444', boxShadow: '0 0 5px rgba(239,68,68,0.7)' }} />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.movies.length > 0 && (
                            <div className="mb-5">
                                <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#475569' }}>
                                    <Film className="w-3.5 h-3.5" /> Movies
                                </p>
                                <div className="flex flex-col gap-2">
                                    {results.movies.slice(0, 10).map((m: any) => (
                                        <button key={m.stream_id} onClick={() => nav(`/movie/${m.stream_id}`)}
                                            className="flex items-center gap-3 p-3 rounded-xl w-full text-left"
                                            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                                            <div className="rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900" style={{ width: 44, height: 66 }}>
                                                {m.stream_icon ? <img src={m.stream_icon} alt={m.name} className="w-full h-full object-cover" /> : <Film className="w-full h-full p-3 text-zinc-700" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{m.name}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {m.rating && (
                                                        <>
                                                            <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                                                            <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>{m.rating}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {results.series.length > 0 && (
                            <div className="mb-5">
                                <p className="text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: '#475569' }}>
                                    <PlayCircle className="w-3.5 h-3.5" /> Series
                                </p>
                                <div className="flex flex-col gap-2">
                                    {results.series.slice(0, 10).map((s: any) => (
                                        <button key={s.series_id} onClick={() => nav(`/series/${s.series_id}`)}
                                            className="flex items-center gap-3 p-3 rounded-xl w-full text-left"
                                            style={{ background: '#1A1A1A', border: '1px solid #2A2A2A' }}>
                                            <div className="rounded-xl overflow-hidden flex-shrink-0 bg-zinc-900" style={{ width: 44, height: 66 }}>
                                                {s.cover ? <img src={s.cover} alt={s.name} className="w-full h-full object-cover" /> : <PlayCircle className="w-full h-full p-3 text-zinc-700" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{s.name}</p>
                                                <div className="flex items-center gap-1 mt-1">
                                                    {s.rating && (
                                                        <>
                                                            <Star size={11} fill="#f59e0b" style={{ color: '#f59e0b' }} />
                                                            <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>{s.rating}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <BottomNav active="search" />
        </div>
    );
}
