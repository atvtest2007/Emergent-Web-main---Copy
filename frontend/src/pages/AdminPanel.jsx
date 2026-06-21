import React, { useState, useEffect } from "react";
import { Branding } from "@/lib/api";
import { toast } from "sonner";
import { Save, Loader2, Image as ImageIcon, PaintBucket, Type, Globe } from "lucide-react";

export default function AdminPanel() {
    const [config, setConfig] = useState({
        domain: window.location.hostname,
        brand_name: "Emergent",
        primary_color: "#E50914",
        logo_url: "",
        favicon_url: "",
        watermark_url: "",
        language: "en"
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        Branding.get().then((data) => {
            setConfig(c => ({ ...c, ...data }));
        }).catch(() => toast.error("Failed to load branding")).finally(() => setLoading(false));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await Branding.update(config);
            toast.success("Branding updated successfully!");
            setTimeout(() => window.location.reload(), 1000);
        } catch (err) {
            toast.error("Failed to save branding");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-brand" /></div>;

    return (
        <div className="max-w-3xl mx-auto px-6 py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-display tracking-tight">White-Label Admin</h1>
                <p className="text-zinc-400 mt-2">Configure tenant branding for {window.location.hostname}</p>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                <div className="glass-panel p-6 rounded-xl border border-white/10 space-y-6">
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <Globe className="w-4 h-4 text-zinc-400" />
                            Tenant Domain
                        </label>
                        <input
                            type="text"
                            value={config.domain}
                            readOnly
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-zinc-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <Type className="w-4 h-4 text-zinc-400" />
                            Brand Name
                        </label>
                        <input
                            type="text"
                            value={config.brand_name}
                            onChange={(e) => setConfig({ ...config, brand_name: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="e.g. My IPTV"
                            required
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <PaintBucket className="w-4 h-4 text-zinc-400" />
                            Primary Color (Hex)
                        </label>
                        <div className="flex gap-4">
                            <input
                                type="color"
                                value={config.primary_color}
                                onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                                className="w-12 h-12 rounded cursor-pointer bg-transparent border-0 p-0"
                            />
                            <input
                                type="text"
                                value={config.primary_color}
                                onChange={(e) => setConfig({ ...config, primary_color: e.target.value })}
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-brand uppercase"
                                pattern="^#[0-9A-Fa-f]{6}$"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <ImageIcon className="w-4 h-4 text-zinc-400" />
                            Logo URL
                        </label>
                        <input
                            type="url"
                            value={config.logo_url}
                            onChange={(e) => setConfig({ ...config, logo_url: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="https://example.com/logo.png"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <ImageIcon className="w-4 h-4 text-zinc-400" />
                            Favicon URL
                        </label>
                        <input
                            type="url"
                            value={config.favicon_url}
                            onChange={(e) => setConfig({ ...config, favicon_url: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="https://example.com/favicon.ico"
                        />
                    </div>

                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold mb-2">
                            <ImageIcon className="w-4 h-4 text-zinc-400" />
                            Player Watermark URL
                        </label>
                        <input
                            type="url"
                            value={config.watermark_url}
                            onChange={(e) => setConfig({ ...config, watermark_url: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand"
                            placeholder="https://example.com/watermark.png"
                        />
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-brand text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-brand/80 transition disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                        Save Configuration
                    </button>
                </div>
            </form>
        </div>
    );
}
