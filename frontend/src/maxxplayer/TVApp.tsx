import React, { useState } from 'react';
import type { Screen } from './types';
import TVSplashScreen from './screens/tv/TVSplashScreen';
import TVLoginScreen from './screens/tv/TVLoginScreen';
import TVPlaylistScreen from './screens/tv/TVPlaylistScreen';
import TVHomeScreen from './screens/tv/TVHomeScreen';
import TVLiveTVScreen from './screens/tv/TVLiveTVScreen';
import TVMoviesScreen from './screens/tv/TVMoviesScreen';
import TVSeriesScreen from './screens/tv/TVSeriesScreen';
import TVSettingsScreen from './screens/tv/TVSettingsScreen';
import TVPlayerScreen from './screens/tv/TVPlayerScreen';

export function TVApp() {
  const [screen, setScreen] = useState<Screen>('home');

  const handleNavigate = (s: string) => setScreen(s as Screen);

  const renderScreen = () => {
    switch (screen) {
      case 'splash': return <TVSplashScreen onNavigate={handleNavigate} />;
      case 'login': return <TVLoginScreen onNavigate={handleNavigate} />;
      case 'activation': return <TVLoginScreen onNavigate={handleNavigate} />;
      case 'playlist-select': return <TVPlaylistScreen onNavigate={handleNavigate} />;
      case 'home': return <TVHomeScreen onNavigate={handleNavigate} />;
      case 'live-tv': return <TVLiveTVScreen onNavigate={handleNavigate} />;
      case 'movies': return <TVMoviesScreen onNavigate={handleNavigate} />;
      case 'series': return <TVSeriesScreen onNavigate={handleNavigate} />;
      case 'settings': return <TVSettingsScreen onNavigate={handleNavigate} />;
      case 'player': return <TVPlayerScreen onNavigate={handleNavigate} />;
      default: return <TVHomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden text-white" style={{ background: '#080c14' }}>
      {renderScreen()}
    </div>
  );
}
