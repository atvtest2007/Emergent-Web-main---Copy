import { useState, useEffect } from 'react';
import { Content, Playlists, Account } from '@/lib/api';
import type { Channel, Movie, Series, Playlist } from '../types';

export function useMaxxData() {
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [seriesData, setSeriesData] = useState<Series[]>([]);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [epgData, setEpgData] = useState<any[]>([]);
  const [epgCategories, setEpgCategories] = useState<string[]>(['All']);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const activePlaylist = await Playlists.active();
        if (activePlaylist) {
          setPlaylists([{
            id: '1',
            name: activePlaylist.name || 'My IPTV',
            type: 'xtream',
            status: 'active',
            channelCount: 0,
            lastSync: 'Just now'
          }]);
        }

        const [live, vod, series] = await Promise.all([
          Content.streams("live").catch(() => []),
          Content.streams("vod").catch(() => []),
          Content.streams("series").catch(() => []),
        ]);

        if (!mounted) return;

        // Map Live TV
        const mappedChannels: Channel[] = live.slice(0, 100).map((c: any) => ({
          id: String(c.stream_id),
          name: c.name,
          logo: c.stream_icon || 'https://images.pexels.com/photos/274506/pexels-photo-274506.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&dpr=1',
          category: c.category_name || 'Live TV',
          currentProgram: 'Live Program',
          nextProgram: 'Next Program',
          isFavorite: false
        }));

        // Map Movies
        const mappedMovies: Movie[] = vod.slice(0, 100).map((m: any) => ({
          id: String(m.stream_id),
          title: m.name,
          poster: m.stream_icon || 'https://images.pexels.com/photos/7234213/pexels-photo-7234213.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1',
          genre: 'VOD',
          year: parseInt(m.year || '2024'),
          rating: parseFloat(m.rating || '8.0'),
          duration: '2h 0m',
          synopsis: m.plot || 'Movie description not available.',
          isFavorite: false
        }));

        // Map Series
        const mappedSeries: Series[] = series.slice(0, 100).map((s: any) => ({
          id: String(s.series_id),
          title: s.name,
          poster: s.cover || 'https://images.pexels.com/photos/6615261/pexels-photo-6615261.jpeg?auto=compress&cs=tinysrgb&w=300&h=450&dpr=1',
          genre: 'Series',
          year: parseInt(s.year || '2024'),
          rating: parseFloat(s.rating || '8.0'),
          synopsis: s.plot || 'Series description not available.',
          seasons: 1,
          isFavorite: false
        }));

        setChannels(mappedChannels);
        setMovies(mappedMovies);
        setSeriesData(mappedSeries);

        // Simple EPG mapping for UI sake
        setEpgData(mappedChannels.slice(0, 20).map(c => ({
          channel: c.name,
          logo: c.logo,
          now: 'Live Broadcast',
          nowTime: 'Now',
          next: 'Next Program',
          nextTime: 'Later'
        })));

      } catch (err) {
        console.error("Failed to load Maxx data", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    return () => { mounted = false; };
  }, []);

  return { loading, channels, movies, seriesData, playlists, epgData, epgCategories };
}
