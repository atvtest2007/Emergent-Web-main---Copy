import { useState } from 'react';
import MobileFrame from './components/MobileFrame';
import TVFrame from './components/TVFrame';
import SplashScreen from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import PlaylistScreen from './screens/PlaylistScreen';
import HomeScreen from './screens/HomeScreen';
import LiveTVScreen from './screens/LiveTVScreen';
import MoviesScreen from './screens/MoviesScreen';
import MovieDetailScreen from './screens/MovieDetailScreen';
import SeriesScreen from './screens/SeriesScreen';
import SeriesDetailScreen from './screens/SeriesDetailScreen';
import EPGScreen from './screens/EPGScreen';
import CatchUpScreen from './screens/CatchUpScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import SearchScreen from './screens/SearchScreen';
import SportsScreen from './screens/SportsScreen';
import SettingsScreen from './screens/SettingsScreen';
import PlayerScreen from './screens/PlayerScreen';
import TVSplashScreen from './screens/tv/TVSplashScreen';
import TVLoginScreen from './screens/tv/TVLoginScreen';
import TVPlaylistScreen from './screens/tv/TVPlaylistScreen';
import TVHomeScreen from './screens/tv/TVHomeScreen';
import TVLiveTVScreen from './screens/tv/TVLiveTVScreen';
import TVMoviesScreen from './screens/tv/TVMoviesScreen';
import TVSeriesScreen from './screens/tv/TVSeriesScreen';
import TVSettingsScreen from './screens/tv/TVSettingsScreen';
import TVPlayerScreen from './screens/tv/TVPlayerScreen';
import type { Screen } from './types';

type Platform = 'mobile' | 'tv' | 'both';

const mobileScreenGroups: { label: string; color: string; items: { id: Screen; label: string }[] }[] = [
  {
    label: 'Onboarding',
    color: '#64748b',
    items: [
      { id: 'splash', label: 'Splash Screen' },
      { id: 'login', label: 'Login / Auth' },
      { id: 'playlist-select', label: 'Playlist Select' },
    ],
  },
  {
    label: 'Main',
    color: '#0ea5e9',
    items: [
      { id: 'home', label: 'Home' },
      { id: 'search', label: 'Search' },
      { id: 'favorites', label: 'Favorites' },
    ],
  },
  {
    label: 'Live TV',
    color: '#ef4444',
    items: [
      { id: 'live-tv', label: 'Live Channels' },
      { id: 'epg', label: 'EPG Guide' },
      { id: 'catchup', label: 'Catch Up' },
    ],
  },
  {
    label: 'VOD',
    color: '#22c55e',
    items: [
      { id: 'movies', label: 'Movies' },
      { id: 'movie-detail', label: 'Movie Detail' },
      { id: 'series', label: 'Series' },
      { id: 'series-detail', label: 'Series Detail' },
    ],
  },
  {
    label: 'Other',
    color: '#f59e0b',
    items: [
      { id: 'sports', label: 'Sports' },
      { id: 'settings', label: 'Settings' },
      { id: 'player', label: 'Player' },
    ],
  },
];

const tvScreenGroups: { label: string; color: string; items: { id: Screen; label: string }[] }[] = [
  {
    label: 'Onboarding',
    color: '#64748b',
    items: [
      { id: 'splash', label: 'Splash Screen' },
      { id: 'login', label: 'Login / Auth' },
      { id: 'playlist-select', label: 'Playlist Select' },
    ],
  },
  {
    label: 'Main',
    color: '#0ea5e9',
    items: [
      { id: 'home', label: 'Home' },
      { id: 'live-tv', label: 'Live TV' },
      { id: 'movies', label: 'Movies' },
      { id: 'series', label: 'Series' },
    ],
  },
  {
    label: 'Other',
    color: '#f59e0b',
    items: [
      { id: 'settings', label: 'Settings' },
      { id: 'player', label: 'Player' },
    ],
  },
];

function renderMobileScreen(screen: Screen, onNavigate: (s: Screen) => void) {
  switch (screen) {
    case 'splash': return <SplashScreen />;
    case 'login': return <LoginScreen onNavigate={onNavigate} />;
    case 'activation': return <LoginScreen onNavigate={onNavigate} />;
    case 'playlist-select': return <PlaylistScreen onNavigate={onNavigate} />;
    case 'home': return <HomeScreen onNavigate={onNavigate} />;
    case 'live-tv': return <LiveTVScreen onNavigate={onNavigate} />;
    case 'movies': return <MoviesScreen onNavigate={onNavigate} />;
    case 'movie-detail': return <MovieDetailScreen onNavigate={onNavigate} />;
    case 'series': return <SeriesScreen onNavigate={onNavigate} />;
    case 'series-detail': return <SeriesDetailScreen onNavigate={onNavigate} />;
    case 'epg': return <EPGScreen onNavigate={onNavigate} />;
    case 'catchup': return <CatchUpScreen onNavigate={onNavigate} />;
    case 'favorites': return <FavoritesScreen onNavigate={onNavigate} />;
    case 'search': return <SearchScreen onNavigate={onNavigate} />;
    case 'sports': return <SportsScreen onNavigate={onNavigate} />;
    case 'settings': return <SettingsScreen onNavigate={onNavigate} />;
    case 'player': return <PlayerScreen onNavigate={onNavigate} />;
    default: return <HomeScreen onNavigate={onNavigate} />;
  }
}

function renderTVScreen(screen: Screen, onNavigate: (s: Screen) => void) {
  switch (screen) {
    case 'splash': return <TVSplashScreen onNavigate={onNavigate} />;
    case 'login': return <TVLoginScreen onNavigate={onNavigate} />;
    case 'activation': return <TVLoginScreen onNavigate={onNavigate} />;
    case 'playlist-select': return <TVPlaylistScreen onNavigate={onNavigate} />;
    case 'home': return <TVHomeScreen onNavigate={onNavigate} />;
    case 'live-tv': return <TVLiveTVScreen onNavigate={onNavigate} />;
    case 'movies': return <TVMoviesScreen onNavigate={onNavigate} />;
    case 'series': return <TVSeriesScreen onNavigate={onNavigate} />;
    case 'settings': return <TVSettingsScreen onNavigate={onNavigate} />;
    case 'player': return <TVPlayerScreen onNavigate={onNavigate} />;
    default: return <TVHomeScreen onNavigate={onNavigate} />;
  }
}

const tvScreenIds: Screen[] = ['splash', 'login', 'playlist-select', 'home', 'live-tv', 'movies', 'series', 'settings', 'player'];

const NioLogo = () => (
  <div className="flex items-center justify-center rounded-xl flex-shrink-0"
    style={{ width: 38, height: 38, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', boxShadow: '0 0 16px rgba(14,165,233,0.35)' }}>
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none">
      <path d="M12 8L38 24L12 40V8Z" fill="white" />
      <circle cx="36" cy="12" r="5" fill="rgba(255,255,255,0.7)" />
    </svg>
  </div>
);

export default function App() {
  const [platform, setPlatform] = useState<Platform>('both');
  const [mobileScreen, setMobileScreen] = useState<Screen>('home');
  const [tvScreen, setTvScreen] = useState<Screen>('home');
  const [showAllMobile, setShowAllMobile] = useState(false);
  const [showAllTV, setShowAllTV] = useState(false);

  const activeTvScreen = tvScreen;

  if (showAllMobile) {
    return (
      <div style={{ background: '#030608', minHeight: '100vh' }}>
        <div className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
          style={{ background: 'rgba(3,6,8,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #0d1420' }}>
          <div className="flex items-center gap-3">
            <NioLogo />
            <div>
              <h1 className="text-lg font-black leading-tight" style={{ color: '#f8fafc' }}>
                Maxx<span style={{ color: '#0ea5e9' }}>Player</span>
              </h1>
              <p className="text-xs" style={{ color: '#334155' }}>Android Mobile · All Screens</p>
            </div>
          </div>
          <button onClick={() => setShowAllMobile(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff' }}>
            Back to Design
          </button>
        </div>
        <div className="px-8 py-10">
          {mobileScreenGroups.map((group) => (
            <div key={group.label} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-5 rounded-full" style={{ background: group.color }} />
                <h2 className="text-lg font-black" style={{ color: '#f1f5f9' }}>{group.label}</h2>
                <div className="flex-1 h-px" style={{ background: '#0d1420' }} />
                <span className="text-xs" style={{ color: '#334155' }}>{group.items.length} screens</span>
              </div>
              <div className="flex flex-wrap gap-8">
                {group.items.map(({ id, label }) => (
                  <div key={id} className="flex flex-col items-center gap-3">
                    <div
                      className="cursor-pointer"
                      style={{ transform: 'scale(0.47)', transformOrigin: 'top center', height: 397 }}
                      onClick={() => { setMobileScreen(id); setShowAllMobile(false); }}
                    >
                      <MobileFrame>{renderMobileScreen(id, () => {})}</MobileFrame>
                    </div>
                    <button
                      onClick={() => { setMobileScreen(id); setShowAllMobile(false); }}
                      className="text-xs font-semibold px-4 py-1.5 rounded-full"
                      style={{ background: '#0d1117', color: '#64748b', border: '1px solid #1e2838' }}>
                      {label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (showAllTV) {
    return (
      <div style={{ background: '#030608', minHeight: '100vh' }}>
        <div className="sticky top-0 z-50 flex items-center justify-between px-8 py-4"
          style={{ background: 'rgba(3,6,8,0.97)', backdropFilter: 'blur(20px)', borderBottom: '1px solid #0d1420' }}>
          <div className="flex items-center gap-3">
            <NioLogo />
            <div>
              <h1 className="text-lg font-black leading-tight" style={{ color: '#f8fafc' }}>
                Maxx<span style={{ color: '#0ea5e9' }}>Player</span>
              </h1>
              <p className="text-xs" style={{ color: '#334155' }}>Android TV · All Screens</p>
            </div>
          </div>
          <button onClick={() => setShowAllTV(false)}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)', color: '#fff' }}>
            Back to Design
          </button>
        </div>
        <div className="px-8 py-10">
          {tvScreenGroups.map((group) => (
            <div key={group.label} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-5 rounded-full" style={{ background: group.color }} />
                <h2 className="text-lg font-black" style={{ color: '#f1f5f9' }}>{group.label}</h2>
                <div className="flex-1 h-px" style={{ background: '#0d1420' }} />
                <span className="text-xs" style={{ color: '#334155' }}>{group.items.length} screens</span>
              </div>
              <div className="flex flex-wrap gap-8">
                {group.items.map(({ id, label }) => (
                  <div key={id} className="flex flex-col items-center gap-3">
                    <div
                      className="cursor-pointer"
                      style={{ transform: 'scale(0.32)', transformOrigin: 'top center', height: 193 }}
                      onClick={() => { setTvScreen(id); setShowAllTV(false); }}
                    >
                      <TVFrame>{renderTVScreen(id, () => {})}</TVFrame>
                    </div>
                    <button
                      onClick={() => { setTvScreen(id); setShowAllTV(false); }}
                      className="text-xs font-semibold px-4 py-1.5 rounded-full"
                      style={{ background: '#0d1117', color: '#64748b', border: '1px solid #1e2838' }}>
                      {label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0a1628 0%, #030608 60%)' }}>
      {/* Top header */}
      <div className="w-full flex-shrink-0" style={{ borderBottom: '1px solid #0d1420' }}>
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NioLogo />
            <div>
              <h1 className="text-xl font-black leading-tight" style={{ color: '#f8fafc' }}>
                Maxx<span style={{ color: '#0ea5e9' }}>Player</span>
              </h1>
              <p className="text-xs" style={{ color: '#334155' }}>Universal Multiplatform Design</p>
            </div>
          </div>

          {/* Platform toggle */}
          <div className="flex items-center gap-1 p-1 rounded-2xl" style={{ background: '#0d1117', border: '1px solid #1e2838' }}>
            {([
              { id: 'mobile' as Platform, label: 'Mobile', icon: '📱' },
              { id: 'both' as Platform, label: 'Side by Side', icon: '⊞' },
              { id: 'tv' as Platform, label: 'Android TV', icon: '📺' },
            ]).map(({ id, label, icon }) => (
              <button
                key={id}
                onClick={() => setPlatform(id)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: platform === id ? 'linear-gradient(135deg, #0ea5e9, #0284c7)' : 'transparent',
                  color: platform === id ? '#fff' : '#475569',
                  boxShadow: platform === id ? '0 4px 14px rgba(14,165,233,0.35)' : 'none',
                }}
              >
                <span style={{ fontSize: 14 }}>{icon}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: '#0d1117', border: '1px solid #1e2838' }}>
              <div className="w-2 h-2 rounded-full" style={{ background: '#22c55e', boxShadow: '0 0 6px rgba(34,197,94,0.7)' }} />
              <span className="text-xs font-semibold" style={{ color: '#475569' }}>Interactive Prototype</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-auto">

        {/* ===== MOBILE ONLY ===== */}
        {platform === 'mobile' && (
          <div className="flex-1 flex gap-6 px-8 py-8 items-start">
            {/* Left sidebar */}
            <div className="hidden lg:flex flex-col gap-1 flex-shrink-0" style={{ width: 190 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: '#0ea5e9' }} />
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#334155', letterSpacing: '0.1em', fontSize: 10 }}>
                  Android Mobile
                </p>
              </div>
              {mobileScreenGroups.map((group) => (
                <div key={group.label} className="mb-3">
                  <div className="flex items-center gap-2 px-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: group.color }} />
                    <span className="text-xs font-bold uppercase" style={{ color: group.color, opacity: 0.8, fontSize: 10 }}>
                      {group.label}
                    </span>
                  </div>
                  {group.items.map(({ id, label }) => {
                    const isActive = mobileScreen === id;
                    return (
                      <button
                        key={id}
                        onClick={() => setMobileScreen(id)}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium mb-0.5"
                        style={{
                          background: isActive ? `${group.color}18` : 'transparent',
                          border: `1px solid ${isActive ? `${group.color}35` : 'transparent'}`,
                          color: isActive ? '#e2e8f0' : '#475569',
                        }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              ))}
              <button
                onClick={() => setShowAllMobile(true)}
                className="mt-2 w-full py-2 rounded-xl text-xs font-semibold"
                style={{ background: '#0d1117', color: '#475569', border: '1px solid #1e2838' }}>
                View All Screens
              </button>
            </div>

            {/* Phone frame */}
            <div className="flex flex-col items-center gap-4 mx-auto">
              <MobileFrame key={mobileScreen}>
                {renderMobileScreen(mobileScreen, setMobileScreen)}
              </MobileFrame>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#0d1117', border: '1px solid #1e2838' }}>
                <div className="w-2 h-2 rounded-full" style={{ background: '#0ea5e9' }} />
                <span className="text-xs font-semibold" style={{ color: '#64748b' }}>
                  {mobileScreenGroups.flatMap(g => g.items).find(i => i.id === mobileScreen)?.label ?? mobileScreen}
                </span>
              </div>
            </div>

            {/* Right quick nav */}
            <div className="hidden xl:flex flex-col gap-3 flex-shrink-0" style={{ width: 200 }}>
              <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#334155', letterSpacing: '0.1em', fontSize: 10 }}>Jump To</p>
              {mobileScreenGroups.map((group) => (
                <div key={group.label}>
                  <p className="text-xs font-semibold uppercase mb-1.5" style={{ color: group.color, opacity: 0.7, fontSize: 9 }}>{group.label}</p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {group.items.map(({ id, label }) => {
                      const isActive = mobileScreen === id;
                      return (
                        <button key={id} onClick={() => setMobileScreen(id)}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                          style={{
                            background: isActive ? `${group.color}20` : '#0d1117',
                            border: `1px solid ${isActive ? `${group.color}40` : '#1e2838'}`,
                            color: isActive ? group.color : '#475569',
                          }}>
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TV ONLY ===== */}
        {platform === 'tv' && (
          <div className="flex-1 flex gap-6 px-8 py-8 items-start overflow-auto">
            {/* Left sidebar */}
            <div className="hidden lg:flex flex-col gap-1 flex-shrink-0" style={{ width: 190 }}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
                <p className="text-xs font-black uppercase tracking-widest" style={{ color: '#334155', letterSpacing: '0.1em', fontSize: 10 }}>
                  Android TV
                </p>
              </div>
              {tvScreenGroups.map((group) => (
                <div key={group.label} className="mb-3">
                  <div className="flex items-center gap-2 px-2 mb-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: group.color }} />
                    <span className="text-xs font-bold uppercase" style={{ color: group.color, opacity: 0.8, fontSize: 10 }}>{group.label}</span>
                  </div>
                  {group.items.map(({ id, label }) => {
                    const isActive = tvScreen === id;
                    return (
                      <button key={id} onClick={() => setTvScreen(id)}
                        className="w-full text-left px-3 py-2 rounded-xl text-sm font-medium mb-0.5"
                        style={{
                          background: isActive ? `${group.color}18` : 'transparent',
                          border: `1px solid ${isActive ? `${group.color}35` : 'transparent'}`,
                          color: isActive ? '#e2e8f0' : '#475569',
                        }}>
                        {label}
                      </button>
                    );
                  })}
                </div>
              ))}
              <button onClick={() => setShowAllTV(true)}
                className="mt-2 w-full py-2 rounded-xl text-xs font-semibold"
                style={{ background: '#0d1117', color: '#475569', border: '1px solid #1e2838' }}>
                View All Screens
              </button>
            </div>

            {/* TV frame */}
            <div className="flex flex-col items-center gap-6 mx-auto" style={{ minWidth: 0, overflow: 'auto' }}>
              <div style={{ transform: 'scale(0.72)', transformOrigin: 'top center', height: 432 }}>
                <TVFrame key={activeTvScreen}>
                  {renderTVScreen(activeTvScreen, setTvScreen)}
                </TVFrame>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full" style={{ background: '#0d1117', border: '1px solid #1e2838', marginTop: -48 }}>
                <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
                <span className="text-xs font-semibold" style={{ color: '#64748b' }}>
                  {tvScreenGroups.flatMap(g => g.items).find(i => i.id === tvScreen)?.label ?? 'Home'} · Android TV
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ===== SIDE BY SIDE ===== */}
        {platform === 'both' && (
          <div className="flex-1 flex flex-col px-6 py-6 gap-6 overflow-auto">
            {/* Platform labels */}
            <div className="flex items-center justify-center gap-16 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#0ea5e9' }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#334155', letterSpacing: '0.1em', fontSize: 10 }}>Android Mobile</span>
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(14,165,233,0.08)', color: '#0ea5e9', border: '1px solid rgba(14,165,233,0.15)' }}>
                Universal Design System · Same Brand · Adaptive Layout
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#ef4444' }} />
                <span className="text-xs font-black uppercase tracking-widest" style={{ color: '#334155', letterSpacing: '0.1em', fontSize: 10 }}>Android TV</span>
              </div>
            </div>

            {/* Side by side frames */}
            <div className="flex items-start justify-center gap-12 flex-1">
              {/* Mobile column */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <MobileFrame key={mobileScreen}>
                  {renderMobileScreen(mobileScreen, setMobileScreen)}
                </MobileFrame>
                {/* Mobile screen nav pills */}
                <div className="flex flex-wrap gap-1.5 justify-center" style={{ maxWidth: 390 }}>
                  {['home', 'live-tv', 'movies', 'series', 'player', 'settings'].map((id) => {
                    const s = id as Screen;
                    const isActive = mobileScreen === s;
                    return (
                      <button key={s} onClick={() => setMobileScreen(s)}
                        className="text-xs font-semibold px-3 py-1 rounded-lg"
                        style={{
                          background: isActive ? 'rgba(14,165,233,0.15)' : '#0d1117',
                          border: `1px solid ${isActive ? 'rgba(14,165,233,0.35)' : '#1e2838'}`,
                          color: isActive ? '#0ea5e9' : '#475569',
                        }}>
                        {id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                      </button>
                    );
                  })}
                  <button onClick={() => setShowAllMobile(true)}
                    className="text-xs font-semibold px-3 py-1 rounded-lg"
                    style={{ background: '#0d1117', border: '1px solid #1e2838', color: '#334155' }}>
                    All...
                  </button>
                </div>
              </div>

              {/* Connecting lines */}
              <div className="flex flex-col items-center justify-center gap-4 self-center" style={{ paddingBottom: 60 }}>
                <div style={{ width: 1, height: 60, background: 'linear-gradient(180deg, transparent, #1e2838 50%, transparent)' }} />
                <div className="flex flex-col items-center gap-2 px-4 py-4 rounded-2xl" style={{ background: '#0d1117', border: '1px solid #1a2030' }}>
                  <div className="flex items-center justify-center rounded-full" style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}>
                    <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
                      <path d="M12 8L38 24L12 40V8Z" fill="white" />
                    </svg>
                  </div>
                  <span className="text-xs font-black" style={{ color: '#e2e8f0', fontSize: 9, letterSpacing: 1 }}>MAXX</span>
                  <div className="flex flex-col gap-1.5 items-center">
                    {[
                      { color: '#0ea5e9', label: 'Shared Data' },
                      { color: '#22c55e', label: 'Same Brand' },
                      { color: '#f59e0b', label: 'Adaptive UI' },
                    ].map(({ color, label }) => (
                      <div key={label} className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        <span style={{ color: '#475569', fontSize: 9, fontWeight: 600 }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ width: 1, height: 60, background: 'linear-gradient(180deg, transparent, #1e2838 50%, transparent)' }} />
              </div>

              {/* TV column */}
              <div className="flex flex-col items-center gap-3 flex-shrink-0">
                <div style={{ transform: 'scale(0.62)', transformOrigin: 'top center', height: 373 }}>
                  <TVFrame key={activeTvScreen}>
                    {renderTVScreen(activeTvScreen, setTvScreen)}
                  </TVFrame>
                </div>
                {/* TV screen nav pills */}
                <div className="flex flex-wrap gap-1.5 justify-center" style={{ maxWidth: 700, marginTop: -48 }}>
                  {tvScreenIds.map((id) => {
                    const isActive = tvScreen === id;
                    return (
                      <button key={id} onClick={() => setTvScreen(id)}
                        className="text-xs font-semibold px-3 py-1 rounded-lg"
                        style={{
                          background: isActive ? 'rgba(239,68,68,0.15)' : '#0d1117',
                          border: `1px solid ${isActive ? 'rgba(239,68,68,0.35)' : '#1e2838'}`,
                          color: isActive ? '#ef4444' : '#475569',
                        }}>
                        {id.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ')}
                      </button>
                    );
                  })}
                  <button onClick={() => setShowAllTV(true)}
                    className="text-xs font-semibold px-3 py-1 rounded-lg"
                    style={{ background: '#0d1117', border: '1px solid #1e2838', color: '#334155' }}>
                    All...
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom comparison strip */}
            <div className="flex-shrink-0 flex items-center justify-center gap-3 py-4 rounded-2xl mx-auto"
              style={{ background: '#0d1117', border: '1px solid #1a2030', width: '100%', maxWidth: 800 }}>
              {[
                { platform: 'Android Mobile', nav: 'Bottom Tab Bar', layout: 'Vertical Scroll', format: '390 × 844' },
                { platform: 'Android TV', nav: 'Left Side Rail', layout: 'Horizontal Shelf', format: '1920 × 1080' },
              ].map((item, i) => (
                <div key={item.platform} className="flex items-center gap-6">
                  {i > 0 && <div style={{ width: 1, height: 40, background: '#1e2838' }} />}
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-xs font-black" style={{ color: '#e2e8f0', fontSize: 11 }}>{item.platform}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: '#475569', fontSize: 10 }}>Nav: <span style={{ color: '#64748b' }}>{item.nav}</span></span>
                      <span className="text-xs" style={{ color: '#475569', fontSize: 10 }}>Layout: <span style={{ color: '#64748b' }}>{item.layout}</span></span>
                      <span className="text-xs" style={{ color: '#475569', fontSize: 10 }}>{item.format}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="w-full py-3 flex-shrink-0" style={{ borderTop: '1px solid #0d1420' }}>
        <p className="text-center text-xs" style={{ color: '#1e2838' }}>
          Maxx Player v1.0 · Universal Design · Android Mobile + Android TV · my.maxxplayer.com
        </p>
      </div>
    </div>
  );
}
