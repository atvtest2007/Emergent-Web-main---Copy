import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
    Home, Tv, Film, Clapperboard, Library, Heart, History,
    Search, Settings as SettingsIcon, LogOut, Compass, Radio, Menu, X
} from "lucide-react";

const NAV = [
    { to: "/home", label: "Home", icon: Home, key: "home" },
    { to: "/live", label: "Live TV", icon: Tv, key: "live" },
    { to: "/movies", label: "Movies", icon: Film, key: "movies" },
    { to: "/series", label: "Series", icon: Clapperboard, key: "series" },
    { to: "/vod", label: "VOD", icon: Library, key: "vod" },
    { to: "/epg", label: "EPG Guide", icon: Radio, key: "epg" },
    { to: "/favorites", label: "Favorites", icon: Heart, key: "favorites" },
    { to: "/history", label: "Continue", icon: History, key: "history" },
    { to: "/search", label: "Search", icon: Search, key: "search" },
    { to: "/settings", label: "Settings", icon: SettingsIcon, key: "settings" },
];

export default function Layout({ children }) {
    const location = useLocation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="h-[100dvh] w-screen overflow-hidden flex bg-[#050505] text-zinc-100" data-testid="app-shell">
            {/* Sidebar */}
            <aside
                className="hidden md:flex group fixed left-0 top-0 bottom-0 z-40 w-20 lg:w-24 3xl:w-28 4xl:w-32 5xl:w-40 hover:w-64 lg:hover:w-72 3xl:hover:w-80 4xl:hover:w-96 5xl:hover:w-[400px] flex-col glass-strong border-r border-white/5 transition-[width] duration-300 overflow-hidden"
                data-testid="sidebar"
            >
                <div className="flex items-center gap-3 px-5 py-6">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[var(--brand-primary)] to-[#7a040a] flex items-center justify-center shadow-lg shadow-red-900/40 shrink-0">
                        <span className="font-display font-black text-white text-lg">M</span>
                    </div>
                    <div className="font-display font-black text-xl tracking-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        MAXX<span className="text-brand">.</span>
                    </div>
                </div>

                <nav className="flex-1 flex flex-col gap-1 px-3 pt-3 thin-scroll overflow-y-auto">
                    {NAV.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname.startsWith(item.to);
                        return (
                            <Link
                                key={item.key}
                                to={item.to}
                                data-testid={`nav-${item.key}`}
                                className={`sidebar-link flex items-center gap-4 px-3 py-3 rounded-md text-sm text-zinc-400 hover:text-white ${isActive ? "active text-white" : ""}`}
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="px-3 py-4 border-t border-white/5">
                    <button
                        data-testid="nav-switch-account"
                        onClick={() => navigate("/")}
                        className="sidebar-link flex items-center gap-4 px-3 py-3 rounded-md text-sm text-zinc-400 hover:text-white w-full"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            Switch Account
                        </span>
                    </button>
                </div>
            </aside>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/5 flex items-center justify-around pb-safe pt-1" data-testid="mobile-nav">
                {NAV.slice(0, 4).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.to);
                    return (
                        <Link
                            key={item.key}
                            to={item.to}
                            onClick={() => setMobileMenuOpen(false)}
                            className={`flex flex-col items-center justify-center gap-1 flex-1 py-2.5 rounded-md ${isActive && !mobileMenuOpen ? "text-brand" : "text-zinc-400"}`}
                            data-testid={`mobile-nav-${item.key}`}
                        >
                            <Icon className="w-6 h-6" />
                            <span className="text-[10px] tracking-wider uppercase font-bold">{item.label}</span>
                        </Link>
                    );
                })}
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className={`flex flex-col items-center justify-center gap-1 flex-1 py-2.5 rounded-md ${mobileMenuOpen ? "text-brand" : "text-zinc-400"}`}
                    data-testid="mobile-nav-more"
                >
                    <Menu className="w-6 h-6" />
                    <span className="text-[10px] tracking-wider uppercase font-bold">More</span>
                </button>
            </nav>

            {/* Mobile full-screen menu overlay */}
            {mobileMenuOpen && (
                <div className="md:hidden fixed inset-0 z-30 bg-[#050505] animate-in fade-in slide-in-from-bottom-4 duration-200 pb-20 pt-safe flex flex-col" data-testid="mobile-menu-overlay">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[var(--brand-primary)] to-[#7a040a] flex items-center justify-center shadow-lg shadow-red-900/40">
                                <span className="font-display font-black text-white text-lg">M</span>
                            </div>
                            <div className="font-display font-black text-xl tracking-tight">MAXX<span className="text-brand">.</span></div>
                        </div>
                        <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-zinc-300 transition">
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
                        {NAV.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname.startsWith(item.to);
                            return (
                                <Link
                                    key={`menu-${item.key}`}
                                    to={item.to}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={`flex items-center gap-4 px-4 py-4 rounded-xl text-base font-semibold ${isActive ? "bg-brand/15 text-brand" : "text-zinc-300 hover:bg-white/5"}`}
                                >
                                    <Icon className="w-6 h-6" />
                                    {item.label}
                                </Link>
                            );
                        })}
                        <div className="mt-4 pt-4 border-t border-white/5">
                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    navigate("/");
                                }}
                                className="flex items-center gap-4 px-4 py-4 rounded-xl text-base font-semibold text-zinc-400 hover:text-white hover:bg-white/5 w-full"
                            >
                                <LogOut className="w-6 h-6" />
                                Switch Account
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main */}
            <main className="flex-1 md:ml-20 lg:ml-24 3xl:ml-28 4xl:ml-32 5xl:ml-40 pb-safe h-[100dvh] overflow-y-auto overflow-x-hidden relative thin-scroll">
                {children}
            </main>
        </div>
    );
}
