import React, { useState, useEffect } from "react";
import "./App.css";
import "./index.css";
import { BrowserRouter, MemoryRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { Capacitor } from '@capacitor/core';
import { Branding } from "@/lib/api";

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
import AdminPanel from "@/pages/AdminPanel";

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

const MobileApp = () => {
  return (
    <div className="mobile-app-container w-full h-screen overflow-hidden text-white bg-[#030608] font-sans">
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<MobileSplashScreen />} />
          <Route path="/login" element={<MobileLoginScreen />} />
          <Route path="/home" element={<MobileHomeScreen />} />
          <Route path="/live" element={<MobileLiveTVScreen />} />
          <Route path="/movies" element={<MobileMoviesScreen />} />
          <Route path="/movie/:id" element={<MobileMovieDetailScreen />} />
          <Route path="/series" element={<MobileSeriesScreen />} />
          <Route path="/series/:id" element={<MobileSeriesDetailScreen />} />
          <Route path="/epg" element={<MobileEPGScreen />} />
          <Route path="/favorites" element={<MobileFavoritesScreen />} />
          <Route path="/search" element={<MobileSearchScreen />} />
          <Route path="/settings" element={<MobileSettingsScreen />} />
          <Route path="/watch/:type/:id" element={<MobilePlayerScreen />} />
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
          <Route path="/" element={<TVSplashScreen />} />
          <Route path="/login" element={<TVLoginScreen />} />
          <Route path="/home" element={<TVHomeScreen />} />
          <Route path="/live" element={<TVLiveTVScreen />} />
          <Route path="/movies" element={<TVMoviesScreen />} />
          <Route path="/series" element={<TVSeriesScreen />} />
          <Route path="/series/:id" element={<TVSeriesDetailScreen />} />
          <Route path="/settings" element={<TVSettingsScreen />} />
          <Route path="/watch/:type/:id" element={<TVPlayerScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MemoryRouter>
    </div>
  );
};

const WebApp = () => {
  return (
    <BrowserRouter>
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/home" element={<WebShell><Home /></WebShell>} />
            <Route path="/live" element={<WebShell><LiveTV /></WebShell>} />
            <Route path="/movies" element={<WebShell><Movies /></WebShell>} />
            <Route path="/movie/:id" element={<WebShell><MovieDetails /></WebShell>} />
            <Route path="/series" element={<WebShell><Series /></WebShell>} />
            <Route path="/series/:id" element={<WebShell><SeriesDetails /></WebShell>} />
            <Route path="/vod" element={<WebShell><VOD /></WebShell>} />
            <Route path="/favorites" element={<WebShell><Favorites /></WebShell>} />
            <Route path="/history" element={<WebShell><HistoryPage /></WebShell>} />
            <Route path="/search" element={<WebShell><SearchPage /></WebShell>} />
            <Route path="/settings" element={<WebShell><SettingsPage /></WebShell>} />
            <Route path="/epg" element={<WebShell><EPG /></WebShell>} />
            <Route path="/admin" element={<WebShell><AdminPanel /></WebShell>} />
            <Route path="/watch/:type/:id" element={<Watch />} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    </BrowserRouter>
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

    Branding.get().then(brand => {
        if (brand.brand_name) document.title = brand.brand_name;
        if (brand.favicon_url) {
            let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
            if (!link) {
                link = document.createElement('link') as HTMLLinkElement;
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = brand.favicon_url;
        }
        if (brand.primary_color) {
            document.documentElement.style.setProperty('--brand-primary', brand.primary_color);
        }
        if (brand.watermark_url) {
            (window as any).BRAND_WATERMARK = brand.watermark_url;
        }
    }).catch(console.error);

  }, []);

  return (
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
  );
}
