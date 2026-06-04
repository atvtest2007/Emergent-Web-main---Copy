import React, { useState, useEffect } from "react";
import "./App.css";
import "./index.css";
import { HashRouter, MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Capacitor } from '@capacitor/core';

import AccountLogin from "@/pages/AccountLogin";
import AccountRegister from "@/pages/AccountRegister";
import { AuthProvider, useAuth } from "@/lib/AuthContext";

// Web Pages
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

// Mobile Screens
import MobileSplashScreen from './screens/SplashScreen';
import MobileLoginScreen from './screens/LoginScreen';
import MobilePlaylistScreen from './screens/PlaylistScreen';
import MobileHomeScreen from './screens/HomeScreen';
import MobileLiveTVScreen from './screens/LiveTVScreen';
import MobileMoviesScreen from './screens/MoviesScreen';
import MobileMovieDetailScreen from './screens/MovieDetailScreen';
import MobileSeriesScreen from './screens/SeriesScreen';
import MobileSeriesDetailScreen from './screens/SeriesDetailScreen';
import MobileEPGScreen from './screens/EPGScreen';
import MobileCatchUpScreen from './screens/CatchUpScreen';
import MobileFavoritesScreen from './screens/FavoritesScreen';
import MobileSearchScreen from './screens/SearchScreen';
import MobileSportsScreen from './screens/SportsScreen';
import MobileSettingsScreen from './screens/SettingsScreen';
import MobilePlayerScreen from './screens/PlayerScreen';

// TV Screens
import TVSplashScreen from './screens/tv/TVSplashScreen';
import TVLoginScreen from './screens/tv/TVLoginScreen';
import TVPlaylistScreen from './screens/tv/TVPlaylistScreen';
import TVHomeScreen from './screens/tv/TVHomeScreen';
import TVLiveTVScreen from './screens/tv/TVLiveTVScreen';
import TVMoviesScreen from './screens/tv/TVMoviesScreen';
import TVSeriesScreen from './screens/tv/TVSeriesScreen';
import TVSettingsScreen from './screens/tv/TVSettingsScreen';
import TVPlayerScreen from './screens/tv/TVPlayerScreen';
import TVSeriesDetailScreen from './screens/tv/TVSeriesDetailScreen';

import type { Screen } from './types';

const WebShell = ({ children }: { children: React.ReactNode }) => <Layout>{children}</Layout>;

const AuthGuard = ({ children }: { children: React.ReactNode }) => {
    const { user, loading } = useAuth();
    if (loading) return <div className="flex h-screen items-center justify-center bg-background"><p className="text-white">Loading...</p></div>;
    if (!user) return <Navigate to="/account/login" replace />;
    return <>{children}</>;
};

const MobileApp = () => {
  return (
    <div className="mobile-app-container w-full h-screen overflow-hidden text-white bg-[#030608] font-sans">
      <MemoryRouter>
        <Routes>
          <Route path="/account/login" element={<AccountLogin />} />
          <Route path="/account/register" element={<AccountRegister />} />
          <Route path="/" element={<AuthGuard><MobileSplashScreen /></AuthGuard>} />
          <Route path="/login" element={<AuthGuard><MobileLoginScreen /></AuthGuard>} />
          <Route path="/home" element={<AuthGuard><MobileHomeScreen /></AuthGuard>} />
          <Route path="/live" element={<AuthGuard><MobileLiveTVScreen /></AuthGuard>} />
          <Route path="/movies" element={<AuthGuard><MobileMoviesScreen /></AuthGuard>} />
          <Route path="/movie/:id" element={<AuthGuard><MobileMovieDetailScreen /></AuthGuard>} />
          <Route path="/series" element={<AuthGuard><MobileSeriesScreen /></AuthGuard>} />
          <Route path="/series/:id" element={<AuthGuard><MobileSeriesDetailScreen /></AuthGuard>} />
          <Route path="/epg" element={<AuthGuard><MobileEPGScreen /></AuthGuard>} />
          <Route path="/favorites" element={<AuthGuard><MobileFavoritesScreen /></AuthGuard>} />
          <Route path="/search" element={<AuthGuard><MobileSearchScreen /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><MobileSettingsScreen /></AuthGuard>} />
          <Route path="/watch/:type/:id" element={<AuthGuard><MobilePlayerScreen /></AuthGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MemoryRouter>
    </div>
  );
};

const TVApp = () => {
  return (
    <div className="tv-app-container w-full h-screen overflow-hidden text-white bg-[#030608] font-sans">
      <MemoryRouter>
        <Routes>
          <Route path="/account/login" element={<AccountLogin />} />
          <Route path="/account/register" element={<AccountRegister />} />
          <Route path="/" element={<AuthGuard><TVSplashScreen /></AuthGuard>} />
          <Route path="/login" element={<AuthGuard><TVLoginScreen /></AuthGuard>} />
          <Route path="/home" element={<AuthGuard><TVHomeScreen /></AuthGuard>} />
          <Route path="/live" element={<AuthGuard><TVLiveTVScreen /></AuthGuard>} />
          <Route path="/movies" element={<AuthGuard><TVMoviesScreen /></AuthGuard>} />
          <Route path="/series" element={<AuthGuard><TVSeriesScreen /></AuthGuard>} />
          <Route path="/series/:id" element={<AuthGuard><TVSeriesDetailScreen /></AuthGuard>} />
          <Route path="/settings" element={<AuthGuard><TVSettingsScreen /></AuthGuard>} />
          <Route path="/watch/:type/:id" element={<AuthGuard><TVPlayerScreen /></AuthGuard>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MemoryRouter>
    </div>
  );
};

const WebApp = () => {
  return (
    <HashRouter>
        <Routes>
            <Route path="/account/login" element={<AccountLogin />} />
            <Route path="/account/register" element={<AccountRegister />} />
            <Route path="/" element={<AuthGuard><Login /></AuthGuard>} />
            <Route path="/home" element={<AuthGuard><WebShell><Home /></WebShell></AuthGuard>} />
            <Route path="/live" element={<AuthGuard><WebShell><LiveTV /></WebShell></AuthGuard>} />
            <Route path="/movies" element={<AuthGuard><WebShell><Movies /></WebShell></AuthGuard>} />
            <Route path="/movie/:id" element={<AuthGuard><WebShell><MovieDetails /></WebShell></AuthGuard>} />
            <Route path="/series" element={<AuthGuard><WebShell><Series /></WebShell></AuthGuard>} />
            <Route path="/series/:id" element={<AuthGuard><WebShell><SeriesDetails /></WebShell></AuthGuard>} />
            <Route path="/vod" element={<AuthGuard><WebShell><VOD /></WebShell></AuthGuard>} />
            <Route path="/favorites" element={<AuthGuard><WebShell><Favorites /></WebShell></AuthGuard>} />
            <Route path="/history" element={<AuthGuard><WebShell><HistoryPage /></WebShell></AuthGuard>} />
            <Route path="/search" element={<AuthGuard><WebShell><SearchPage /></WebShell></AuthGuard>} />
            <Route path="/settings" element={<AuthGuard><WebShell><SettingsPage /></WebShell></AuthGuard>} />
            <Route path="/epg" element={<AuthGuard><WebShell><EPG /></WebShell></AuthGuard>} />
            <Route path="/watch/:type/:id" element={<AuthGuard><Watch /></AuthGuard>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </HashRouter>
  );
};

export default function App() {
  const [platform, setPlatform] = useState<'web' | 'mobile' | 'tv'>('web');

  useEffect(() => {
    const detectPlatform = () => {
      const capPlatform = Capacitor.getPlatform();
      
      // Allow overriding via query param for testing: ?platform=tv
      const params = new URLSearchParams(window.location.search);
      const forcedPlatform = params.get('platform');
      
      if (forcedPlatform === 'tv' || forcedPlatform === 'mobile' || forcedPlatform === 'web') {
        return forcedPlatform;
      }
      
      if (capPlatform === 'android') {
        const userAgent = navigator.userAgent.toLowerCase();
        
        // Strict flavor matching from Android MainActivity
        if (userAgent.includes('maxxplayerflavor/tv')) {
          return 'tv';
        }
        if (userAgent.includes('maxxplayerflavor/mobile')) {
          return 'mobile';
        }

        // Basic heuristic fallback for TV vs Mobile on Android
        if (userAgent.includes('tv') || userAgent.includes('bravia') || userAgent.includes('aftb') || userAgent.includes('smart-tv')) {
          return 'tv';
        }
        return 'mobile';
      }
      return 'web';
    };
    
    setPlatform(detectPlatform());
  }, []);

  return (
    <AuthProvider>
        <div className="App">
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
            {platform === 'tv' && <TVApp />}
            {platform === 'mobile' && <MobileApp />}
            {platform === 'web' && <WebApp />}
        </div>
    </AuthProvider>
  );
}
