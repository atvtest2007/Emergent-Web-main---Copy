export type Screen =
  | 'splash'
  | 'login'
  | 'activation'
  | 'playlist-select'
  | 'home'
  | 'live-tv'
  | 'movies'
  | 'movie-detail'
  | 'series'
  | 'series-detail'
  | 'epg'
  | 'catchup'
  | 'favorites'
  | 'search'
  | 'sports'
  | 'settings'
  | 'player';

export interface Channel {
  id: string;
  name: string;
  logo: string;
  category: string;
  currentProgram: string;
  nextProgram: string;
  isFavorite: boolean;
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  genre: string;
  year: number;
  rating: number;
  duration: string;
  synopsis: string;
  isFavorite: boolean;
}

export interface Series {
  id: string;
  title: string;
  poster: string;
  genre: string;
  year: number;
  rating: number;
  synopsis: string;
  seasons: number;
  isFavorite: boolean;
}

export interface Playlist {
  id: string;
  name: string;
  type: 'xtream' | 'm3u' | 'activation';
  status: 'active' | 'syncing' | 'error';
  channelCount: number;
  lastSync: string;
}
