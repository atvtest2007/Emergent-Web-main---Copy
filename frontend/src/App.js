import React from "react";
import "@/App.css";
import "@/index.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

import Login from "@/pages/Login";
import Home from "@/pages/Home";
import LiveTV from "@/pages/LiveTV";
import Movies from "@/pages/Movies";
import MovieDetails from "@/pages/MovieDetails";
import Series from "@/pages/Series";
import SeriesDetails from "@/pages/SeriesDetails";
import VOD from "@/pages/VOD";
import Favorites from "@/pages/Favorites";
import HistoryPage from "@/pages/History";
import SearchPage from "@/pages/Search";
import SettingsPage from "@/pages/Settings";
import EPG from "@/pages/EPG";
import Watch from "@/pages/Watch";
import Layout from "@/components/Layout";

import { usePlatform } from "@/hooks/usePlatform";
import { MobileApp } from "@/maxxplayer/MobileApp";
import { TVApp } from "@/maxxplayer/TVApp";

const Shell = ({ children }) => <Layout>{children}</Layout>;

function App() {
    const { platform } = usePlatform();

    if (platform === 'mobile') {
        return <MobileApp />;
    }

    if (platform === 'tv') {
        return <TVApp />;
    }

    return (
        <div className="App">
            <BrowserRouter>
                <Toaster
                    theme="dark"
                    position="bottom-right"
                    toastOptions={{
                        style: {
                            background: "rgba(10,10,10,0.94)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "#f5f5f5",
                            backdropFilter: "blur(20px)",
                        },
                    }}
                />
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/home" element={<Shell><Home /></Shell>} />
                    <Route path="/live" element={<Shell><LiveTV /></Shell>} />
                    <Route path="/movies" element={<Shell><Movies /></Shell>} />
                    <Route path="/movie/:id" element={<Shell><MovieDetails /></Shell>} />
                    <Route path="/series" element={<Shell><Series /></Shell>} />
                    <Route path="/series/:id" element={<Shell><SeriesDetails /></Shell>} />
                    <Route path="/vod" element={<Shell><VOD /></Shell>} />
                    <Route path="/favorites" element={<Shell><Favorites /></Shell>} />
                    <Route path="/history" element={<Shell><HistoryPage /></Shell>} />
                    <Route path="/search" element={<Shell><SearchPage /></Shell>} />
                    <Route path="/settings" element={<Shell><SettingsPage /></Shell>} />
                    <Route path="/epg" element={<Shell><EPG /></Shell>} />
                    <Route path="/watch/:type/:id" element={<Watch />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </BrowserRouter>
        </div>
    );
}

export default App;
