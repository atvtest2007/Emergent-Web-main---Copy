import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Playlists } from "@/lib/api";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Tv, Loader2, Play, Trash2, Sparkles, KeyRound, Globe } from "lucide-react";

export default function Login() {
    const nav = useNavigate();
    const [saved, setSaved] = useState([]);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState("xtream");

    // xtream form
    const [server, setServer] = useState("");
    const [user, setUser] = useState("");
    const [pass, setPass] = useState("");
    const [plName, setPlName] = useState("");
    const [autoConnect, setAutoConnect] = useState(true);

    // m3u form
    const [m3uName, setM3uName] = useState("");
    const [m3uUrl, setM3uUrl] = useState("");
    const [m3uContent, setM3uContent] = useState("");

    const refreshList = async () => {
        try {
            const list = await Playlists.list();
            setSaved(list || []);
        } catch (e) {
            // ignore
        }
    };

    useEffect(() => {
        refreshList();
    }, []);

    const submitXtream = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const created = await Playlists.create({
                type: "xtream",
                name: plName || `${user}@${server}`,
                server_url: server.trim(),
                username: user.trim(),
                password: pass,
                auto_connect: autoConnect,
            });
            toast.success("Connected to Xtream server");
            await refreshList();
            nav("/home");
        } catch (err) {
            if (err.message === "Network Error") {
                toast.error("Cannot connect to backend server. Is it running?");
            } else {
                toast.error(err?.response?.data?.detail || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const submitM3U = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await Playlists.create({
                type: "m3u",
                name: m3uName || "My Playlist",
                m3u_url: m3uUrl || undefined,
                m3u_content: m3uContent || undefined,
            });
            toast.success("Playlist saved");
            await refreshList();
            nav("/home");
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Failed to save playlist");
        } finally {
            setLoading(false);
        }
    };

    const loadDemo = async () => {
        setLoading(true);
        try {
            await Playlists.demo();
            toast.success("Demo library loaded");
            nav("/home");
        } catch {
            toast.error("Failed to load demo");
        } finally {
            setLoading(false);
        }
    };

    const activate = async (id) => {
        await Playlists.activate(id);
        toast.success("Account switched");
        nav("/home");
    };

    const remove = async (id) => {
        await Playlists.remove(id);
        refreshList();
    };

    const onFile = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => setM3uContent(String(reader.result || ""));
        reader.readAsText(file);
    };

    return (
        <div className="min-h-screen relative overflow-hidden" data-testid="login-page">
            {/* Cinematic background */}
            <img
                src="https://images.unsplash.com/photo-1622730000579-e6bde344d6a4?w=2400&q=80"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-50"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#050505] via-[#050505]/85 to-[#050505]/40" />
            <div className="absolute inset-0 hero-mask" />

            <div className="relative z-10 min-h-screen flex flex-col">
                {/* Top brand */}
                <header className="px-6 lg:px-12 py-6 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-md bg-gradient-to-br from-[#E50914] to-[#7a040a] flex items-center justify-center shadow-xl shadow-red-900/40">
                            <span className="font-display font-black text-white text-xl">M</span>
                        </div>
                        <div>
                            <div className="font-display font-black text-2xl tracking-tight">MAXX<span className="text-[#E50914]">.</span></div>
                            <div className="text-[10px] tracking-[0.3em] uppercase text-zinc-400 font-bold">Premium OTT Player</div>
                        </div>
                    </div>
                    <button
                        onClick={loadDemo}
                        data-testid="demo-mode-btn"
                        className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-md glass border border-white/10 hover:border-[#E50914]/40 transition text-sm"
                    >
                        <Sparkles className="w-4 h-4 text-[#E50914]" />
                        Try Demo Library
                    </button>
                </header>

                <div className="flex-1 flex items-center px-6 lg:px-12 py-10">
                    <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center">
                        {/* Left — copy */}
                        <div className="animate-fade-up">
                            <div className="text-xs tracking-[0.32em] uppercase font-bold text-[#E50914] mb-4">
                                Cinema in your browser
                            </div>
                            <h1 className="font-display text-5xl lg:text-7xl font-black leading-[0.95] tracking-tighter mb-6">
                                Your IPTV, <br />
                                <span className="text-[#E50914]">unleashed.</span>
                            </h1>
                            <p className="text-zinc-300 text-base lg:text-lg leading-relaxed max-w-xl mb-8">
                                Maxx Player is a premium OTT streaming experience. Sign in with your Xtream Codes account, upload an M3U playlist, or explore our curated demo library.
                            </p>
                            <ul className="space-y-2 text-sm text-zinc-400">
                                {[
                                    "Xtream Codes & M3U playlist support",
                                    "Live TV, Movies, Series, VOD & full EPG guide",
                                    "Multi-engine playback (HLS.js, Video.js, Native)",
                                    "Picture-in-Picture, casting, mini-player, favorites",
                                ].map((t) => (
                                    <li key={t} className="flex items-center gap-3">
                                        <span className="w-1.5 h-1.5 rounded-full bg-[#E50914]" />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Right — form card */}
                        <Card className="glass-strong border-white/10 p-6 lg:p-8 animate-fade-up" data-testid="login-card">
                            <div className="mb-6">
                                <div className="text-xs tracking-[0.3em] uppercase text-zinc-400 font-bold mb-2">Connect Playlist</div>
                                <h2 className="font-display text-3xl font-bold tracking-tight">Sign in to Maxx</h2>
                            </div>

                            <Tabs value={tab} onValueChange={setTab}>
                                <TabsList className="grid grid-cols-3 bg-[#0a0a0a] border border-white/10">
                                    <TabsTrigger value="xtream" data-testid="tab-xtream">Xtream</TabsTrigger>
                                    <TabsTrigger value="m3u" data-testid="tab-m3u">M3U</TabsTrigger>
                                    <TabsTrigger value="demo" data-testid="tab-demo">Demo</TabsTrigger>
                                </TabsList>

                                {/* XTREAM */}
                                <TabsContent value="xtream" className="mt-5">
                                    <form onSubmit={submitXtream} className="space-y-4">
                                        <div>
                                            <Label className="text-xs tracking-wider uppercase font-bold text-zinc-400">Playlist Name</Label>
                                            <Input
                                                data-testid="xtream-name"
                                                value={plName}
                                                onChange={(e) => setPlName(e.target.value)}
                                                placeholder="My IPTV Account"
                                                className="mt-1.5 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-[#E50914]"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs tracking-wider uppercase font-bold text-zinc-400">Server URL</Label>
                                            <Input
                                                data-testid="xtream-server"
                                                value={server}
                                                onChange={(e) => setServer(e.target.value)}
                                                placeholder="http://your-iptv-server.tld:port"
                                                className="mt-1.5 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-[#E50914]"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <Label className="text-xs tracking-wider uppercase font-bold text-zinc-400">Username</Label>
                                                <Input
                                                    data-testid="xtream-user"
                                                    value={user}
                                                    onChange={(e) => setUser(e.target.value)}
                                                    className="mt-1.5 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-[#E50914]"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label className="text-xs tracking-wider uppercase font-bold text-zinc-400">Password</Label>
                                                <Input
                                                    data-testid="xtream-pass"
                                                    type="password"
                                                    value={pass}
                                                    onChange={(e) => setPass(e.target.value)}
                                                    className="mt-1.5 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-[#E50914]"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-md bg-[#0a0a0a] border border-white/10">
                                            <div>
                                                <div className="text-sm font-semibold">Auto-connect on launch</div>
                                                <div className="text-xs text-zinc-500">Activate this playlist next time</div>
                                            </div>
                                            <Switch checked={autoConnect} onCheckedChange={setAutoConnect} data-testid="xtream-autoconnect" />
                                        </div>
                                        <Button type="submit" disabled={loading} className="w-full bg-[#E50914] hover:bg-[#F40612] text-white h-11 font-semibold" data-testid="xtream-submit">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                                            Connect
                                        </Button>
                                    </form>
                                </TabsContent>

                                {/* M3U */}
                                <TabsContent value="m3u" className="mt-5">
                                    <form onSubmit={submitM3U} className="space-y-4">
                                        <div>
                                            <Label className="text-xs tracking-wider uppercase font-bold text-zinc-400">Playlist Name</Label>
                                            <Input
                                                data-testid="m3u-name"
                                                value={m3uName}
                                                onChange={(e) => setM3uName(e.target.value)}
                                                placeholder="My M3U Playlist"
                                                className="mt-1.5 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-[#E50914]"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs tracking-wider uppercase font-bold text-zinc-400">M3U URL</Label>
                                            <Input
                                                data-testid="m3u-url"
                                                value={m3uUrl}
                                                onChange={(e) => setM3uUrl(e.target.value)}
                                                placeholder="https://example.com/playlist.m3u8"
                                                className="mt-1.5 bg-[#0a0a0a] border-white/10 text-zinc-100 focus:border-[#E50914]"
                                            />
                                        </div>
                                        <div className="relative text-center text-xs uppercase tracking-wider text-zinc-500">
                                            <span className="bg-[#0a0a0a]/0 px-2">or upload .m3u file</span>
                                        </div>
                                        <input
                                            type="file"
                                            accept=".m3u,.m3u8,text/plain"
                                            onChange={onFile}
                                            data-testid="m3u-file"
                                            className="block w-full text-sm text-zinc-300 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-[#E50914] file:text-white file:font-semibold hover:file:bg-[#F40612]"
                                        />
                                        {m3uContent && (
                                            <div className="text-xs text-zinc-400">
                                                Loaded {m3uContent.split("\n").length} lines.
                                            </div>
                                        )}
                                        <Button type="submit" disabled={loading || (!m3uUrl && !m3uContent)} className="w-full bg-[#E50914] hover:bg-[#F40612] text-white h-11 font-semibold" data-testid="m3u-submit">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Globe className="w-4 h-4 mr-2" />}
                                            Load Playlist
                                        </Button>
                                    </form>
                                </TabsContent>

                                {/* DEMO */}
                                <TabsContent value="demo" className="mt-5">
                                    <div className="space-y-4">
                                        <p className="text-sm text-zinc-300 leading-relaxed">
                                            Explore a curated demo library with live channels, movies, and series featuring public-domain HLS streams.
                                        </p>
                                        <Button onClick={loadDemo} disabled={loading} className="w-full bg-[#E50914] hover:bg-[#F40612] text-white h-11 font-semibold" data-testid="demo-load">
                                            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                                            Load Demo Library
                                        </Button>
                                        <div className="text-xs text-zinc-500 leading-relaxed">
                                            Includes: 8 live channels (NASA, Mux, Red Bull), 8 movies (Big Buck Bunny, Sintel, Tears of Steel), 4 series with multiple episodes, and a synthetic EPG guide.
                                        </div>
                                    </div>
                                </TabsContent>
                            </Tabs>

                            {saved.length > 0 && (
                                <div className="mt-7 pt-6 border-t border-white/10">
                                    <div className="text-xs tracking-[0.2em] uppercase font-bold text-zinc-500 mb-3">Saved Accounts</div>
                                    <div className="space-y-2 max-h-48 overflow-y-auto thin-scroll">
                                        {saved.map((p) => (
                                            <div key={p.id} className="flex items-center justify-between p-3 rounded-md bg-[#0a0a0a] border border-white/10 hover:border-white/30" data-testid={`saved-${p.id}`}>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <Tv className="w-4 h-4 text-[#E50914]" />
                                                        <span className="text-sm font-semibold truncate">{p.name}</span>
                                                        {p.is_active && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] font-bold">Active</span>}
                                                    </div>
                                                    <div className="text-xs text-zinc-500 mt-0.5">{p.type.toUpperCase()} · {p.server_url || p.m3u_url || "Local"}</div>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <button onClick={() => activate(p.id)} className="px-3 py-1.5 rounded-md bg-[#E50914] text-xs font-bold hover:bg-[#F40612]" data-testid={`activate-${p.id}`}>
                                                        <Play className="w-3.5 h-3.5 inline -mt-0.5 mr-1" />
                                                        Use
                                                    </button>
                                                    <button onClick={() => remove(p.id)} className="w-8 h-8 rounded-md hover:bg-white/10 flex items-center justify-center" data-testid={`delete-${p.id}`}>
                                                        <Trash2 className="w-4 h-4 text-zinc-400" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
