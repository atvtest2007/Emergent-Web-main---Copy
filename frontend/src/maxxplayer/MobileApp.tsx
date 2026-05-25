import React, { useState } from 'react';
import type { Screen } from './types';
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

export function MobileApp() {
  const [screen, setScreen] = useState<Screen>('home');

  const handleNavigate = (s: string) => setScreen(s as Screen);

  const renderScreen = () => {
    switch (screen) {
      case 'splash': return <SplashScreen />;
      case 'login': return <LoginScreen onNavigate={handleNavigate} />;
      case 'activation': return <LoginScreen onNavigate={handleNavigate} />;
      case 'playlist-select': return <PlaylistScreen onNavigate={handleNavigate} />;
      case 'home': return <HomeScreen onNavigate={handleNavigate} />;
      case 'live-tv': return <LiveTVScreen onNavigate={handleNavigate} />;
      case 'movies': return <MoviesScreen onNavigate={handleNavigate} />;
      case 'movie-detail': return <MovieDetailScreen onNavigate={handleNavigate} />;
      case 'series': return <SeriesScreen onNavigate={handleNavigate} />;
      case 'series-detail': return <SeriesDetailScreen onNavigate={handleNavigate} />;
      case 'epg': return <EPGScreen onNavigate={handleNavigate} />;
      case 'catchup': return <CatchUpScreen onNavigate={handleNavigate} />;
      case 'favorites': return <FavoritesScreen onNavigate={handleNavigate} />;
      case 'search': return <SearchScreen onNavigate={handleNavigate} />;
      case 'sports': return <SportsScreen onNavigate={handleNavigate} />;
      case 'settings': return <SettingsScreen onNavigate={handleNavigate} />;
      case 'player': return <PlayerScreen onNavigate={handleNavigate} />;
      default: return <HomeScreen onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="w-full h-screen overflow-hidden text-white" style={{ background: '#080c14' }}>
      {renderScreen()}
    </div>
  );
}
