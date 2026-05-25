import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Content, Account, Playlists, Progress } from "@/lib/api";
import HeroBanner from "@/components/HeroBanner";
import ContentRail from "@/components/ContentRail";
import PosterCard from "@/components/PosterCard";
import ChannelCard from "@/components/ChannelCard";
import { Loader2, Tv, Film, Clapperboard, Sparkles, Activity } from "lucide-react";

export default function Home() {
    const nav = useNavigate();
    const [loading, setLoading] = useState(true);
    const [account, setAccount] = useState(null);
    const [activePlaylist, setActivePlaylist] = useState(null);
    const [live, setLive] = useState([]);
    const [movies, setMovies] = useState([]);
    const [series, setSeries] = useState([]);
    const [cont, setCont] = useState([]);

    useEffect(() => {
        (async () => {
            try {
                const pl = await Playlists.active();
                if (!pl) { nav("/"); return; }
                setActivePlaylist(pl);

                const [acc, l, v, s, c] = await Promise.all([
                    Account.info().catch(() => null),
                    Content.streams("live").catch(() => []),
                    Content.streams("vod").catch(() => []),
                    Content.streams("series").catch(() => []),
                    Progress.continueWatching().catch(() => []),
                ]);
                setAccount(acc);
                setLive(l || []);
                setMovies(v || []);
                setSeries(s || []);
                setCont(c || []);
            } finally {
                setLoading(false);
            }
        })();
    }, [nav]);

    const featured = useMemo(() => {
        if (movies.length === 0 && series.length === 0) return null;
        const pool = [...movies.slice(0, 5), ...series.slice(0, 3)];
        return pool[Math.floor(Math.random() * pool.length)];
    }, [movies, series]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[#E50914]" />
            </div>
        );
    }

    return (
        <div data-testid="home-page">
            {featured && <HeroBanner item={featured} />}

            {/* Account status strip */}
            {account && (
                <section className="px-6 lg:px-12 -mt-6 relative z-10">
                    <div className="glass-strong rounded-md border border-white/10 p-4 flex flex-wrap items-center gap-6" data-testid="account-strip">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-md bg-[#E50914]/15 flex items-center justify-center">
                                <Activity className="w-5 h-5 text-[#E50914]" />
                            </div>
                            <div>
                                <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold">Account</div>
                                <div className="text-sm font-semibold">{activePlaylist?.name}</div>
                            </div>
                        </div>
                        <div className="text-sm">
                            <span className="text-zinc-500 text-xs uppercase tracking-wider mr-2">Status</span>
                            <span className="text-emerald-400 font-semibold">{account?.user_info?.status || account?.status || "Active"}</span>
                        </div>
                        {(account?.user_info?.exp_date || account?.exp_date) && (
                            <div className="text-sm">
                                <span className="text-zinc-500 text-xs uppercase tracking-wider mr-2">Expires</span>
                                <span className="font-semibold">{account?.user_info?.exp_date || account?.exp_date}</span>
                            </div>
                        )}
                        {(account?.user_info?.active_cons !== undefined || account?.active_cons !== undefined) && (
                            <div className="text-sm">
                                <span className="text-zinc-500 text-xs uppercase tracking-wider mr-2">Connections</span>
                                <span className="font-semibold">{account?.user_info?.active_cons || account?.active_cons || 0} / {account?.user_info?.max_connections || account?.max_connections || "—"}</span>
                            </div>
                        )}
                        <div className="ml-auto flex items-center gap-2">
                            {[
                                { to: "/live", label: "Live", icon: Tv },
                                { to: "/movies", label: "Movies", icon: Film },
                                { to: "/series", label: "Series", icon: Clapperboard },
                            ].map((q) => {
                                const I = q.icon;
                                return (
                                    <Link key={q.to} to={q.to} className="px-3 py-1.5 rounded-md bg-white/5 hover:bg-white/10 text-xs font-semibold inline-flex items-center gap-1.5 transition">
                                        <I className="w-3.5 h-3.5" />
                                        {q.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                </section>
            )}

            {cont.length > 0 && (
                <ContentRail title="Continue Watching" subtitle="Pick up where you left off" testId="rail-continue">
                    {cont.map((c) => (
                        <PosterCard
                            key={c.content_id}
                            item={c.content_data || { name: c.content_id, stream_id: c.content_id }}
                            type={c.content_type === "series" || c.content_type === "episode" ? "series" : "movie"}
                            progress={c.progress}
                        />
                    ))}
                </ContentRail>
            )}

            {movies.length > 0 && (
                <ContentRail title="Trending Movies" subtitle="Hand-picked for you" testId="rail-movies">
                    {movies.slice(0, 20).map((m) => (
                        <PosterCard key={m.stream_id} item={m} type="movie" />
                    ))}
                </ContentRail>
            )}

            {series.length > 0 && (
                <ContentRail title="Featured Series" subtitle="Premium binge worthy" testId="rail-series">
                    {series.slice(0, 20).map((s) => (
                        <PosterCard key={s.series_id} item={s} type="series" />
                    ))}
                </ContentRail>
            )}

            {live.length > 0 && (
                <section className="px-6 lg:px-12 mt-12 pb-12" data-testid="rail-live">
                    <div className="flex items-end justify-between mb-4">
                        <div>
                            <h2 className="font-display text-3xl font-bold tracking-tight">Now Live</h2>
                            <p className="text-xs text-zinc-500 mt-1 tracking-[0.2em] uppercase font-bold">Watch and switch instantly</p>
                        </div>
                        <Link to="/live" className="text-xs text-zinc-400 hover:text-white tracking-wider uppercase font-bold">
                            View all →
                        </Link>
                    </div>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {live.slice(0, 6).map((c) => <ChannelCard key={c.stream_id} channel={c} />)}
                    </div>
                </section>
            )}

            {live.length === 0 && movies.length === 0 && series.length === 0 && (
                <div className="px-6 lg:px-12 py-20 text-center">
                    <Sparkles className="w-10 h-10 text-[#E50914] mx-auto mb-3" />
                    <h2 className="font-display text-3xl font-bold mb-2">No content yet</h2>
                    <p className="text-zinc-400">Your playlist returned no streams. Try a different account or load the demo library.</p>
                </div>
            )}
        </div>
    );
}
