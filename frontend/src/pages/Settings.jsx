import React, { useEffect, useState } from "react";
import { Settings as Api, Playlists } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PLAYER_OPTIONS } from "@/lib/store";
import { Loader2, Settings as Cog, Cpu, Subtitles, Volume2, Network, HardDrive, MonitorSmartphone, UserCircle2, Shield, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";

const TABS = [
    { id: "playback", label: "Playback", icon: Cog },
    { id: "decoder", label: "Decoder", icon: Cpu },
    { id: "subtitle", label: "Subtitle", icon: Subtitles },
    { id: "audio", label: "Audio", icon: Volume2 },
    { id: "network", label: "Network", icon: Network },
    { id: "cache", label: "Cache", icon: HardDrive },
    { id: "interface", label: "Interface", icon: MonitorSmartphone },
    { id: "accounts", label: "Accounts", icon: UserCircle2 },
    { id: "parental", label: "Parental Controls", icon: Shield },
    { id: "privacy", label: "Privacy", icon: Shield },
];

export default function SettingsPage() {
    const nav = useNavigate();
    const [tab, setTab] = useState("playback");
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState(null);
    const [accounts, setAccounts] = useState([]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const [s, a] = await Promise.all([Api.get(), Playlists.list()]);
                setSettings(s);
                setAccounts(a || []);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const update = async (patch) => {
        const next = { ...settings, ...patch };
        setSettings(next);
        const saved = await Api.save(next);
        setSettings(saved);
        toast.success("Settings saved");
    };

    if (loading || !settings) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-[#E50914]" /></div>;
    }

    return (
        <div className="px-6 lg:px-12 py-8 pt-12" data-testid="settings-page">
            <div className="mb-8">
                <div className="text-xs tracking-[0.32em] uppercase font-bold text-[#E50914] mb-2 flex items-center gap-2">
                    <Cog className="w-3.5 h-3.5" /> Preferences
                </div>
                <h1 className="font-display text-5xl lg:text-6xl font-black tracking-tighter">Settings</h1>
            </div>

            <div className="grid lg:grid-cols-[260px_1fr] gap-8">
                <aside className="flex flex-row lg:flex-col flex-wrap gap-1.5 sticky top-2 self-start">
                    {TABS.map((t) => {
                        const I = t.icon;
                        return (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-semibold transition w-full text-left ${tab === t.id ? "bg-[#E50914]/10 text-white border border-[#E50914]/30" : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
                                data-testid={`settings-tab-${t.id}`}
                            >
                                <I className="w-4 h-4" />
                                {t.label}
                            </button>
                        );
                    })}
                </aside>

                <main>
                    {tab === "playback" && (
                        <Card className="bg-[#121212] border-white/10 p-6 space-y-6">
                            <Row label="Autoplay next episode" desc="Automatically continue to the next episode">
                                <Switch checked={settings.autoplay_next} onCheckedChange={(v) => update({ autoplay_next: v })} data-testid="setting-autoplay" />
                            </Row>
                            <Row label="Preview on hover" desc="Play muted preview when hovering posters">
                                <Switch checked={settings.preview_on_hover} onCheckedChange={(v) => update({ preview_on_hover: v })} data-testid="setting-preview-hover" />
                            </Row>
                            <Row label="Hardware acceleration" desc="GPU decoding when available">
                                <Switch checked={settings.hardware_acceleration} onCheckedChange={(v) => update({ hardware_acceleration: v })} data-testid="setting-hwaccel" />
                            </Row>
                        </Card>
                    )}
                    {tab === "decoder" && (
                        <Card className="bg-[#121212] border-white/10 p-6 space-y-6">
                            <Row label="Preferred player" desc="Engine used by default for playback">
                                <Select value={settings.preferred_player} onValueChange={(v) => update({ preferred_player: v })}>
                                    <SelectTrigger className="w-56 bg-[#0a0a0a] border-white/10" data-testid="setting-preferred-player">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0a0a0a] border-white/10 text-zinc-100">
                                        {PLAYER_OPTIONS.map((p) => <SelectItem key={p.id} value={p.id}>{p.label}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </Row>
                        </Card>
                    )}
                    {tab === "subtitle" && (
                        <Card className="bg-[#121212] border-white/10 p-6 space-y-6">
                            <Row label="Default subtitle language" desc="Preferred subtitle track language">
                                <Select value={settings.subtitle_language} onValueChange={(v) => update({ subtitle_language: v })}>
                                    <SelectTrigger className="w-40 bg-[#0a0a0a] border-white/10" data-testid="setting-sub-lang">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0a0a0a] border-white/10 text-zinc-100">
                                        {["en", "es", "fr", "de", "ar", "hi", "pt", "it", "ja", "ko"].map((l) => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </Row>
                        </Card>
                    )}
                    {tab === "audio" && (
                        <Card className="bg-[#121212] border-white/10 p-6 space-y-6">
                            <Row label="Default audio language">
                                <Select value={settings.audio_language} onValueChange={(v) => update({ audio_language: v })}>
                                    <SelectTrigger className="w-40 bg-[#0a0a0a] border-white/10" data-testid="setting-audio-lang">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="bg-[#0a0a0a] border-white/10 text-zinc-100">
                                        {["en", "es", "fr", "de", "ar", "hi", "pt", "it", "ja", "ko"].map((l) => <SelectItem key={l} value={l}>{l.toUpperCase()}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </Row>
                        </Card>
                    )}
                    {tab === "network" && (
                        <Card className="bg-[#121212] border-white/10 p-6 space-y-6">
                            <Row label="Buffer size" desc={`${settings.buffer_size} seconds of ahead buffer`}>
                                <div className="w-56">
                                    <Slider value={[settings.buffer_size]} min={5} max={120} step={5} onValueChange={(v) => update({ buffer_size: v[0] })} data-testid="setting-buffer" />
                                </div>
                            </Row>
                        </Card>
                    )}
                    {tab === "cache" && (
                        <Card className="bg-[#121212] border-white/10 p-6 space-y-6">
                            <Row label="Clear local cache" desc="Resets preferred player, brightness and aspect">
                                <Button
                                    variant="outline"
                                    className="border-white/10 bg-white/5 hover:bg-white/10"
                                    onClick={() => {
                                        localStorage.clear();
                                        toast.success("Local cache cleared");
                                    }}
                                    data-testid="setting-clear-cache"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" /> Clear
                                </Button>
                            </Row>
                        </Card>
                    )}
                    {tab === "interface" && (
                        <Card className="bg-[#121212] border-white/10 p-6 space-y-6">
                            <Row label="Theme" desc="Dark cinematic theme only">
                                <span className="text-sm text-zinc-400">Dark (default)</span>
                            </Row>
                        </Card>
                    )}
                    {tab === "accounts" && (
                        <Card className="bg-[#121212] border-white/10 p-6">
                            <h3 className="font-display text-xl font-bold mb-4">Saved Playlists</h3>
                            <div className="space-y-2">
                                {accounts.map((a) => (
                                    <div key={a.id} className="flex items-center justify-between p-3 rounded-md bg-[#0a0a0a] border border-white/10" data-testid={`account-${a.id}`}>
                                        <div>
                                            <div className="text-sm font-semibold flex items-center gap-2">
                                                {a.name}
                                                {a.is_active && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[#E50914]/20 text-[#E50914] font-bold">Active</span>}
                                            </div>
                                            <div className="text-xs text-zinc-500 mt-0.5">{a.type.toUpperCase()} · {a.server_url || a.m3u_url || "Local"}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {!a.is_active && (
                                                <Button size="sm" className="bg-[#E50914] hover:bg-[#F40612]" onClick={async () => { await Playlists.activate(a.id); toast.success("Switched account"); nav("/home"); }}>Use</Button>
                                            )}
                                            <Button size="sm" variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10" onClick={async () => { await Playlists.remove(a.id); setAccounts(accounts.filter(x => x.id !== a.id)); }}>
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <Button className="mt-5 bg-white/5 border border-white/10 hover:bg-white/10" onClick={() => nav("/")} data-testid="settings-add-account">+ Add new account</Button>
                        </Card>
                    )}
                    {tab === "parental" && (
                        <Card className="bg-[#121212] border-white/10 p-6 space-y-6">
                            <Row label="Parental PIN" desc="Set a 4-digit PIN to lock categories (leave empty to disable)">
                                <Input 
                                    type="password" 
                                    maxLength={4} 
                                    className="w-24 text-center bg-[#0a0a0a] border-white/10" 
                                    value={settings.parental_pin || ""} 
                                    onChange={(e) => update({ parental_pin: e.target.value })} 
                                    placeholder="0000" 
                                />
                            </Row>
                            {settings.parental_pin && (
                                <Row label="Locked Categories" desc="Keywords to lock (e.g., 'adult, xxx, 18+')">
                                    <Input 
                                        value={(settings.locked_categories || []).join(", ")} 
                                        onChange={(e) => update({ locked_categories: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })}
                                        placeholder="e.g. xxx, adult" 
                                        className="bg-[#0a0a0a] border-white/10 w-56"
                                    />
                                </Row>
                            )}
                        </Card>
                    )}
                    {tab === "privacy" && (
                        <Card className="bg-[#121212] border-white/10 p-6 space-y-6">
                            <Row label="Anonymous analytics" desc="Help improve Maxx by sharing anonymous usage data">
                                <Switch checked={settings.analytics} onCheckedChange={(v) => update({ analytics: v })} data-testid="setting-analytics" />
                            </Row>
                        </Card>
                    )}
                </main>
            </div>
        </div>
    );
}

function Row({ label, desc, children }) {
    return (
        <div className="flex items-start justify-between gap-6">
            <div>
                <Label className="text-sm font-semibold text-zinc-100">{label}</Label>
                {desc && <div className="text-xs text-zinc-500 mt-0.5">{desc}</div>}
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    );
}
