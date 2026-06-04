import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import {
    Home, Tv, Film, Clapperboard, Library, Heart, History,
    Search, Settings as SettingsIcon, LogOut, Compass, Radio,
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
    const { logout } = useAuth();

    return (
        <div className="min-h-screen flex bg-[#050505] text-zinc-100" data-testid="app-shell">
            {/* Sidebar */}
            <aside
                className="hidden md:flex group fixed left-0 top-0 bottom-0 z-40 w-20 hover:w-64 flex-col glass-strong border-r border-white/5 transition-[width] duration-300 overflow-hidden"
                data-testid="sidebar"
            >
                <div className="flex items-center gap-3 px-5 py-6">
                    <div className="w-9 h-9 rounded-md bg-gradient-to-br from-[#E50914] to-[#7a040a] flex items-center justify-center shadow-lg shadow-red-900/40 shrink-0">
                        <span className="font-display font-black text-white text-lg">M</span>
                    </div>
                    <div className="font-display font-black text-xl tracking-tight whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                        MAXX<span className="text-[#E50914]">.</span>
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

                <div className="px-3 py-4 border-t border-white/5 space-y-1">
                    <button
                        data-testid="nav-switch-playlist"
                        onClick={() => navigate("/")}
                        className="sidebar-link flex items-center gap-4 px-3 py-3 rounded-md text-sm text-zinc-400 hover:text-white w-full"
                    >
                        <SettingsIcon className="w-5 h-5 shrink-0" />
                        <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            Playlists
                        </span>
                    </button>
                    <button
                        data-testid="nav-logout"
                        onClick={() => { logout(); navigate("/account/login"); }}
                        className="sidebar-link flex items-center gap-4 px-3 py-3 rounded-md text-sm text-[#E50914] hover:bg-[#E50914]/10 w-full"
                    >
                        <LogOut className="w-5 h-5 shrink-0" />
                        <span className="whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                            Log out
                        </span>
                    </button>
                </div>
            </aside>

            {/* Mobile bottom nav */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-white/5 flex items-center justify-around py-2" data-testid="mobile-nav">
                {NAV.slice(0, 5).map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname.startsWith(item.to);
                    return (
                        <Link
                            key={item.key}
                            to={item.to}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-md ${isActive ? "text-[#E50914]" : "text-zinc-400"}`}
                            data-testid={`mobile-nav-${item.key}`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[10px] tracking-wider uppercase font-semibold">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Main */}
            <main className="flex-1 md:ml-20 pb-20 md:pb-0 min-h-screen relative">
                {children}
            </main>
        </div>
    );
}
